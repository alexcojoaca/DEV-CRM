import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, requireRole } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const { role, activeWorkspaceId } = await requireMembership();
    requireRole(role, ["OWNER"]);

    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId : null;
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const membership = await prisma.workspaceMembership.findUnique({
      where: { workspaceId_userId: { workspaceId: activeWorkspaceId, userId } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    if (membership.role === "OWNER") {
      return NextResponse.json({ error: "Cannot remove workspace owner" }, { status: 400 });
    }

    await prisma.workspaceMembership.delete({
      where: { workspaceId_userId: { workspaceId: activeWorkspaceId, userId } },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Remove member error:", e);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
