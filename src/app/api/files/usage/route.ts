import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError } from "@/lib/errors";

export async function GET() {
  try {
    const { activeWorkspaceId, user } = await requireMembership();
    const quota = await prisma.storageQuota.findUnique({
      where: { workspaceId_userId: { workspaceId: activeWorkspaceId, userId: user.id } },
    });
    const bytesLimit = quota ? Number(quota.bytesLimit) : 1073741824;
    const bytesUsed = quota ? Number(quota.bytesUsed) : 0;
    return NextResponse.json({ bytesLimit, bytesUsed });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    console.error("Storage usage error:", e);
    return NextResponse.json({ error: "Failed to get usage" }, { status: 500 });
  }
}
