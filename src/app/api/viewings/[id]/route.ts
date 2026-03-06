import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, canAccessByAssignment } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";
import type { ViewingStatus, ViewingType } from "@/features/viewings/viewingTypes";

function toFrontendViewing(row: {
  id: string;
  workspaceId: string;
  propertyId: string | null;
  clientId: string | null;
  dealId: string | null;
  assignedToUserId: string | null;
  createdByUserId: string;
  propertyNameFree: string | null;
  clientNameFree: string | null;
  clientPhoneFree: string | null;
  viewingType: string | null;
  address: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  scheduledAt: Date | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    propertyId: row.propertyId ?? undefined,
    clientId: row.clientId ?? undefined,
    dealId: row.dealId ?? undefined,
    propertyNameFree: row.propertyNameFree ?? undefined,
    clientNameFree: row.clientNameFree ?? undefined,
    clientPhoneFree: row.clientPhoneFree ?? undefined,
    viewingType: (row.viewingType ?? undefined) as ViewingType | undefined,
    address: row.address ?? undefined,
    ownerName: row.ownerName ?? undefined,
    ownerPhone: row.ownerPhone ?? undefined,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    status: row.status as ViewingStatus,
    notes: row.notes ?? undefined,
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

    const existing = await prisma.viewing.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Viewing not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }

    const body = (await request.json()) as Partial<{
      propertyId: string;
      clientId: string;
      dealId: string;
      propertyNameFree: string;
      clientNameFree: string;
      clientPhoneFree: string;
      viewingType: ViewingType;
      address: string;
      ownerName: string;
      ownerPhone: string;
      scheduledAt: string;
      status: ViewingStatus;
      notes: string;
    }>;

    const data: Record<string, unknown> = {
      propertyId: body.propertyId ?? undefined,
      clientId: body.clientId ?? undefined,
      dealId: body.dealId ?? undefined,
      propertyNameFree: body.propertyNameFree !== undefined ? (body.propertyNameFree?.trim() || null) : undefined,
      clientNameFree: body.clientNameFree !== undefined ? (body.clientNameFree?.trim() || null) : undefined,
      clientPhoneFree: body.clientPhoneFree !== undefined ? (body.clientPhoneFree?.trim() || null) : undefined,
      viewingType: body.viewingType ?? undefined,
      address: body.address !== undefined ? (body.address?.trim() || null) : undefined,
      ownerName: body.ownerName !== undefined ? (body.ownerName?.trim() || null) : undefined,
      ownerPhone: body.ownerPhone !== undefined ? (body.ownerPhone?.trim() || null) : undefined,
      status: body.status ?? undefined,
      notes: body.notes !== undefined ? (body.notes?.trim() || null) : undefined,
    };

    if (body.scheduledAt !== undefined) {
      const d = body.scheduledAt ? new Date(body.scheduledAt) : null;
      if (d && Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 });
      }
      data.scheduledAt = d;
    }

    const updated = await prisma.viewing.update({
      where: { id },
      data,
    });

    return NextResponse.json(toFrontendViewing(updated));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Viewing update error:", e);
    return NextResponse.json({ error: "Failed to update viewing" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { id } = await params;

    const existing = await prisma.viewing.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Viewing not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }

    await prisma.viewing.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Viewing delete error:", e);
    return NextResponse.json({ error: "Failed to delete viewing" }, { status: 500 });
  }
}

