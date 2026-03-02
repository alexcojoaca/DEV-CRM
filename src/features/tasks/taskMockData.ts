"use client";

import type { Task } from "./taskTypes";

const STORAGE_KEY = "crm_tasks";

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

function loadFromStorage(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw, reviver) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(list: Task[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

let tasksStore: Task[] = loadFromStorage();

export function getTasks(): Task[] {
  return [...tasksStore].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

export function addTask(data: Omit<Task, "id" | "createdAt" | "updatedAt">): Task {
  const now = new Date();
  const task: Task = {
    ...data,
    id: `task_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  tasksStore.push(task);
  saveToStorage(tasksStore);
  return task;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const index = tasksStore.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasksStore[index] = {
    ...tasksStore[index],
    ...updates,
    updatedAt: new Date(),
  };
  saveToStorage(tasksStore);
  return tasksStore[index];
}

export function deleteTask(id: string): boolean {
  const index = tasksStore.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tasksStore.splice(index, 1);
  saveToStorage(tasksStore);
  return true;
}

export function getTaskById(id: string): Task | null {
  return tasksStore.find((t) => t.id === id) ?? null;
}

export function toggleTaskCompleted(id: string): Task | null {
  const task = tasksStore.find((t) => t.id === id);
  if (!task) return null;
  task.completed = !task.completed;
  task.updatedAt = new Date();
  saveToStorage(tasksStore);
  return task;
}
