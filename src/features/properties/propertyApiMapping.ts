import type { Prisma } from "@prisma/client";

export const PROPERTY_PRISMA_KEYS = [
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

type PropertyPrismaKeys = (typeof PROPERTY_PRISMA_KEYS)[number];

type PropertyRow = Prisma.PropertyGetPayload<{
  include: { createdBy: { select: { fullName: true } } };
}>;

export type PropertyImageDto = {
  url: string;
  name: string;
  uploadedByUserId?: string;
  uploadedByName?: string;
};

export type PropertyFrontendDto = {
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
  zone?: string;
  street: string;
  number: string;
  city: string;
  title: string;
  description?: string;
  usefulArea: number;
  totalArea?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  price: number;
  priceCurrency: "EUR" | string;
  status: string;
  createdAt: string;
  updatedAt: string;
  agentId: string;
  agentName: string;
  images: PropertyImageDto[];
  // plus any extraJson fields spread in
  [key: string]: unknown;
};

export function toPrismaCreatePayload(
  body: Record<string, unknown>,
  workspaceId: string,
  userId: string
): Prisma.PropertyCreateInput {
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
    if (k === "address" || k === "images" || PROPERTY_PRISMA_KEYS.includes(k as PropertyPrismaKeys)) continue;
    if (v !== undefined && v !== null) extra[k] = v;
  }
  data.extraJson = Object.keys(extra).length ? extra : null;
  return data as Prisma.PropertyCreateInput;
}

export function toPrismaUpdatePayload(body: Record<string, unknown>): Prisma.PropertyUpdateInput {
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
    if (k === "id" || k === "address" || k === "images" || PROPERTY_PRISMA_KEYS.includes(k as PropertyPrismaKeys)) continue;
    if (v !== undefined && v !== null) extra[k] = v;
  }
  if (Object.keys(extra).length) data.extraJson = extra;
  return data as Prisma.PropertyUpdateInput;
}

export function toFrontendProperty(
  row: PropertyRow,
  images?: PropertyImageDto[]
): PropertyFrontendDto {
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

