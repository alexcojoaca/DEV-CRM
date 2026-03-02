"use client";

import type { Deal, DealEvent, DealFormData, DealOffer } from "./dealTypes";

const STORAGE_KEY_PREFIX = "crm_deals_";

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

function normalizeDeal(d: Deal & { signDate?: Date; signDateTitle?: string }): Deal {
  const events: DealEvent[] = Array.isArray(d.events) ? d.events : [];
  if (events.length === 0 && (d.signDate || (d as any).signDateTitle)) {
    const ev: DealEvent = {
      id: `ev_${Date.now()}`,
      date: d.signDate ? new Date(d.signDate) : new Date(),
      title: (d as any).signDateTitle || "Semnare / eveniment",
    };
    return {
      ...d,
      events: [ev],
      signDate: undefined,
      signDateTitle: undefined,
    } as Deal;
  }
  const withEvents = { ...d, events };
  delete (withEvents as any).signDate;
  delete (withEvents as any).signDateTitle;
  return withEvents as Deal;
}

function loadFromStorage(workspaceId: string | null): Deal[] {
  if (typeof window === "undefined" || !workspaceId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + workspaceId);
    if (!raw) return [];
    const parsed = JSON.parse(raw, reviver) as (Deal & { signDate?: Date; signDateTitle?: string })[];
    const list = Array.isArray(parsed) ? parsed : [];
    return list.map(normalizeDeal);
  } catch {
    return [];
  }
}

function saveToStorage(workspaceId: string | null, list: Deal[]) {
  if (typeof window === "undefined" || !workspaceId) return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + workspaceId, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function getDeals(workspaceId: string | null): Deal[] {
  const dealsStore = loadFromStorage(workspaceId);
  return [...dealsStore].sort((a, b) => {
    if (a.status === "lost" && b.status !== "lost") return 1;
    if (b.status === "lost" && a.status !== "lost") return -1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function getDealById(workspaceId: string | null, id: string): Deal | null {
  const dealsStore = loadFromStorage(workspaceId);
  return dealsStore.find((d) => d.id === id) ?? null;
}

export function addDeal(workspaceId: string | null, data: DealFormData): Deal | null {
  if (!workspaceId) return null;
  const dealsStore = loadFromStorage(workspaceId);
  const now = new Date();
  const deal: Deal = {
    id: `deal_${Date.now()}`,
    title: data.title || data.clientNameFree || "Tranzacție nouă",
    clientId: data.clientId,
    clientNameFree: data.clientNameFree,
    clientPhoneFree: data.clientPhoneFree,
    clientEmailFree: data.clientEmailFree,
    transactionType: data.transactionType,
    side: data.side,
    status: data.status,
    mainPropertyId: data.mainPropertyId,
    mainPropertyTitle: data.mainPropertyTitle,
    mainPropertyPrice: data.mainPropertyPrice,
    offers: data.offers ?? [],
    commissionPercent: data.commissionPercent,
    commissionReceivedTotal: (data as Deal).commissionReceivedTotal,
    listingPrice: (data as Deal).listingPrice,
    delistPrice: (data as Deal).delistPrice,
    matchedProperties: data.matchedProperties ?? [],
    documents: data.documents ?? [],
    checklist: data.checklist ?? [],
    events: data.events ?? [],
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };
  dealsStore.push(deal);
  saveToStorage(workspaceId, dealsStore);
  return deal;
}

export function updateDeal(workspaceId: string | null, id: string, updates: Partial<Deal>): Deal | null {
  if (!workspaceId) return null;
  const dealsStore = loadFromStorage(workspaceId);
  const index = dealsStore.findIndex((d) => d.id === id);
  if (index === -1) return null;
  dealsStore[index] = {
    ...dealsStore[index],
    ...updates,
    updatedAt: new Date(),
  };
  saveToStorage(workspaceId, dealsStore);
  return dealsStore[index];
}

export function deleteDeal(workspaceId: string | null, id: string): boolean {
  if (!workspaceId) return false;
  const dealsStore = loadFromStorage(workspaceId);
  const index = dealsStore.findIndex((d) => d.id === id);
  if (index === -1) return false;
  dealsStore.splice(index, 1);
  saveToStorage(workspaceId, dealsStore);
  return true;
}

export function addOfferToDeal(workspaceId: string | null, dealId: string, amount: number, note?: string): Deal | null {
  const deal = getDealById(workspaceId, dealId);
  if (!deal) return null;
  const offer: DealOffer = {
    id: `offer_${Date.now()}`,
    amount,
    status: "pending",
    createdAt: new Date(),
    note,
  };
  const offers = [...deal.offers, offer];
  return updateDeal(workspaceId, dealId, { offers });
}

