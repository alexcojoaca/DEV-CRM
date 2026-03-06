"use client";

import type { Viewing } from "./viewingTypes";
import { createWorkspaceLocalStorage } from "@/features/storage/workspaceLocalStorage";

const { load: loadFromStorage, save: saveToStorage } = createWorkspaceLocalStorage<Viewing>({
  prefix: "crm_viewings_",
});

export function getViewings(workspaceId: string | null): Viewing[] {
  const store = loadFromStorage(workspaceId);
  return [...store].sort((a, b) => {
    const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return ta - tb;
  });
}

export function addViewing(
  workspaceId: string | null,
  data: Omit<Viewing, "id" | "createdAt" | "updatedAt">
): Viewing | null {
  if (!workspaceId) return null;
  const store = loadFromStorage(workspaceId);
  const now = new Date();
  const viewing: Viewing = {
    ...data,
    status: data.status ?? "scheduled",
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    id: `viewing_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  store.push(viewing);
  saveToStorage(workspaceId, store);
  return viewing;
}

export function updateViewing(workspaceId: string | null, id: string, updates: Partial<Viewing>): Viewing | null {
  if (!workspaceId) return null;
  const store = loadFromStorage(workspaceId);
  const index = store.findIndex((v) => v.id === id);
  if (index === -1) return null;
  store[index] = {
    ...store[index],
    ...updates,
    updatedAt: new Date(),
  };
  saveToStorage(workspaceId, store);
  return store[index];
}

export function deleteViewing(workspaceId: string | null, id: string): boolean {
  if (!workspaceId) return false;
  const store = loadFromStorage(workspaceId);
  const index = store.findIndex((v) => v.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  saveToStorage(workspaceId, store);
  return true;
}

export function getViewingById(workspaceId: string | null, id: string): Viewing | null {
  const store = loadFromStorage(workspaceId);
  return store.find((v) => v.id === id) ?? null;
}
