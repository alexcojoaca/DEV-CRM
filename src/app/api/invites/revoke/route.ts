import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, requireRole } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const { role, ...ctx } = await requireMembership();
    requireRole(role, ["OWNER", "MANAGER"]);

    const body = await request.json();
    const inviteId = typeof body.inviteId === "string" ? body.inviteId : null;
    if (!inviteId) {
      return NextResponse.json({ error: "inviteId required" }, { status: 400 });
    }

    const invite = await prisma.workspaceInvite.findFirst({
      where: { id: inviteId, workspaceId: ctx.activeWorkspaceId, status: "PENDING" },
    });
    if (!invite) {
      return NextResponse.json({ error: "Invite not found or already handled" }, { status: 404 });
    }

    await prisma.workspaceInvite.update({
      where: { id: inviteId },
      data: { status: "REVOKED" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Invite revoke error:", e);
    return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 });
  }
}
