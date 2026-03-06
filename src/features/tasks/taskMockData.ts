"use client";

import type { Task } from "./taskTypes";
import { createWorkspaceLocalStorage } from "@/features/storage/workspaceLocalStorage";

const { load: loadFromStorage, save: saveToStorage } = createWorkspaceLocalStorage<Task>({
  prefix: "crm_tasks_",
  noWorkspaceKey: "crm_tasks_no_workspace",
  legacyGlobalKey: "crm_tasks",
});

let currentWorkspaceId: string | null = null;
let tasksStore: Task[] = [];

function ensureLoaded(workspaceId: string | null) {
  const key = workspaceId ?? null;
  if (currentWorkspaceId === key && tasksStore.length) return;
  currentWorkspaceId = key;
  tasksStore = loadFromStorage(workspaceId);
}

export function getTasks(workspaceId: string | null): Task[] {
  ensureLoaded(workspaceId);
  return [...tasksStore].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

export function addTask(workspaceId: string | null, data: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  ensureLoaded(workspaceId);
  const now = new Date();
  const task: Task = {
    ...data,
    id: `task_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  tasksStore.push(task);
  saveToStorage(workspaceId, tasksStore);
  return task;
}

export function updateTask(workspaceId: string | null, id: string, updates: Partial<Task>): Task | null {
  ensureLoaded(workspaceId);
  const index = tasksStore.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasksStore[index] = {
    ...tasksStore[index],
    ...updates,
    updatedAt: new Date(),
  };
  saveToStorage(workspaceId, tasksStore);
  return tasksStore[index];
}

export function deleteTask(workspaceId: string | null, id: string): boolean {
  ensureLoaded(workspaceId);
  const index = tasksStore.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasksStore.splice(index, 1);
  saveToStorage(workspaceId, tasksStore);
  return true;
}

export function getTaskById(workspaceId: string | null, id: string): Task | null {
  ensureLoaded(workspaceId);
  return tasksStore.find((t) => t.id === id) ?? null;
}

export function toggleTaskCompleted(workspaceId: string | null, id: string): Task | null {
  ensureLoaded(workspaceId);
  const task = tasksStore.find((t) => t.id === id);
  if (!task) return null;
  task.completed = !task.completed;
  task.updatedAt = new Date();
  saveToStorage(workspaceId, tasksStore);
  return task;
}
