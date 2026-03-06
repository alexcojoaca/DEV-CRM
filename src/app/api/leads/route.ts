import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

function toFrontendLead(row: {
  id: string;
  name: string;
  phone: string;
  location: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    location: row.location ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const { activeWorkspaceId } = await requireMembership();
    const leads = await prisma.lead.findMany({
      where: { workspaceId: activeWorkspaceId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(leads.map(toFrontendLead));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Leads list error:", e);
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { activeWorkspaceId, user } = await requireMembership();
    const body = (await request.json()) as { name?: string; phone?: string; location?: string; notes?: string };

    const name = (body.name ?? "").trim();
    const phone = (body.phone ?? "").trim();
    if (!name && !phone) {
      return NextResponse.json({ error: "Name or phone is required" }, { status: 400 });
    }

    const created = await prisma.lead.create({
      data: {
        workspaceId: activeWorkspaceId,
        createdByUserId: user.id,
        name,
        phone,
        location: body.location?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(toFrontendLead(created));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Lead create error:", e);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}

