import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, canAccessByAssignment } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";

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

function toPrismaUpdate(body: Record<string, unknown>) {
  const extra: Record<string, unknown> = {};
  const data: Record<string, unknown> = {
    transactionType: body.transactionType ?? undefined,
    type: body.type ?? undefined,
    ownerName: body.ownerName != null ? String(body.ownerName) : undefined,
    ownerPhone: body.ownerPhone != null ? String(body.ownerPhone) : undefined,
    ownerEmail: body.ownerEmail != null ? String(body.ownerEmail) : undefined,
    county: body.county != null ? String(body.county) : undefined,
    zone: body.zone !== undefined ? (body.zone ? String(body.zone) : null) : undefined,
    street: body.street != null ? String(body.street) : undefined,
    number: body.number != null ? String(body.number) : undefined,
    city: body.city != null ? String(body.city) : undefined,
    title: body.title != null ? String(body.title) : undefined,
    description: body.description !== undefined ? (body.description ? String(body.description) : null) : undefined,
    usefulArea: body.usefulArea != null ? Math.max(0, Number(body.usefulArea)) : undefined,
    totalArea: body.totalArea !== undefined ? (body.totalArea != null ? Number(body.totalArea) : null) : undefined,
    rooms: body.rooms !== undefined ? (body.rooms != null ? Number(body.rooms) : null) : undefined,
    bedrooms: body.bedrooms !== undefined ? (body.bedrooms != null ? Number(body.bedrooms) : null) : undefined,
    bathrooms: body.bathrooms !== undefined ? (body.bathrooms != null ? Number(body.bathrooms) : null) : undefined,
    price: body.price != null ? Number(body.price) : undefined,
    priceCurrency: body.priceCurrency != null ? String(body.priceCurrency) : undefined,
    status: body.status != null ? String(body.status) : undefined,
  };

  for (const [k, v] of Object.entries(body)) {
    if (k === "id" || k === "address" || k === "images" || PRISMA_KEYS.includes(k as (typeof PRISMA_KEYS)[number])) continue;
    if (v !== undefined && v !== null) extra[k] = v;
  }
  if (Object.keys(extra).length) data.extraJson = extra;
  return data as Parameters<typeof prisma.property.update>[0]["data"];
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { id } = await params;
    const row = await prisma.property.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
      include: { createdBy: { select: { fullName: true } } },
    });
    if (!row) throw new NotFoundError("Property not found");
    if (row.assignedToUserId && !canAccessByAssignment(role, user.id, row.assignedToUserId)) {
      throw new ForbiddenError();
    }
    const imagesMap = await loadPropertyImages(activeWorkspaceId, [row.id]);
    const images = imagesMap.get(row.id) ?? [];
    return NextResponse.json(toFrontendProperty(row, images));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Property get error:", e);
    return NextResponse.json({ error: "Failed to load property" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { id } = await params;
    const existing = await prisma.property.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Property not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }
    const body = (await request.json()) as Record<string, unknown>;
    const data = toPrismaUpdate(body);
    const updated = await prisma.property.update({
      where: { id },
      data,
      include: { createdBy: { select: { fullName: true } } },
    });
    const imagesMap = await loadPropertyImages(activeWorkspaceId, [updated.id]);
    const images = imagesMap.get(updated.id) ?? [];
    return NextResponse.json(toFrontendProperty(updated, images));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Property update error:", e);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { id } = await params;
    const existing = await prisma.property.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Property not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }
    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Property delete error:", e);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
