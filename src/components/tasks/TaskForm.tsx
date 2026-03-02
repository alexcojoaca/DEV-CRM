"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskFormData, TaskPriority, TaskRelatedType } from "@/features/tasks/taskTypes";
import { TASK_PRIORITY_OPTIONS, TASK_RELATED_OPTIONS } from "@/features/tasks/taskTypes";

interface TaskFormProps {
  data: TaskFormData;
  onChange: (data: TaskFormData) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = new Date(d);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(s: string): Date {
  if (!s) return new Date();
  return new Date(s);
}

export function TaskForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Salvează",
}: TaskFormProps) {
  const update = <K extends keyof TaskFormData>(k: K, v: TaskFormData[K]) => {
    onChange({ ...data, [k]: v });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-5"
    >
      <div className="space-y-2">
        <Label htmlFor="task-title">Titlu *</Label>
        <Input
          id="task-title"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="ex: Sună clientul X"
          className="border-purple-200"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">Descriere</Label>
        <Textarea
          id="task-description"
          value={data.description ?? ""}
          onChange={(e) => update("description", e.target.value || undefined)}
          placeholder="Detalii opționale"
          rows={3}
          className="border-purple-200"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-due">Termen limită *</Label>
          <Input
            id="task-due"
            type="datetime-local"
            value={toDatetimeLocal(data.dueDate)}
            onChange={(e) => update("dueDate", fromDatetimeLocal(e.target.value))}
            className="border-purple-200"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Prioritate</Label>
          <Select
            value={data.priority}
            onValueChange={(v) => update("priority", v as TaskPriority)}
          >
            <SelectTrigger className="border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Legat de (opțional)</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <Select
            value={data.relatedTo?.type ?? "none"}
            onValueChange={(v) => {
              if (v === "none") {
                update("relatedTo", undefined);
              } else {
                update("relatedTo", {
                  type: v as TaskRelatedType,
                  id: data.relatedTo?.id ?? "",
                  name: data.relatedTo?.name ?? "",
                });
              }
            }}
          >
            <SelectTrigger className="border-purple-200">
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Fără legătură —</SelectItem>
              {TASK_RELATED_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data.relatedTo && (
            <Input
              value={data.relatedTo.name}
              onChange={(e) =>
                update("relatedTo", {
                  ...data.relatedTo!,
                  name: e.target.value,
                  id: data.relatedTo!.id || e.target.value,
                })
              }
              placeholder="Nume (ex: Ion Popescu)"
              className="border-purple-200"
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-purple-100 pt-4">
        <Button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-purple-200"
          >
            Anulează
          </Button>
        )}
      </div>
    </form>
  );
}
