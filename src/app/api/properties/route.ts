import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { toPrismaCreatePayload, toFrontendProperty } from "@/features/properties/propertyApiMapping";

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
    const payload = list.map((row) => toFrontendProperty(row, imagesByProperty.get(row.id) ?? []));
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
    const data = toPrismaCreatePayload(body, activeWorkspaceId, user.id);
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
