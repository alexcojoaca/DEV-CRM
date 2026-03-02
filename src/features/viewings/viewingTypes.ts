export type ViewingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface Viewing {
  id: string;
  propertyId?: string;
  clientId?: string;
  /** Link to deal when viewing is part of a transaction */
  dealId?: string;
  /** Denumire/adresă proprietate dacă nu e selectată din listă */
  propertyNameFree?: string;
  /** Nume client dacă nu e selectat din listă */
  clientNameFree?: string;
  /** Telefon client (manual sau din client selectat) */
  clientPhoneFree?: string;
  /** Vizionare pentru vânzare sau închiriere */
  viewingType?: "sale" | "rent";
  /** Adresă vizionare (din proprietate sau introdusă manual) */
  address?: string;
  /** Proprietar – nume (din proprietate sau manual) */
  ownerName?: string;
  /** Proprietar – telefon */
  ownerPhone?: string;
  /** Data și ora programate (opțional) */
  scheduledAt?: Date;
  status: ViewingStatus;
  notes?: string;
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ViewingFormData = Omit<Viewing, "id" | "createdAt" | "updatedAt">;

export const VIEWING_STATUS_LABELS: Record<ViewingStatus, string> = {
  scheduled: "Programat",
  completed: "Efectuat",
  cancelled: "Anulat",
  no_show: "Neprezentare",
};

export const VIEWING_STATUS_OPTIONS: { value: ViewingStatus; label: string }[] = [
  { value: "scheduled", label: "Programat" },
  { value: "completed", label: "Efectuat" },
  { value: "cancelled", label: "Anulat" },
  { value: "no_show", label: "Neprezentare" },
];

export type ViewingType = "sale" | "rent";
export const VIEWING_TYPE_LABELS: Record<ViewingType, string> = {
  sale: "Vânzare",
  rent: "Închiriere",
};
export const VIEWING_TYPE_OPTIONS: { value: ViewingType; label: string }[] = [
  { value: "sale", label: "Vânzare" },
  { value: "rent", label: "Închiriere" },
];
