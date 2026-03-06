import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import type { DealStatus, DealTransactionType, DealSide, DealOffer, DealPropertyMatch, DealDocumentAttachment, DealChecklistItem, DealEvent } from "@/features/deals/dealTypes";

/** Cast to Prisma's JSON input type for Json columns */
function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function toFrontendDeal(row: {
  id: string;
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

export async function GET() {
  try {
    const { activeWorkspaceId } = await requireMembership();
    const deals = await prisma.deal.findMany({
      where: { workspaceId: activeWorkspaceId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(deals.map(toFrontendDeal));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Deals list error:", e);
    return NextResponse.json({ error: "Failed to load deals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { activeWorkspaceId, user } = await requireMembership();
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

    const transactionType: DealTransactionType = body.transactionType ?? "sale";
    const side: DealSide = body.side ?? "buyer";
    const status: DealStatus = body.status ?? "in_progress";

    const created = await prisma.deal.create({
      data: {
        workspaceId: activeWorkspaceId,
        createdByUserId: user.id,
        title: body.title?.trim() || body.clientNameFree?.trim() || "Tranzacție nouă",
        clientId: body.clientId ?? null,
        clientNameFree: body.clientNameFree?.trim() || null,
        clientPhoneFree: body.clientPhoneFree?.trim() || null,
        clientEmailFree: body.clientEmailFree?.trim() || null,
        transactionType,
        side,
        status,
        mainPropertyId: body.mainPropertyId ?? null,
        mainPropertyTitle: body.mainPropertyTitle?.trim() || null,
        mainPropertyPrice: body.mainPropertyPrice ?? null,
        commissionPercent: body.commissionPercent ?? null,
        commissionReceivedTotal: body.commissionReceivedTotal ?? null,
        listingPrice: body.listingPrice ?? null,
        delistPrice: body.delistPrice ?? null,
        notes: body.notes?.trim() || null,
        offersJson: toJsonValue(body.offers ?? []),
        matchedPropertiesJson: toJsonValue(body.matchedProperties ?? []),
        documentsJson: toJsonValue(body.documents ?? []),
        checklistJson: toJsonValue(body.checklist ?? []),
        eventsJson: toJsonValue(body.events ?? []),
      },
    });

    return NextResponse.json(toFrontendDeal(created));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Deal create error:", e);
    return NextResponse.json({ error: "Failed to save deal" }, { status: 500 });
  }
}

