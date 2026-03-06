import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, canAccessByAssignment } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { toPrismaUpdatePayload, toFrontendProperty } from "@/features/properties/propertyApiMapping";

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
    const data = toPrismaUpdatePayload(body);
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
