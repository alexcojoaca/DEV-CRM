import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
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

export async function GET() {
  try {
    const { activeWorkspaceId } = await requireMembership();
    const viewings = await prisma.viewing.findMany({
      where: { workspaceId: activeWorkspaceId },
      orderBy: { scheduledAt: "asc" },
    });
    return NextResponse.json(viewings.map(toFrontendViewing));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Viewings list error:", e);
    return NextResponse.json({ error: "Failed to load viewings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { activeWorkspaceId, user } = await requireMembership();
    const body = (await request.json()) as {
      propertyId?: string;
      clientId?: string;
      dealId?: string;
      propertyNameFree?: string;
      clientNameFree?: string;
      clientPhoneFree?: string;
      viewingType?: ViewingType;
      address?: string;
      ownerName?: string;
      ownerPhone?: string;
      scheduledAt?: string;
      status?: ViewingStatus;
      notes?: string;
    };

    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    if (body.scheduledAt && Number.isNaN(scheduledAt!.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 });
    }

    const created = await prisma.viewing.create({
      data: {
        workspaceId: activeWorkspaceId,
        createdByUserId: user.id,
        assignedToUserId: user.id,
        propertyId: body.propertyId ?? null,
        clientId: body.clientId ?? null,
        dealId: body.dealId ?? null,
        propertyNameFree: body.propertyNameFree?.trim() || null,
        clientNameFree: body.clientNameFree?.trim() || null,
        clientPhoneFree: body.clientPhoneFree?.trim() || null,
        viewingType: body.viewingType ?? null,
        address: body.address?.trim() || null,
        ownerName: body.ownerName?.trim() || null,
        ownerPhone: body.ownerPhone?.trim() || null,
        scheduledAt,
        status: body.status ?? "scheduled",
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(toFrontendViewing(created));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Viewing create error:", e);
    return NextResponse.json({ error: "Failed to save viewing" }, { status: 500 });
  }
}

