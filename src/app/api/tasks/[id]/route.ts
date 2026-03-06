import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership, canAccessByAssignment } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "@/lib/errors";
import type { TaskPriority, TaskRelatedType } from "@/features/tasks/taskTypes";

function toFrontendTask(row: {
  id: string;
  workspaceId: string;
  assignedToUserId: string | null;
  createdByUserId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  relatedEntityName: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.dueDate.toISOString(),
    completed: row.status === "done",
    priority: row.priority as TaskPriority,
    relatedEntityType: row.relatedEntityType as TaskRelatedType | undefined,
    relatedEntityId: row.relatedEntityId ?? undefined,
    relatedEntityName: row.relatedEntityName ?? undefined,
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

    const existing = await prisma.task.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Task not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }

    const body = (await request.json()) as Partial<{
      title: string;
      description: string;
      dueDate: string;
      completed: boolean;
      priority: TaskPriority;
      relatedTo: { type: TaskRelatedType; id: string; name: string };
    }>;

    const data: Record<string, unknown> = {
      title: body.title !== undefined ? body.title.trim() : undefined,
      description: body.description !== undefined ? (body.description?.trim() || null) : undefined,
      priority: body.priority ?? undefined,
    };

    if (body.dueDate !== undefined) {
      const d = new Date(body.dueDate);
      data.dueDate = Number.isNaN(d.getTime()) ? existing.dueDate : d;
    }

    if (body.completed !== undefined) {
      data.status = body.completed ? "done" : "open";
    }

    if (body.relatedTo !== undefined) {
      data.relatedEntityType = body.relatedTo?.type ?? null;
      data.relatedEntityId = body.relatedTo?.id ?? null;
      data.relatedEntityName = body.relatedTo?.name ?? null;
    }

    const updated = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(toFrontendTask(updated));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Task update error:", e);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { activeWorkspaceId, role, user } = await requireMembership();
    const { id } = await params;

    const existing = await prisma.task.findFirst({
      where: { id, workspaceId: activeWorkspaceId },
    });
    if (!existing) throw new NotFoundError("Task not found");
    if (existing.assignedToUserId && !canAccessByAssignment(role, user.id, existing.assignedToUserId)) {
      throw new ForbiddenError();
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 });
    console.error("Task delete error:", e);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}

