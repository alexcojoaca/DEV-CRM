/** Tip tranzacție: Vânzare sau Închiriere */
export type ClientTransactionType = "sale" | "rent";

/** Tip imobil: apartament, casă, teren, birou, spațiu comercial, industrial */
export type ClientPropertyType =
  | "apartment"
  | "house"
  | "land"
  | "office"
  | "commercial"
  | "industrial";

/** Stare contact: Calificat, Potential, Necalificat */
export type ClientStatus = "qualified" | "potential" | "disqualified";

/** Sursă contact */
export type ClientSource =
  | "portal"
  | "social"
  | "recomandare"
  | "telefon"
  | "altele";

export interface Client {
  id: string;
  transactionType: ClientTransactionType;
  propertyType: ClientPropertyType;
  name: string;
  phone: string;
  county?: string;
  zone?: string;
  roomsMin?: number;
  roomsMax?: number;
  /** Suprafață teren minimă (mp) – folosită când tip imobil = teren */
  surfaceMin?: number;
  /** Suprafață teren maximă (mp) – folosită când tip imobil = teren */
  surfaceMax?: number;
  budgetMin?: number;
  budgetMax?: number;
  constructionYearMin?: number;
  status: ClientStatus;
  source: ClientSource;
  notes?: string;
  lastContactedAt?: Date;
  /** Câte cicluri de follow-up au fost deja făcute (max 5 pentru notificări) */
  followUpCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientFormData = Omit<Client, "id" | "createdAt" | "updatedAt">;

export const TRANSACTION_TYPE_LABELS: Record<ClientTransactionType, string> = {
  sale: "Vânzare",
  rent: "Chirie",
};

export const TRANSACTION_TYPE_OPTIONS = [
  { value: "sale" as const, label: "Vânzare" },
  { value: "rent" as const, label: "Chirie" },
];

export const PROPERTY_TYPE_LABELS: Record<ClientPropertyType, string> = {
  apartment: "Apartament",
  house: "Casă",
  land: "Teren",
  office: "Birou",
  commercial: "Spațiu comercial",
  industrial: "Spațiu industrial",
};

export const PROPERTY_TYPE_OPTIONS = [
  { value: "apartment" as const, label: "Apartament" },
  { value: "house" as const, label: "Casă" },
  { value: "land" as const, label: "Teren" },
  { value: "office" as const, label: "Birou" },
  { value: "commercial" as const, label: "Spațiu comercial" },
  { value: "industrial" as const, label: "Spațiu industrial" },
];

export const STATUS_LABELS: Record<ClientStatus, string> = {
  qualified: "Calificat",
  potential: "Potential",
  disqualified: "Necalificat",
};

export const STATUS_OPTIONS = [
  { value: "qualified" as const, label: "Calificat" },
  { value: "potential" as const, label: "Potential" },
  { value: "disqualified" as const, label: "Necalificat" },
];

export const SOURCE_LABELS: Record<ClientSource, string> = {
  portal: "Portal imobiliar",
  social: "Social media",
  recomandare: "Recomandare",
  telefon: "Telefon",
  altele: "Altele",
};

export const SOURCE_OPTIONS = [
  { value: "portal" as const, label: "Portal imobiliar" },
  { value: "social" as const, label: "Social media" },
  { value: "recomandare" as const, label: "Recomandare" },
  { value: "telefon" as const, label: "Telefon" },
  { value: "altele" as const, label: "Altele" },
];

export const FOLLOW_UP_DAYS = 3;
export const MAX_FOLLOW_UPS = 5;
