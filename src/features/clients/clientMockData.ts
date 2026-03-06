"use client";

import type { Client } from "./clientTypes";
import { createWorkspaceLocalStorage } from "@/features/storage/workspaceLocalStorage";

const { load: loadFromStorage, save: saveToStorage } = createWorkspaceLocalStorage<Client>({
  prefix: "crm_clients_",
});

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
