export type DealStatus = "in_progress" | "negotiation" | "won" | "lost";

/** Tip tranzacție: vânzare sau închiriere (din perspectiva proprietății) */
export type DealTransactionType = "sale" | "rent";

/** Rol: client cumpărător / chiriaș sau vânzător / proprietar */
export type DealSide = "buyer" | "seller";

export interface DealOffer {
  id: string;
  amount: number;
  createdAt: Date;
  status: "pending" | "accepted" | "rejected";
  note?: string;
}

export interface DealPropertyMatch {
  id: string;
  /** id proprietate din portofoliu, dacă e selectată din listă */
  propertyId?: string;
  /** titlu / descriere scurtă (dacă e pusă manual) */
  label: string;
  /** dacă i-a plăcut sau nu proprietatea */
  liked?: "like" | "dislike";
  /** preț / nume proprietar / contact – dacă nu e din portofoliu */
  price?: number;
  ownerName?: string;
  ownerPhone?: string;
}

/** Eveniment cu dată și titlu (semnare, întâlnire etc.) */
export interface DealEvent {
  id: string;
  date: Date;
  title: string;
}

export interface DealDocumentAttachment {
  id: string;
  name: string;
  /** URL sau cale către document (pentru descărcare/vizualizare) */
  url?: string;
}

export interface DealChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Deal {
  id: string;
  title?: string;

  clientId?: string;
  clientNameFree?: string;
  clientPhoneFree?: string;
  clientEmailFree?: string;

  transactionType: DealTransactionType;
  side: DealSide;
  status: DealStatus;

  /** Proprietatea principală a tranzacției */
  mainPropertyId?: string;
  mainPropertyTitle?: string;
  mainPropertyPrice?: number;

  offers: DealOffer[];
  commissionPercent?: number;
  /** Comision încasat total (EUR) – setat la finalizare */
  commissionReceivedTotal?: number;
  /** Preț anunț (pentru calcul comision dacă nu e ofertă) */
  listingPrice?: number;
  /** Preț delistare (opțional) */
  delistPrice?: number;

  matchedProperties: DealPropertyMatch[];
  documents: DealDocumentAttachment[];
  checklist: DealChecklistItem[];

  /** Evenimente cu dată și titlu (semnare, întâlniri etc.) */
  events: DealEvent[];

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type DealFormData = Omit<
  Deal,
  "id" | "createdAt" | "updatedAt" | "offers" | "matchedProperties" | "documents" | "checklist" | "events"
> & {
  offers?: DealOffer[];
  matchedProperties?: DealPropertyMatch[];
  documents?: DealDocumentAttachment[];
  checklist?: DealChecklistItem[];
  events?: DealEvent[];
};

export interface DealApiDto {
  id: string;
  title?: string;
  clientId?: string;
  clientNameFree?: string;
  clientPhoneFree?: string;
  clientEmailFree?: string;
  transactionType: DealTransactionType;
  side: DealSide;
  status: DealStatus;
  mainPropertyId?: string;
  mainPropertyTitle?: string;
  mainPropertyPrice?: number;
  offersJson?: unknown;
  matchedPropertiesJson?: unknown;
  documentsJson?: unknown;
  checklistJson?: unknown;
  eventsJson?: unknown;
  notes?: string;
  commissionPercent?: number;
  commissionReceivedTotal?: number;
  listingPrice?: number;
  delistPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export function dealFromApi(dto: DealApiDto): Deal {
  const offers = (dto.offersJson as DealOffer[] | undefined) ?? [];
  const matches = (dto.matchedPropertiesJson as DealPropertyMatch[] | undefined) ?? [];
  const documents = (dto.documentsJson as DealDocumentAttachment[] | undefined) ?? [];
  const checklist = (dto.checklistJson as DealChecklistItem[] | undefined) ?? [];
  const events = (dto.eventsJson as DealEvent[] | undefined) ?? [];

  return {
    id: dto.id,
    title: dto.title,
    clientId: dto.clientId,
    clientNameFree: dto.clientNameFree,
    clientPhoneFree: dto.clientPhoneFree,
    clientEmailFree: dto.clientEmailFree,
    transactionType: dto.transactionType,
    side: dto.side,
    status: dto.status,
    mainPropertyId: dto.mainPropertyId,
    mainPropertyTitle: dto.mainPropertyTitle,
    mainPropertyPrice: dto.mainPropertyPrice,
    offers: offers.map((o) => ({
      ...o,
      createdAt: new Date(o.createdAt),
    })),
    commissionPercent: dto.commissionPercent,
    commissionReceivedTotal: dto.commissionReceivedTotal,
    listingPrice: dto.listingPrice,
    delistPrice: dto.delistPrice,
    matchedProperties: matches,
    documents,
    checklist,
    events: events.map((e) => ({
      ...e,
      date: new Date(e.date),
    })),
    notes: dto.notes,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  in_progress: "În curs",
  negotiation: "În negociere",
  won: "Tranzacționată",
  lost: "Pierdută",
};

export const DEAL_STATUS_OPTIONS = [
  { value: "in_progress" as const, label: "În curs" },
  { value: "negotiation" as const, label: "În negociere" },
  { value: "won" as const, label: "Tranzacționată" },
  { value: "lost" as const, label: "Pierdută" },
];

export const DEAL_TRANSACTION_TYPE_LABELS: Record<DealTransactionType, string> = {
  sale: "Vânzare",
  rent: "Chirie",
};

export const DEAL_TRANSACTION_TYPE_OPTIONS = [
  { value: "sale" as const, label: "Vânzare" },
  { value: "rent" as const, label: "Chirie" },
];

export const DEAL_SIDE_LABELS: Record<DealSide, string> = {
  buyer: "Cumpărare",
  seller: "Vânzare",
};

export const DEAL_SIDE_OPTIONS = [
  { value: "buyer" as const, label: "Cumpărare" },
  { value: "seller" as const, label: "Vânzare" },
];

