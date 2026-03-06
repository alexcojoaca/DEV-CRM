"use client";

import type { Lead, LeadFormData } from "./leadTypes";
import { createWorkspaceLocalStorage } from "@/features/storage/workspaceLocalStorage";

const { load: loadFromStorage, save: saveToStorage } = createWorkspaceLocalStorage<Lead>({
  prefix: "crm_leads_",
});

export function getLeads(workspaceId: string | null): Lead[] {
  const leadsStore = loadFromStorage(workspaceId);
  return [...leadsStore].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getLeadById(workspaceId: string | null, id: string): Lead | null {
  const leadsStore = loadFromStorage(workspaceId);
  return leadsStore.find((l) => l.id === id) ?? null;
}

export function addLead(workspaceId: string | null, data: LeadFormData): Lead | null {
  if (!workspaceId) return null;
  const leadsStore = loadFromStorage(workspaceId);
  const now = new Date();
  const lead: Lead = {
    id: `lead_${Date.now()}`,
    name: data.name,
    phone: data.phone,
    location: data.location,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };
  leadsStore.push(lead);
  saveToStorage(workspaceId, leadsStore);
  return lead;
}

export function updateLead(workspaceId: string | null, id: string, updates: Partial<Lead>): Lead | null {
  if (!workspaceId) return null;
  const leadsStore = loadFromStorage(workspaceId);
  const index = leadsStore.findIndex((l) => l.id === id);
  if (index === -1) return null;
  leadsStore[index] = {
    ...leadsStore[index],
    ...updates,
    updatedAt: new Date(),
  };
  saveToStorage(workspaceId, leadsStore);
  return leadsStore[index];
}

export function deleteLead(workspaceId: string | null, id: string): boolean {
  if (!workspaceId) return false;
  const leadsStore = loadFromStorage(workspaceId);
  const index = leadsStore.findIndex((l) => l.id === id);
  if (index === -1) return false;
  leadsStore.splice(index, 1);
  saveToStorage(workspaceId, leadsStore);
  return true;
}

/** Stocare minimală pentru cereri de contact de pe pagina publică (formular proprietate). */
const SUBMISSION_STORAGE_KEY = "crm_lead_submissions";

export interface LeadSubmission {
  name: string;
  phone?: string;
  email?: string;
  source: string;
  status: string;
  agentId?: string;
  notes?: string;
  createdAt: string;
}

function loadSubmissions(): LeadSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SUBMISSION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSubmissions(list: LeadSubmission[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SUBMISSION_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function addLeadSubmission(data: Omit<LeadSubmission, "createdAt">) {
  const list = loadSubmissions();
  list.push({
    ...data,
    createdAt: new Date().toISOString(),
  });
  saveSubmissions(list);
}
