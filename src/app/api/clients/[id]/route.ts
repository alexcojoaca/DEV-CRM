import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, canAccessByAssignment } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";

function toFrontendClient(row: {
  id: string;
  workspaceId: string;
  assignedToUserId: string | null;
  createdByUserId: string | null;
  transactionType: string;
  propertyType: string;
  name: string;
  phone: string;
  email: string | null;
  county: string | null;
  zone: string | null;
  roomsMin: number | null;
  roomsMax: number | null;
  surfaceMin: number | null;
  surfaceMax: number | null;
  budgetMin: number | null;
  budgetMax: number | null;
  constructionYearMin: number | null;
  status: string;
  source: string;
  notes: string | null;
  lastContactedAt: Date | null;
  followUpCount: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    transactionType: row.transactionType as import("@prisma/client").Client["transactionType"],
    propertyType: row.propertyType as import("@prisma/client").Client["propertyType"],
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    county: row.county ?? undefined,
    zone: row.zone ?? undefined,
    roomsMin: row.roomsMin ?? undefined,
    roomsMax: row.roomsMax ?? undefined,
    surfaceMin: row.surfaceMin ?? undefined,
    surfaceMax: row.surfaceMax ?? undefined,
    budgetMin: row.budgetMin ?? undefined,
    budgetMax: row.budgetMax ?? undefined,
    constructionYearMin: row.constructionYearMin ?? undefined,
    status: row.status as import("@prisma/client").Client["status"],
    source: row.source as import("@prisma/client").Client["source"],
    notes: row.notes ?? undefined,
    lastContactedAt: row.lastContactedAt ? row.lastContactedAt.toISOString() : null,
    followUpCount: row.followUpCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { id } = await params;

    const existing = await prisma.client.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Client not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }

    const body = (await request.json()) as Partial<{
      transactionType: string;
      propertyType: string;
      name: string;
      phone: string;
      email: string;
      county: string;
      zone: string;
      roomsMin: number;
      roomsMax: number;
      surfaceMin: number;
      surfaceMax: number;
      budgetMin: number;
      budgetMax: number;
      constructionYearMin: number;
      status: string;
      source: string;
      notes: string;
      lastContactedAt: string;
      followUpCount: number;
    }>;

    const data: Record<string, unknown> = {
      transactionType: body.transactionType ?? undefined,
      propertyType: body.propertyType ?? undefined,
      name: body.name !== undefined ? body.name.trim() : undefined,
      phone: body.phone !== undefined ? body.phone.trim() : undefined,
      email: body.email !== undefined ? (body.email?.trim() || null) : undefined,
      county: body.county !== undefined ? (body.county?.trim() || null) : undefined,
      zone: body.zone !== undefined ? (body.zone?.trim() || null) : undefined,
      roomsMin: body.roomsMin ?? undefined,
      roomsMax: body.roomsMax ?? undefined,
      surfaceMin: body.surfaceMin ?? undefined,
      surfaceMax: body.surfaceMax ?? undefined,
      budgetMin: body.budgetMin ?? undefined,
      budgetMax: body.budgetMax ?? undefined,
      constructionYearMin: body.constructionYearMin ?? undefined,
      status: body.status ?? undefined,
      source: body.source ?? undefined,
      notes: body.notes !== undefined ? (body.notes?.trim() || null) : undefined,
      lastContactedAt: body.lastContactedAt !== undefined ? (body.lastContactedAt ? new Date(body.lastContactedAt) : null) : undefined,
      followUpCount: body.followUpCount ?? undefined,
    };

    const updated = await prisma.client.update({
      where: { id },
      data,
    });

    return NextResponse.json(toFrontendClient(updated));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Client update error:", e);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { id } = await params;

    const existing = await prisma.client.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Client not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }

    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Client delete error:", e);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}

