import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

const PRISMA_KEYS = [
  "workspaceId",
  "assignedToUserId",
  "createdByUserId",
  "transactionType",
  "type",
  "ownerName",
  "ownerPhone",
  "ownerEmail",
  "county",
  "zone",
  "street",
  "number",
  "city",
  "title",
  "description",
  "usefulArea",
  "totalArea",
  "rooms",
  "bedrooms",
  "bathrooms",
  "price",
  "priceCurrency",
  "status",
  "extraJson",
] as const;

function toPrismaPayload(body: Record<string, unknown>, workspaceId: string, userId: string) {
  const extra: Record<string, unknown> = {};
  const data: Record<string, unknown> = {
    workspaceId,
    createdByUserId: userId,
    transactionType: body.transactionType ?? "sale",
    type: body.type ?? "apartment",
    ownerName: String(body.ownerName ?? ""),
    ownerPhone: String(body.ownerPhone ?? ""),
    ownerEmail: String(body.ownerEmail ?? ""),
    county: String(body.county ?? ""),
    zone: body.zone ? String(body.zone) : null,
    street: String(body.street ?? ""),
    number: String(body.number ?? ""),
    city: String(body.city ?? body.county ?? ""),
    title: String(body.title ?? ""),
    description: body.description ? String(body.description) : null,
    usefulArea: Math.max(0, Number(body.usefulArea) || 0),
    totalArea: body.totalArea != null ? Number(body.totalArea) : null,
    rooms: body.rooms != null ? Number(body.rooms) : null,
    bedrooms: body.bedrooms != null ? Number(body.bedrooms) : null,
    bathrooms: body.bathrooms != null ? Number(body.bathrooms) : null,
    price: Number(body.price) || 0,
    priceCurrency: String(body.priceCurrency ?? "EUR"),
    status: String(body.status ?? "available"),
  };

  for (const [k, v] of Object.entries(body)) {
    if (k === "address" || k === "images" || PRISMA_KEYS.includes(k as (typeof PRISMA_KEYS)[number])) continue;
    if (v !== undefined && v !== null) extra[k] = v;
  }
  data.extraJson = Object.keys(extra).length ? extra : null;
  return data as Parameters<typeof prisma.property.create>[0]["data"];
}

function toFrontendProperty(
  row: {
    id: string;
    workspaceId: string;
    assignedToUserId: string | null;
    createdByUserId: string | null;
    transactionType: string;
    type: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail: string;
    county: string;
    zone: string | null;
    street: string;
    number: string;
    city: string;
    title: string;
    description: string | null;
    usefulArea: number;
    totalArea: number | null;
    rooms: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    price: number;
    priceCurrency: string;
    status: string;
    extraJson: unknown;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: { fullName: string | null } | null;
  },
  images?: { url: string; name: string; uploadedByUserId?: string; uploadedByName?: string }[]
) {
  const extra = (row.extraJson as Record<string, unknown>) || {};
  const { images: _omit, ...restExtra } = extra;
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    assignedToUserId: row.assignedToUserId,
    createdByUserId: row.createdByUserId,
    transactionType: row.transactionType,
    type: row.type,
    ownerName: row.ownerName,
    ownerPhone: row.ownerPhone,
    ownerEmail: row.ownerEmail,
    county: row.county,
    zone: row.zone ?? undefined,
    street: row.street,
    number: row.number,
    city: row.city,
    title: row.title,
    description: row.description ?? undefined,
    usefulArea: row.usefulArea,
    totalArea: row.totalArea ?? undefined,
    rooms: row.rooms ?? undefined,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    price: row.price,
    priceCurrency: row.priceCurrency as "EUR",
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    agentId: row.createdByUserId ?? "",
    agentName: row.createdBy?.fullName ?? "",
    ...restExtra,
    images: images ?? [],
  };
}

/** Încarcă imaginile proprietății din bucket (FileAsset LISTING + entityId = propertyId). */
async function loadPropertyImages(workspaceId: string, propertyIds: string[]) {
  if (propertyIds.length === 0) return new Map<string, { url: string; name: string; uploadedByUserId?: string; uploadedByName?: string }[]>();
  const assets = await prisma.fileAsset.findMany({
    where: {
      workspaceId,
      entityType: "LISTING",
      entityId: { in: propertyIds },
      kind: "IMAGE",
    },
    orderBy: { createdAt: "asc" },
    include: { ownerUser: { select: { fullName: true } } },
  });
  const map = new Map<string, { url: string; name: string; uploadedByUserId?: string; uploadedByName?: string }[]>();
  for (const id of propertyIds) map.set(id, []);
  for (const a of assets) {
    if (a.entityId && map.has(a.entityId)) {
      map.get(a.entityId)!.push({
        url: `/api/files/${a.id}`,
        name: a.originalFileName,
        uploadedByUserId: a.ownerUserId ?? undefined,
        uploadedByName: a.ownerUser?.fullName ?? undefined,
      });
    }
  }
  return map;
}

export async function GET(request: Request) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get("createdBy");

    let createdByFilter: string | null = null;
    if (createdBy) {
      if (role === "OWNER" || role === "MANAGER") {
        createdByFilter = createdBy;
      } else if (role === "AGENT" && createdBy === user.id) {
        createdByFilter = createdBy;
      }
      // else: AGENT viewing another's portfolio -> ignore param, will show all workspace (or we filter by user.id below)
    }
    if (role === "AGENT" && !createdByFilter) {
      createdByFilter = user.id; // Agent sees only own properties by default
    }

    const list = await prisma.property.findMany({
      where: {
        workspaceId: activeWorkspaceId,
        ...(createdByFilter ? { createdByUserId: createdByFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { fullName: true } } },
    });
    const propertyIds = list.map((p) => p.id);
    const imagesByProperty = await loadPropertyImages(activeWorkspaceId, propertyIds);
    const payload = list.map((row) =>
      toFrontendProperty(row, imagesByProperty.get(row.id) ?? [])
    );
    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Properties list error:", e);
    return NextResponse.json({ error: "Failed to load properties" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { activeWorkspaceId, user } = await requireMembership();
    const body = (await request.json()) as Record<string, unknown>;
    const data = toPrismaPayload(body, activeWorkspaceId, user.id);
    const created = await prisma.property.create({
      data,
      include: { createdBy: { select: { fullName: true } } },
    });
    const images = await loadPropertyImages(activeWorkspaceId, [created.id]).then((m) => m.get(created.id) ?? []);
    return NextResponse.json(toFrontendProperty(created, images));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Property create error:", e);
    return NextResponse.json({ error: "Failed to save property" }, { status: 500 });
  }
}
