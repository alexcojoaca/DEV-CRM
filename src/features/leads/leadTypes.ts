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

export interface LeadApiDto {
  id: string;
  name: string;
  phone: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function leadFromApi(dto: LeadApiDto): Lead {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

