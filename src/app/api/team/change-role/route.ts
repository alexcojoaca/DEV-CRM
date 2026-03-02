import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, requireRole } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { z } from "zod";

const bodySchema = z.object({
  userId: z.string(),
  role: z.enum(["MANAGER", "AGENT"]),
});

export async function POST(request: Request) {
  try {
    const { role: currentRole, activeWorkspaceId } = await requireMembership();
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { userId, role: newRole } = parsed.data;

    const target = await prisma.workspaceMembership.findUnique({
      where: { workspaceId_userId: { workspaceId: activeWorkspaceId, userId } },
    });
    if (!target) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    if (target.role === "OWNER") {
      return NextResponse.json({ error: "Cannot change owner role" }, { status: 400 });
    }
    if (currentRole === "MANAGER" && ["OWNER", "MANAGER"].includes(target.role)) {
      return NextResponse.json({ error: "Manager can only change AGENT roles" }, { status: 403 });
    }
    if (currentRole === "MANAGER" && newRole === "MANAGER") {
      return NextResponse.json({ error: "Manager cannot assign MANAGER role" }, { status: 403 });
    }

    await prisma.workspaceMembership.update({
      where: { workspaceId_userId: { workspaceId: activeWorkspaceId, userId } },
      data: { role: newRole },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Change role error:", e);
    return NextResponse.json({ error: "Failed to change role" }, { status: 500 });
  }
}
