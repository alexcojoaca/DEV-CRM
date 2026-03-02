import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/features/auth/session";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ session: null }, { status: 200 });
  }
  const activeMembership = session.activeWorkspaceId
    ? session.memberships.find((m) => m.workspaceId === session.activeWorkspaceId)
    : null;
  const payload = {
    ...session,
    activeRole: activeMembership?.role ?? null,
    activeWorkspaceName: activeMembership?.workspaceName ?? null,
  };
  return NextResponse.json({ session: payload });
}
