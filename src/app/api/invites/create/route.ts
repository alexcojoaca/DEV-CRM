import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, requireRole } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError, BadRequestError } from "@/lib/errors";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["MANAGER", "AGENT"]),
});

export async function POST(request: Request) {
  try {
    const { role: currentRole, ...ctx } = await requireMembership();
    requireRole(currentRole, ["OWNER", "MANAGER"]);

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, role } = parsed.data;
    const invitedEmail = email.toLowerCase();

    const userWithEmail = await prisma.user.findUnique({ where: { email: invitedEmail } });
    if (userWithEmail) {
      const existingMembership = await prisma.workspaceMembership.findUnique({
        where: { workspaceId_userId: { workspaceId: ctx.activeWorkspaceId, userId: userWithEmail.id } },
      });
      if (existingMembership) {
        return NextResponse.json({ error: "Utilizatorul este deja membru al echipei" }, { status: 400 });
      }
    }

    const pendingInvite = await prisma.workspaceInvite.findFirst({
      where: {
        workspaceId: ctx.activeWorkspaceId,
        invitedEmail,
        status: "PENDING",
      },
    });
    if (pendingInvite) {
      return NextResponse.json({ error: "Invite already pending" }, { status: 400 });
    }

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: ctx.activeWorkspaceId,
        invitedEmail,
        role,
        invitedByUserId: ctx.user.id,
        status: "PENDING",
      },
    });
    // Optional: send email with link to accept (e.g. /invites or /app/invites). Integrate Resend/SendGrid here.
    return NextResponse.json({ id: invite.id, email: invitedEmail, role: invite.role });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof BadRequestError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("Invite create error:", e);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
