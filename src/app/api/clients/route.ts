import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

function toFrontendClient(row: {
  id: string;
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

export async function GET() {
  try {
    const { activeWorkspaceId } = await requireMembership();
    const clients = await prisma.client.findMany({
      where: { workspaceId: activeWorkspaceId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(clients.map(toFrontendClient));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Clients list error:", e);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { activeWorkspaceId, user } = await requireMembership();
    const body = (await request.json()) as {
      transactionType?: string;
      propertyType?: string;
      name?: string;
      phone?: string;
      email?: string;
      county?: string;
      zone?: string;
      roomsMin?: number;
      roomsMax?: number;
      surfaceMin?: number;
      surfaceMax?: number;
      budgetMin?: number;
      budgetMax?: number;
      constructionYearMin?: number;
      status?: string;
      source?: string;
      notes?: string;
    };

    const name = (body.name ?? "").trim();
    const phone = (body.phone ?? "").trim();
    if (!name && !phone) {
      return NextResponse.json({ error: "Name or phone is required" }, { status: 400 });
    }

    const created = await prisma.client.create({
      data: {
        workspaceId: activeWorkspaceId,
        createdByUserId: user.id,
        transactionType: (body.transactionType as any) ?? "sale",
        propertyType: (body.propertyType as any) ?? "apartment",
        name,
        phone,
        email: body.email?.trim() || null,
        county: body.county?.trim() || null,
        zone: body.zone?.trim() || null,
        roomsMin: body.roomsMin ?? null,
        roomsMax: body.roomsMax ?? null,
        surfaceMin: body.surfaceMin ?? null,
        surfaceMax: body.surfaceMax ?? null,
        budgetMin: body.budgetMin ?? null,
        budgetMax: body.budgetMax ?? null,
        constructionYearMin: body.constructionYearMin ?? null,
        status: (body.status as any) ?? "potential",
        source: (body.source as any) ?? "portal",
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(toFrontendClient(created));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Client create error:", e);
    return NextResponse.json({ error: "Failed to save client" }, { status: 500 });
  }
}

