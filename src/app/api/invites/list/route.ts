import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/features/scoping";
import { UnauthorizedError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await requireAuth();
    const invites = await prisma.workspaceInvite.findMany({
      where: { invitedEmail: session.user.email.toLowerCase(), status: "PENDING" },
      include: { workspace: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      invites: invites.map((i) => ({
        id: i.id,
        workspaceId: i.workspaceId,
        workspaceName: i.workspace.name,
        role: i.role,
        createdAt: i.createdAt,
      })),
    });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    console.error("List invites error:", e);
    return NextResponse.json({ error: "Failed to list invites" }, { status: 500 });
  }
}
