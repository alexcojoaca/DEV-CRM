/**
 * Pipeline enums and shared types for Lead → Client → Deal.
 * Aligns with strict pipeline rules and data hygiene.
 */

// ---- LEAD ----
export type LeadIntentType = "BUY" | "RENT" | "SELL" | "LET";
export type LeadStatusStrict =
  | "NEW"
  | "CONTACTED"
  | "QUALIFYING"
  | "QUALIFIED"
  | "LOST"
  | "SPAM"
  | "DUPLICATE";
export type LeadPriorityStrict = "LOW" | "MEDIUM" | "HIGH";

export const LEAD_INTENT_LABELS: Record<LeadIntentType, string> = {
  BUY: "Cumpărare",
  RENT: "Închiriere",
  SELL: "Vânzare",
  LET: "Închiriere (proprietar)",
};
export const LEAD_STATUS_STRICT_LABELS: Record<LeadStatusStrict, string> = {
  NEW: "Nou",
  CONTACTED: "Contactat",
  QUALIFYING: "În calificare",
  QUALIFIED: "Calificat",
  LOST: "Pierdut",
  SPAM: "Spam",
  DUPLICATE: "Duplicat",
};
export const LEAD_PRIORITY_STRICT_LABELS: Record<LeadPriorityStrict, string> = {
  LOW: "Scăzut",
  MEDIUM: "Mediu",
  HIGH: "Ridicat",
};

// ---- CLIENT ----
export type ClientTypeStrict = "BUYER" | "TENANT" | "SELLER" | "LANDLORD";
export type ClientStatusStrict =
  | "ACTIVE"
  | "SEARCHING"
  | "VIEWINGS"
  | "NEGOTIATING"
  | "ON_HOLD"
  | "CLOSED_WON"
  | "CLOSED_LOST";
export type FundingType = "CASH" | "MORTGAGE" | "UNKNOWN";

export const CLIENT_TYPE_STRICT_LABELS: Record<ClientTypeStrict, string> = {
  BUYER: "Cumpărător",
  TENANT: "Chirias",
  SELLER: "Vânzător",
  LANDLORD: "Proprietar",
};
export const CLIENT_STATUS_STRICT_LABELS: Record<ClientStatusStrict, string> = {
  ACTIVE: "Activ",
  SEARCHING: "Caută",
  VIEWINGS: "Vizionări",
  NEGOTIATING: "Negociere",
  ON_HOLD: "În așteptare",
  CLOSED_WON: "Închis – câștigat",
  CLOSED_LOST: "Închis – pierdut",
};
export const FUNDING_TYPE_LABELS: Record<FundingType, string> = {
  CASH: "Numerar",
  MORTGAGE: "Credit ipotecar",
  UNKNOWN: "Necunoscut",
};

// ---- DEAL ----
export type DealTypeStrict = "SALE" | "RENTAL";
export type DealStatusStrict =
  | "INITIATED"
  | "VIEWING_SCHEDULED"
  | "OFFER_SENT"
  | "NEGOTIATION"
  | "RESERVED"
  | "DOCS_IN_PROGRESS"
  | "SIGNED_WON"
  | "LOST";
export type CommissionTypeStrict = "PERCENT" | "FIXED";

export const DEAL_TYPE_STRICT_LABELS: Record<DealTypeStrict, string> = {
  SALE: "Vânzare",
  RENTAL: "Închiriere",
};
export const DEAL_STATUS_STRICT_LABELS: Record<DealStatusStrict, string> = {
  INITIATED: "Inițiat",
  VIEWING_SCHEDULED: "Vizionare programată",
  OFFER_SENT: "Ofertă trimisă",
  NEGOTIATION: "Negociere",
  RESERVED: "Rezervat / Ante",
  DOCS_IN_PROGRESS: "Acte în lucru",
  SIGNED_WON: "Semnat – câștigat",
  LOST: "Pierdut",
};
export const COMMISSION_TYPE_LABELS: Record<CommissionTypeStrict, string> = {
  PERCENT: "Procent",
  FIXED: "Sumă fixă",
};

// ---- VIEWING ----
export type ViewingStatusStrict = "SCHEDULED" | "DONE" | "NO_SHOW" | "CANCELLED";

export const VIEWING_STATUS_STRICT_LABELS: Record<ViewingStatusStrict, string> = {
  SCHEDULED: "Programat",
  DONE: "Efectuat",
  NO_SHOW: "Neprezentare",
  CANCELLED: "Anulat",
};

// ---- QUALIFICATION (Client) ----
export interface ClientQualification {
  budgetMax?: number;
  fundingType?: FundingType;
  mortgagePreapproved?: boolean;
  timeline?: string;
  preferredZones?: string[];
  minRooms?: number;
  minSqm?: number;
  mustHaves?: string[];
  dealBreakers?: string[];
}

// ---- DEAL CHECKLIST ----
export interface DealChecklist {
  docs?: { id: string; label: string; done: boolean }[];
  tasks?: { id: string; label: string; done: boolean }[];
}
