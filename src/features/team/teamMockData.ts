"use client";

import type { TeamMember } from "./teamTypes";

const STORAGE_KEY = "crm_team_members";

function reviver(_k: string, value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

function load(): TeamMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw, reviver) as TeamMember[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(list: TeamMember[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

let store: TeamMember[] = load();

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: "tm_1",
    name: "Ion Popescu",
    email: "ion.popescu@agentia.ro",
    phone: "0721 234 567",
    role: "Agent",
    avatarDataUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "tm_2",
    name: "Ana Ionescu",
    email: "ana.ionescu@agentia.ro",
    phone: "0722 345 678",
    role: "Agent",
    avatarDataUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function ensureDefaults() {
  if (store.length === 0) {
    store = [...DEFAULT_MEMBERS];
    save(store);
  }
}

export function getTeamMembers(): TeamMember[] {
  ensureDefaults();
  return [...store];
}

export function addTeamMember(data: Omit<TeamMember, "id" | "createdAt" | "updatedAt">): TeamMember {
  ensureDefaults();
  const now = new Date();
  const member: TeamMember = {
    ...data,
    id: `tm_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  store.push(member);
  save(store);
  return member;
}

export function updateTeamMember(id: string, updates: Partial<TeamMember>): TeamMember | null {
  const index = store.findIndex((m) => m.id === id);
  if (index === -1) return null;
  store[index] = { ...store[index], ...updates, updatedAt: new Date() };
  save(store);
  return store[index];
}
