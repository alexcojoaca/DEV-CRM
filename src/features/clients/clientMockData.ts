"use client";

import type { Client } from "./clientTypes";

const STORAGE_KEY_PREFIX = "crm_clients_";

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

function loadFromStorage(workspaceId: string | null): Client[] {
  if (typeof window === "undefined" || !workspaceId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + workspaceId);
    if (!raw) return [];
    const parsed = JSON.parse(raw, reviver) as Client[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(workspaceId: string | null, list: Client[]) {
  if (typeof window === "undefined" || !workspaceId) return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + workspaceId, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function getClients(workspaceId: string | null): Client[] {
  const store = loadFromStorage(workspaceId);
  return [...store].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function addClient(workspaceId: string | null, data: Omit<Client, "id" | "createdAt" | "updatedAt">): Client | null {
  if (!workspaceId) return null;
  const store = loadFromStorage(workspaceId);
  const now = new Date();
  const client: Client = {
    ...data,
    id: `client_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  store.push(client);
  saveToStorage(workspaceId, store);
  return client;
}

export function updateClient(workspaceId: string | null, id: string, updates: Partial<Client>): Client | null {
  if (!workspaceId) return null;
  const store = loadFromStorage(workspaceId);
  const index = store.findIndex((c) => c.id === id);
  if (index === -1) return null;
  store[index] = {
    ...store[index],
    ...updates,
    updatedAt: new Date(),
  };
  saveToStorage(workspaceId, store);
  return store[index];
}

export function deleteClient(workspaceId: string | null, id: string): boolean {
  if (!workspaceId) return false;
  const store = loadFromStorage(workspaceId);
  const index = store.findIndex((c) => c.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  saveToStorage(workspaceId, store);
  return true;
}

export function getClientById(workspaceId: string | null, id: string): Client | null {
  const store = loadFromStorage(workspaceId);
  return store.find((c) => c.id === id) ?? null;
}
