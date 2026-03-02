import { format, isPast, isToday } from "date-fns";
import { ro } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Task } from "@/features/dashboard/dashboardTypes";
import { Clock, AlertCircle } from "lucide-react";

export interface TaskListItemProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  className?: string;
}

export function TaskListItem({ task, onToggle, className }: TaskListItemProps) {
  const isOverdue = !task.completed && isPast(task.dueDate) && !isToday(task.dueDate);
  const isDueToday = !task.completed && isToday(task.dueDate);

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border-2 p-3 transition-all duration-200",
        isOverdue
          ? "border-red-200 bg-gradient-to-r from-red-50/50 to-rose-50/50 shadow-sm"
          : isDueToday
          ? "border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 shadow-sm"
          : "border-purple-100/50 bg-white hover:border-purple-200 hover:bg-purple-50/30",
        className
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle?.(task.id)}
        className="mt-0.5 border-purple-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-pink-600"
      />
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm font-semibold", task.completed && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground">{task.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs">
          {isOverdue ? (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              <span className="font-semibold text-red-600">Restantă</span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-muted-foreground">
                Termen: {format(task.dueDate, "d MMM, HH:mm", { locale: ro })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
