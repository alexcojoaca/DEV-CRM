export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskRelatedType = "lead" | "deal" | "property" | "viewing";

export interface TaskRelated {
  type: TaskRelatedType;
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  priority: TaskPriority;
  relatedTo?: TaskRelated;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskFormData = Omit<Task, "id" | "createdAt" | "updatedAt">;

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Scăzută",
  medium: "Medie",
  high: "Ridicată",
  urgent: "Urgentă",
};

export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Scăzută" },
  { value: "medium", label: "Medie" },
  { value: "high", label: "Ridicată" },
  { value: "urgent", label: "Urgentă" },
];

export const TASK_RELATED_OPTIONS: { value: TaskRelatedType; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "deal", label: "Tranzacție" },
  { value: "property", label: "Proprietate" },
  { value: "viewing", label: "Vizionare" },
];
