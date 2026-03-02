import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, canAccessByAssignment } from "@/features/scoping";
import { getStorageService } from "@/features/files/localStorage";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";

function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer | Uint8Array) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { role, activeWorkspaceId, user } = await requireMembership();
    const { id } = await params;

    const asset = await prisma.fileAsset.findUnique({
      where: { id },
    });
    if (!asset || asset.workspaceId !== activeWorkspaceId) {
      throw new NotFoundError("File not found");
    }
    if (asset.ownerUserId && !canAccessByAssignment(role, user.id, asset.ownerUserId)) {
      throw new ForbiddenError();
    }

    const storage = getStorageService();
    const stream = await storage.getFileStream(asset.storagePath);
    if (!stream) {
      throw new NotFoundError("File not found on disk");
    }

    const buffer = await streamToBuffer(stream);
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": asset.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(asset.originalFileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("File download error:", e);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
