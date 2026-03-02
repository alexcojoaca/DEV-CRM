import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const inviteId = typeof body.inviteId === "string" ? body.inviteId : null;
    if (!inviteId) {
      return NextResponse.json({ error: "inviteId required" }, { status: 400 });
    }

    const invite = await prisma.workspaceInvite.findUnique({
      where: { id: inviteId },
      include: { workspace: true },
    });
    if (!invite || invite.status !== "PENDING") {
      return NextResponse.json({ error: "Invite not found or no longer valid" }, { status: 404 });
    }
    if (invite.invitedEmail.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json({ error: "This invite was sent to another email" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.workspaceInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      }),
      prisma.workspaceMembership.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: session.user.id,
          role: invite.role,
        },
      }),
    ]);

    return NextResponse.json({ ok: true, workspaceId: invite.workspaceId, workspaceName: invite.workspace.name });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Invite accept error:", e);
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 });
  }
}
