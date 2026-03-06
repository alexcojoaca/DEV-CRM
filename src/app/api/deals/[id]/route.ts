import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, canAccessByAssignment } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";
import type { DealStatus, DealTransactionType, DealSide, DealOffer, DealPropertyMatch, DealDocumentAttachment, DealChecklistItem, DealEvent } from "@/features/deals/dealTypes";

function toFrontendDeal(row: {
  id: string;
  workspaceId: string;
  assignedToUserId: string | null;
  createdByUserId: string | null;
  title: string | null;
  clientId: string | null;
  clientNameFree: string | null;
  clientPhoneFree: string | null;
  clientEmailFree: string | null;
  transactionType: string;
  side: string;
  status: string;
  mainPropertyId: string | null;
  mainPropertyTitle: string | null;
  mainPropertyPrice: number | null;
  commissionPercent: number | null;
  commissionReceivedTotal: number | null;
  listingPrice: number | null;
  delistPrice: number | null;
  notes: string | null;
  offersJson: unknown;
  matchedPropertiesJson: unknown;
  documentsJson: unknown;
  checklistJson: unknown;
  eventsJson: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title ?? undefined,
    clientId: row.clientId ?? undefined,
    clientNameFree: row.clientNameFree ?? undefined,
    clientPhoneFree: row.clientPhoneFree ?? undefined,
    clientEmailFree: row.clientEmailFree ?? undefined,
    transactionType: row.transactionType as DealTransactionType,
    side: row.side as DealSide,
    status: row.status as DealStatus,
    mainPropertyId: row.mainPropertyId ?? undefined,
    mainPropertyTitle: row.mainPropertyTitle ?? undefined,
    mainPropertyPrice: row.mainPropertyPrice ?? undefined,
    commissionPercent: row.commissionPercent ?? undefined,
    commissionReceivedTotal: row.commissionReceivedTotal ?? undefined,
    listingPrice: row.listingPrice ?? undefined,
    delistPrice: row.delistPrice ?? undefined,
    notes: row.notes ?? undefined,
    offersJson: row.offersJson ?? [],
    matchedPropertiesJson: row.matchedPropertiesJson ?? [],
    documentsJson: row.documentsJson ?? [],
    checklistJson: row.checklistJson ?? [],
    eventsJson: row.eventsJson ?? [],
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

    const existing = await prisma.deal.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Deal not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }

    const body = (await request.json()) as Partial<{
      title: string;
      clientId: string;
      clientNameFree: string;
      clientPhoneFree: string;
      clientEmailFree: string;
      transactionType: DealTransactionType;
      side: DealSide;
      status: DealStatus;
      mainPropertyId: string;
      mainPropertyTitle: string;
      mainPropertyPrice: number;
      commissionPercent: number;
      commissionReceivedTotal: number;
      listingPrice: number;
      delistPrice: number;
      notes: string;
      offers: DealOffer[];
      matchedProperties: DealPropertyMatch[];
      documents: DealDocumentAttachment[];
      checklist: DealChecklistItem[];
      events: DealEvent[];
    }>;

    const data: Record<string, unknown> = {
      title: body.title !== undefined ? (body.title?.trim() || null) : undefined,
      clientId: body.clientId !== undefined ? body.clientId || null : undefined,
      clientNameFree: body.clientNameFree !== undefined ? (body.clientNameFree?.trim() || null) : undefined,
      clientPhoneFree: body.clientPhoneFree !== undefined ? (body.clientPhoneFree?.trim() || null) : undefined,
      clientEmailFree: body.clientEmailFree !== undefined ? (body.clientEmailFree?.trim() || null) : undefined,
      transactionType: body.transactionType ?? undefined,
      side: body.side ?? undefined,
      status: body.status ?? undefined,
      mainPropertyId: body.mainPropertyId !== undefined ? body.mainPropertyId || null : undefined,
      mainPropertyTitle: body.mainPropertyTitle !== undefined ? (body.mainPropertyTitle?.trim() || null) : undefined,
      mainPropertyPrice: body.mainPropertyPrice ?? undefined,
      commissionPercent: body.commissionPercent ?? undefined,
      commissionReceivedTotal: body.commissionReceivedTotal ?? undefined,
      listingPrice: body.listingPrice ?? undefined,
      delistPrice: body.delistPrice ?? undefined,
      notes: body.notes !== undefined ? (body.notes?.trim() || null) : undefined,
      offersJson: body.offers ?? undefined,
      matchedPropertiesJson: body.matchedProperties ?? undefined,
      documentsJson: body.documents ?? undefined,
      checklistJson: body.checklist ?? undefined,
      eventsJson: body.events ?? undefined,
    };

    const updated = await prisma.deal.update({
      where: { id },
      data,
    });

    return NextResponse.json(toFrontendDeal(updated));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Deal update error:", e);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { id } = await params;

    const existing = await prisma.deal.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Deal not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }

    await prisma.deal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Deal delete error:", e);
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
  }
}

