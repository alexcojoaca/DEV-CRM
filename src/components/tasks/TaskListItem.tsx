"use client";

import { format, isPast, isToday } from "date-fns";
import { ro } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Task } from "@/features/tasks/taskTypes";
import { TASK_PRIORITY_LABELS } from "@/features/tasks/taskTypes";
import { Clock, AlertCircle, Flag } from "lucide-react";

export interface TaskListItemProps {
  task: Task;
  isActive?: boolean;
  onToggle?: (taskId: string) => void;
  onClick?: () => void;
  className?: string;
}

const priorityStyles: Record<Task["priority"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-700",
};

export function TaskListItem({
  task,
  isActive,
  onToggle,
  onClick,
  className,
}: TaskListItemProps) {
  const due = new Date(task.dueDate);
  const isOverdue = !task.completed && isPast(due) && !isToday(due);
  const isDueToday = !task.completed && isToday(due);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      className={cn(
        "flex items-start gap-3 rounded-xl border-2 p-3 transition-all duration-200 cursor-pointer",
        isOverdue
          ? "border-2 border-red-200 bg-gradient-to-r from-red-50/50 to-rose-50/50 shadow-sm"
          : isDueToday
            ? "border-2 border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 shadow-sm"
            : "border-2 border-purple-100/50 bg-white hover:border-purple-200 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/20",
        isActive && "ring-2 ring-purple-400 border-purple-300",
        className
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={(e) => {
          e.stopPropagation();
          onToggle?.(task.id);
        }}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5 border-purple-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-pink-600"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p
          className={cn(
            "text-sm font-semibold",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
              priorityStyles[task.priority]
            )}
          >
            <Flag className="h-3 w-3" />
            {TASK_PRIORITY_LABELS[task.priority]}
          </span>
          {isOverdue ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
              <span className="font-semibold text-red-600">Restantă</span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-purple-600 shrink-0" />
              <span className="text-muted-foreground">
                {format(due, "d MMM, HH:mm", { locale: ro })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
