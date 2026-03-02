import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/features/scoping";
import { encodeSession, getSessionCookieConfig } from "@/features/auth/session";
import { z } from "zod";

const bodySchema = z.object({ name: z.string().min(1).max(200) });

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    const workspace = await prisma.workspace.create({
      data: { name: parsed.data.name.trim() },
    });
    await prisma.workspaceMembership.create({
      data: {
        workspaceId: workspace.id,
        userId: session.user.id,
        role: "OWNER",
      },
    });
    await prisma.storageQuota.create({
      data: {
        workspaceId: workspace.id,
        userId: null,
        bytesLimit: BigInt(1073741824),
        bytesUsed: BigInt(0),
      },
    });

    // Actualizează sesiunea: adaugă noul workspace și setează-l ca activ
    const newMembership = {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      role: "OWNER" as const,
    };
    const newSession = {
      user: session.user,
      memberships: [...session.memberships, newMembership],
      activeWorkspaceId: workspace.id,
    };
    const token = await encodeSession(newSession);
    const config = getSessionCookieConfig();

    const res = NextResponse.json({ id: workspace.id, name: workspace.name });
    res.cookies.set(config.name, token, config);
    return res;
  } catch (e) {
    console.error("Create workspace error:", e);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
