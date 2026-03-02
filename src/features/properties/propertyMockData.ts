import { format } from "date-fns";
import type { Property } from "./propertyTypes";
import { syncPropertyToSite, removePropertyFromSite } from "@/features/site/siteConfig";

/** Cale logică pentru poze: userId / anunțId / dată anunț */
export function getPropertyImageStoragePath(property: Property): string {
  const dateStr = property.createdAt
    ? format(new Date(property.createdAt), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");
  return `${property.agentId}/${property.id}/${dateStr}`;
}

export const mockProperties: Property[] = [
  {
    id: "prop_1",
    transactionType: "sale",
    type: "apartment",
    ownerName: "Maria Popescu",
    ownerPhone: "0721234567",
    ownerEmail: "maria@example.com",
    county: "București",
    zone: "centru",
    street: "Strada Principală",
    number: "123",
    mapLocation: "",
    floor: 3,
    totalFloors: 5,
    comfort: "3",
    usefulArea: 85,
    totalArea: 95,
    balconyArea: 8,
    terraceArea: undefined,
    yardArea: undefined,
    bedrooms: 3,
    rooms: 3,
    bathrooms: 2,
    balconies: 1,
    terraces: 0,
    parkingSpots: 1,
    buildingType: "apartment",
    constructionYear: 2015,
    hasAttic: false,
    heatingSystem: "central",
    heatingType: "Centrală termică",
    title: "Apartament modern cu 3 camere",
    description: "Apartament modern, renovat recent, situat într-o zonă centrală. Balcon generos, parcare inclusă.",
    images: [],
    price: 250000,
    priceCurrency: "EUR",
    plusVAT: false,
    negotiable: true,
    commissionType: "custom",
    commissionPercent: 3,
    status: "available",
    city: "București",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    agentId: "user_1",
    agentName: "Ion Popescu",
    showOnSite: true,
    featuredOnSite: true,
  },
  {
    id: "prop_2",
    transactionType: "sale",
    type: "house",
    ownerName: "Ion Ionescu",
    ownerPhone: "0722345678",
    ownerEmail: "ion@example.com",
    county: "Cluj",
    zone: "nord",
    street: "Bulevardul Unirii",
    number: "45",
    mapLocation: "",
    floor: undefined,
    totalFloors: 2,
    comfort: "4",
    usefulArea: 180,
    totalArea: 220,
    balconyArea: undefined,
    terraceArea: 25,
    yardArea: 500,
    bedrooms: 4,
    rooms: 5,
    bathrooms: 3,
    balconies: 0,
    terraces: 1,
    parkingSpots: 2,
    buildingType: "house",
    constructionYear: 2010,
    hasAttic: true,
    hasBasement: false,
    hasSemiBasement: true,
    heatingSystem: "individual",
    heatingType: "Gaz",
    title: "Casă cu grădină, 4 camere",
    description: "Casă spațioasă cu grădină mare, garaj, terasă. Ideală pentru familie.",
    images: [],
    price: 420000,
    priceCurrency: "EUR",
    plusVAT: false,
    negotiable: true,
    commissionType: "custom",
    commissionPercent: 2.5,
    status: "reserved",
    city: "Cluj-Napoca",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    agentId: "user_1",
    agentName: "Ion Popescu",
    showOnSite: true,
    featuredOnSite: false,
  },
  {
    id: "prop_3",
    transactionType: "sale",
    type: "land",
    ownerName: "Ana Georgescu",
    ownerPhone: "0723456789",
    ownerEmail: "ana@example.com",
    county: "Brașov",
    zone: "sud",
    street: "Strada Pădurii",
    number: "78",
    mapLocation: "",
    floor: undefined,
    totalFloors: undefined,
    comfort: undefined,
    usefulArea: 500,
    totalArea: 500,
    balconyArea: undefined,
    terraceArea: undefined,
    yardArea: 500,
    landCategory: "intravilan",
    landClassification: "constructii",
    streetFrontage: 25,
    bedrooms: undefined,
    rooms: undefined,
    bathrooms: undefined,
    balconies: undefined,
    terraces: undefined,
    parkingSpots: undefined,
    buildingType: undefined,
    constructionYear: undefined,
    hasAttic: false,
    heatingSystem: undefined,
    heatingType: undefined,
    title: "Teren intravilan 500mp",
    description: "Teren intravilan, utilat, cu acces la drum asfaltat. Poziție excelentă pentru construcție.",
    images: [],
    price: 85000,
    priceCurrency: "EUR",
    plusVAT: false,
    negotiable: true,
    commissionType: "none",
    commissionPercent: undefined,
    status: "available",
    city: "Brașov",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
    agentId: "user_1",
    agentName: "Ion Popescu",
  },
  {
    id: "prop_4",
    transactionType: "rent",
    type: "commercial",
    ownerName: "SC ABC SRL",
    ownerPhone: "0724567890",
    ownerEmail: "office@abc.ro",
    county: "Timiș",
    zone: "centru",
    street: "Centrul Comercial",
    number: "Etaj 1",
    mapLocation: "",
    floor: 1,
    totalFloors: 3,
    comfort: "luxury",
    usefulArea: 120,
    totalArea: 120,
    balconyArea: undefined,
    terraceArea: undefined,
    yardArea: undefined,
    bedrooms: undefined,
    rooms: undefined,
    bathrooms: 2,
    balconies: undefined,
    terraces: undefined,
    parkingSpots: 5,
    commercialCategory: "office",
    buildingType: "other",
    constructionYear: 2018,
    hasAttic: false,
    heatingSystem: "central",
    heatingType: "Centrală",
    title: "Spațiu comercial 120mp",
    description: "Spațiu comercial modern, situat într-o zonă cu trafic intens. Ideal pentru retail sau birouri.",
    images: [],
    price: 1800,
    priceCurrency: "EUR",
    plusVAT: true,
    negotiable: false,
    commissionType: "custom",
    commissionPercent: 5,
    status: "sold",
    city: "Timișoara",
    createdAt: new Date("2023-12-20"),
    updatedAt: new Date("2024-01-12"),
    agentId: "user_1",
    agentName: "Ion Popescu",
  },
];

const STORAGE_KEY_PREFIX = "crm_properties_";

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value);
  }
  return value;
}

function loadFromStorage(workspaceId: string | null): Property[] {
  if (typeof window === "undefined" || !workspaceId) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + workspaceId);
    if (!raw) return [];
    const parsed = JSON.parse(raw, reviver) as Property[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(workspaceId: string | null, list: Property[]) {
  if (typeof window === "undefined" || !workspaceId) return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + workspaceId, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function getProperties(workspaceId: string | null): Property[] {
  return loadFromStorage(workspaceId);
}

export function addProperty(workspaceId: string | null, property: Omit<Property, "id" | "createdAt" | "updatedAt">): Property | null {
  if (!workspaceId) return null;
  const store = loadFromStorage(workspaceId);
  const now = new Date();
  const id = `prop_${Date.now()}`;
  const newProperty: Property = {
    ...property,
    id,
    createdAt: now,
    updatedAt: now,
    city: property.city || property.county || "",
    imageStoragePath: `${property.agentId}/${id}/${format(now, "yyyy-MM-dd")}`,
  };
  store.push(newProperty);
  saveToStorage(workspaceId, store);
  if (typeof window !== "undefined") {
    syncPropertyToSite(newProperty);
    const payload = { ...newProperty, createdAt: newProperty.createdAt.toISOString(), updatedAt: newProperty.updatedAt.toISOString() };
    fetch("/api/prezentare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
  }
  return newProperty;
}

export function updateProperty(workspaceId: string | null, id: string, updates: Partial<Property>): Property | null {
  if (!workspaceId) return null;
  const store = loadFromStorage(workspaceId);
  const index = store.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const prev = store[index];
  const updatedAt = new Date();
  const imageStoragePath =
    prev.agentId && prev.id
      ? `${prev.agentId}/${prev.id}/${format(updatedAt, "yyyy-MM-dd")}`
      : prev.imageStoragePath;
  const updated = {
    ...prev,
    ...updates,
    updatedAt,
    city: updates.county ? (updates.city || updates.county) : prev.city,
    imageStoragePath: updates.images ? imageStoragePath : (updates.imageStoragePath ?? prev.imageStoragePath),
  };
  store[index] = updated;
  saveToStorage(workspaceId, store);
  if (typeof window !== "undefined") {
    syncPropertyToSite(updated);
    const payload = { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() };
    fetch("/api/prezentare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
  }
  return store[index];
}

export function deleteProperty(workspaceId: string | null, id: string): boolean {
  if (!workspaceId) return false;
  const store = loadFromStorage(workspaceId);
  const index = store.findIndex((p) => p.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  saveToStorage(workspaceId, store);
  if (typeof window !== "undefined") {
    removePropertyFromSite(id);
    fetch(`/api/prezentare/${id}`, { method: "DELETE" }).catch(() => {});
  }
  return true;
}

export function getPropertyById(workspaceId: string | null, id: string): Property | null {
  const store = loadFromStorage(workspaceId);
  return store.find((p) => p.id === id) || null;
}
