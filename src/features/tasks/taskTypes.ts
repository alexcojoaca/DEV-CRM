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

export interface TaskApiDto {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  completed: boolean;
  priority: TaskPriority;
  relatedEntityType?: TaskRelatedType;
  relatedEntityId?: string;
  relatedEntityName?: string;
  createdAt: string;
  updatedAt: string;
}

export function taskFromApi(dto: TaskApiDto): Task {
  const related: TaskRelated | undefined =
    dto.relatedEntityType && dto.relatedEntityId
      ? {
          type: dto.relatedEntityType,
          id: dto.relatedEntityId,
          name: dto.relatedEntityName ?? "",
        }
      : undefined;

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? undefined,
    dueDate: new Date(dto.dueDate),
    completed: dto.completed,
    priority: dto.priority,
    relatedTo: related,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

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
