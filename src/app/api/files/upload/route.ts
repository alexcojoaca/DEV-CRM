import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { getStorageService } from "@/features/files/localStorage";
import { UnauthorizedError, ForbiddenError, QuotaExceededError } from "@/lib/errors";

const DEFAULT_USER_QUOTA_BYTES = 1073741824; // 1GB

async function ensureQuota(workspaceId: string, userId: string, additionalBytes: number) {
  const key = { workspaceId, userId };
  let quota = await prisma.storageQuota.findUnique({
    where: { workspaceId_userId: key },
  });
  if (!quota) {
    quota = await prisma.storageQuota.create({
      data: {
        workspaceId,
        userId,
        bytesLimit: BigInt(DEFAULT_USER_QUOTA_BYTES),
        bytesUsed: BigInt(0),
      },
    });
  }
  if (Number(quota.bytesUsed) + additionalBytes > Number(quota.bytesLimit)) {
    throw new QuotaExceededError();
  }
}

export async function POST(request: Request) {
  try {
    const { activeWorkspaceId, user } = await requireMembership();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const entityType = formData.get("entityType") as string;
    const entityId = (formData.get("entityId") as string) || null;
    const kind = (formData.get("kind") as string) || "OTHER";

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sizeBytes = buffer.length;
    await ensureQuota(activeWorkspaceId, user.id, sizeBytes);

    const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "bin");
    const uuid = crypto.randomUUID();
    const storagePath =
      entityType === "LISTING" && entityId
        ? `workspaces/${activeWorkspaceId}/listings/${entityId}/attachments/${uuid}.${ext}`
        : entityType === "USER"
          ? `workspaces/${activeWorkspaceId}/users/${user.id}/docs/${uuid}.${ext}`
          : `workspaces/${activeWorkspaceId}/other/${uuid}.${ext}`;

    const storage = getStorageService();
    await storage.uploadFile(storagePath, buffer, file.type || "application/octet-stream");

    const asset = await prisma.fileAsset.create({
      data: {
        workspaceId: activeWorkspaceId,
        ownerUserId: user.id,
        entityType: (entityType as "LISTING" | "USER" | "CLIENT" | "DEAL" | "OTHER") || "OTHER",
        entityId,
        kind: (kind as "IMAGE" | "PDF" | "DOC" | "OTHER") || "OTHER",
        storagePath,
        originalFileName: file.name,
        sizeBytes,
        mimeType: file.type || "application/octet-stream",
      },
    });

    await prisma.storageQuota.update({
      where: { workspaceId_userId: { workspaceId: activeWorkspaceId, userId: user.id } },
      data: { bytesUsed: { increment: BigInt(sizeBytes) } },
    });

    return NextResponse.json({ id: asset.id, storagePath, sizeBytes });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof QuotaExceededError) return NextResponse.json({ error: "Storage quota exceeded" }, { status: 413 });
    const message = e instanceof Error ? e.message : "Upload failed";
    console.error("Upload error:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
