"use client";

import type { Viewing } from "./viewingTypes";

const STORAGE_KEY_PREFIX = "crm_viewings_";

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

function loadFromStorage(workspaceId: string | null): Viewing[] {
  if (typeof window === "undefined" || !workspaceId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + workspaceId);
    if (!raw) return [];
    const parsed = JSON.parse(raw, reviver) as Viewing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(workspaceId: string | null, list: Viewing[]) {
  if (typeof window === "undefined" || !workspaceId) return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + workspaceId, JSON.stringify(list));
  } catch {
    // ignore
  }
}

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
