import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMembership } from "@/features/scoping";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
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

export async function GET() {
  try {
    const { activeWorkspaceId } = await requireMembership();
    const tasks = await prisma.task.findMany({
      where: { workspaceId: activeWorkspaceId },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(tasks.map(toFrontendTask));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Tasks list error:", e);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { activeWorkspaceId, user } = await requireMembership();
    const body = (await request.json()) as {
      title: string;
      description?: string;
      dueDate: string;
      completed?: boolean;
      priority: TaskPriority;
      relatedTo?: { type: TaskRelatedType; id: string; name: string };
    };

    const title = (body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const dueDate = new Date(body.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Invalid dueDate" }, { status: 400 });
    }

    const created = await prisma.task.create({
      data: {
        workspaceId: activeWorkspaceId,
        createdByUserId: user.id,
        assignedToUserId: user.id,
        title,
        description: body.description?.trim() || null,
        status: body.completed ? "done" : "open",
        priority: body.priority,
        dueDate,
        relatedEntityType: body.relatedTo?.type ?? null,
        relatedEntityId: body.relatedTo?.id ?? null,
        relatedEntityName: body.relatedTo?.name ?? null,
      },
    });

    return NextResponse.json(toFrontendTask(created));
  } catch (e) {
    if (e instanceof UnauthorizedError) return NextResponse.json({ error: e.message }, { status: 401 });
    if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 });
    console.error("Task create error:", e);
    return NextResponse.json({ error: "Failed to save task" }, { status: 500 });
  }
}

