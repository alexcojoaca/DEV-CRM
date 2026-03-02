import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/features/scoping";
import { encodeSession, getSessionCookieConfig } from "@/features/auth/session";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const workspaceId = typeof body.workspaceId === "string" ? body.workspaceId : null;
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId required" }, { status: 400 });
    }
    const membership = session.memberships.find((m) => m.workspaceId === workspaceId);
    if (!membership) {
      return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
    }
    const newSession = { ...session, activeWorkspaceId: workspaceId };
    const token = await encodeSession(newSession);
    const config = getSessionCookieConfig();
    const res = NextResponse.json({ ok: true, activeWorkspaceId: workspaceId });
    res.cookies.set(config.name, token, config);
    return res;
  } catch (e) {
    console.error("Set workspace error:", e);
    return NextResponse.json({ error: "Failed to set workspace" }, { status: 500 });
  }
}
