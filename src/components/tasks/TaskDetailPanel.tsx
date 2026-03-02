"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TaskForm } from "@/components/tasks/TaskForm";
import type { Task, TaskFormData } from "@/features/tasks/taskTypes";
import { TASK_PRIORITY_LABELS, TASK_RELATED_OPTIONS } from "@/features/tasks/taskTypes";
import {
  Edit,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const priorityStyles: Record<Task["priority"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-700",
};

const relatedHref: Record<string, string> = {
  lead: "/leads",
  deal: "/deals",
  property: "/properties",
  viewing: "/viewings",
};

interface TaskDetailPanelProps {
  task: Task;
  onUpdate: (id: string, data: TaskFormData) => void;
  onToggleCompleted: (id: string) => void;
  onBack?: () => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function TaskDetailPanel({
  task,
  onUpdate,
  onToggleCompleted,
  onBack,
  onDelete,
  className,
}: TaskDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: task.title,
    description: task.description,
    dueDate: new Date(task.dueDate),
    completed: task.completed,
    priority: task.priority,
    relatedTo: task.relatedTo,
  });

  const handleSave = () => {
    onUpdate(task.id, formData);
    setEditing(false);
  };

  const relatedLabel = task.relatedTo
    ? TASK_RELATED_OPTIONS.find((o) => o.value === task.relatedTo!.type)?.label ?? task.relatedTo.type
    : null;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex shrink-0 items-center gap-2 border-b border-purple-100 bg-gradient-to-r from-white to-purple-50/30 px-3 py-2">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 lg:size-auto lg:px-3"
          >
            <ArrowLeft className="h-5 w-5 lg:mr-1.5" />
            <span className="hidden lg:inline">Înapoi la listă</span>
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-foreground">{task.title}</h2>
          <p className="text-xs text-muted-foreground">
            {TASK_PRIORITY_LABELS[task.priority]}
            {task.relatedTo && ` · ${task.relatedTo.name}`}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {editing ? (
          <TaskForm
            data={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            onCancel={() => setEditing(false)}
            submitLabel="Salvează modificările"
          />
        ) : (
          <div className="space-y-4">
            <Card className="border-2 border-purple-200/50 bg-white shadow-sm bg-gradient-to-br from-white to-purple-50/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Detalii
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="border-purple-200"
                    >
                      <Edit className="mr-1.5 h-4 w-4" />
                      Editează
                    </Button>
                    {onDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(task.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        aria-label="Șterge sarcina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                      priorityStyles[task.priority]
                    )}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </span>
                  {task.completed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Finalizată
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      <Circle className="h-3.5 w-3.5" />
                      Deschisă
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-purple-500 shrink-0" />
                  <span className="text-foreground">
                    Termen: {format(new Date(task.dueDate), "d MMM yyyy, HH:mm", { locale: ro })}
                  </span>
                </div>

                {task.description && (
                  <div className="text-sm">
                    <p className="text-xs font-medium text-muted-foreground">Descriere</p>
                    <p className="mt-0.5 text-foreground whitespace-pre-wrap">{task.description}</p>
                  </div>
                )}

                {task.relatedTo && relatedLabel && (
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-purple-500 shrink-0" />
                    <Link
                      href={relatedHref[task.relatedTo.type] ?? "#"}
                      className="text-sm font-medium text-purple-600 hover:underline"
                    >
                      {relatedLabel}: {task.relatedTo.name}
                    </Link>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleCompleted(task.id)}
                  className="border-purple-200"
                >
                  {task.completed ? (
                    <>
                      <Circle className="mr-1.5 h-4 w-4" />
                      Marchează ca nefinalizată
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Marchează ca finalizată
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground pt-2">
                  Actualizat: {format(new Date(task.updatedAt), "d MMM yyyy, HH:mm", { locale: ro })}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
