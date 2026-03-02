import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError } from "@/lib/errors";

export async function GET() {
  try {
    const { activeWorkspaceId } = await requireMembership();
    const members = await prisma.workspaceMembership.findMany({
      where: { workspaceId: activeWorkspaceId },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
    const pendingInvites = await prisma.workspaceInvite.findMany({
      where: { workspaceId: activeWorkspaceId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      members: members.map((m) => ({
        userId: m.userId,
        email: m.user.email,
        fullName: m.user.fullName,
        role: m.role,
      })),
      pendingInvites: pendingInvites.map((i) => ({
        id: i.id,
        email: i.invitedEmail,
        role: i.role,
        createdAt: i.createdAt,
      })),
    });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    console.error("List team error:", e);
    return NextResponse.json({ error: "Failed to list team" }, { status: 500 });
  }
}
