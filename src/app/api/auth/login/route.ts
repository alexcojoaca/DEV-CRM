import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { encodeSession, getSessionCookieConfig } from "@/features/auth/session";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
      console.error("Login: SESSION_SECRET is missing or too short (min 32 characters). Set it in Vercel → Project → Settings → Environment Variables.");
      return NextResponse.json(
        { error: "Autentificarea nu este configurată pe server. Administrator: adaugă SESSION_SECRET (min. 32 caractere) în variabilele de mediu (ex. Vercel)." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const memberships = await prisma.workspaceMembership.findMany({
      where: { userId: user.id },
      include: { workspace: true },
    });

    const session = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      memberships: memberships.map((m) => ({
        workspaceId: m.workspaceId,
        workspaceName: m.workspace.name,
        role: m.role,
      })),
      activeWorkspaceId: memberships.length === 1 ? memberships[0].workspaceId : null,
    };

    const token = await encodeSession(session);
    const config = getSessionCookieConfig();

    const res = NextResponse.json({
      ok: true,
      user: session.user,
      memberships: session.memberships,
      activeWorkspaceId: session.activeWorkspaceId,
    });
    res.cookies.set(config.name, token, config);
    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
