export interface Lead {
  id: string;
  /** Nume persoană / lead */
  name: string;
  /** Număr de telefon */
  phone: string;
  /** Zonă / locație (liber) */
  location?: string;
  /** Note libere */
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadFormData = Omit<Lead, "id" | "createdAt" | "updatedAt">;

