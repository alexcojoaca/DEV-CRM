/** Poză: data = base64 data URL (la upload), url = link către fișier din bucket; name = nume fișier; ordinea = ordinea afișării, prima = copertă. uploadedBy* = agentul care a încărcat poza. */
export interface PropertyImage {
  data?: string;
  url?: string;
  name: string;
  uploadedByUserId?: string;
  uploadedByName?: string;
}

/** Normalizează images (poate fi string[] legacy sau { url, name } din API) la PropertyImage[] */
export function normalizePropertyImages(images?: PropertyImage[] | string[] | { url?: string; name?: string; uploadedByUserId?: string; uploadedByName?: string }[]): PropertyImage[] {
  if (!images?.length) return [];
  return images.map((img, i) => {
    if (typeof img === "string") return { data: img, name: `image-${i + 1}.jpg` };
    const name = (img as PropertyImage).name ?? (img as { name?: string }).name ?? `image-${i + 1}.jpg`;
    const data = (img as PropertyImage).data;
    const url = (img as PropertyImage).url ?? (img as { url?: string }).url;
    const uploadedByUserId = (img as PropertyImage).uploadedByUserId ?? (img as { uploadedByUserId?: string }).uploadedByUserId;
    const uploadedByName = (img as PropertyImage).uploadedByName ?? (img as { uploadedByName?: string }).uploadedByName;
    return { data, url, name, uploadedByUserId, uploadedByName };
  });
}

export type PropertyType = "apartment" | "house" | "land" | "commercial";
export type TransactionType = "sale" | "rent";
export type PropertyStatus = "available" | "sold" | "reserved" | "pending" | "withdrawn";
export type ComfortLevel = "1" | "2" | "3" | "4" | "luxury";
export type HeatingType = "central" | "individual" | "electric" | "gas" | "wood" | "none";
export type BuildingType = "apartment" | "house" | "villa" | "penthouse" | "studio" | "duplex" | "other";

/** Compartimentare apartament */
export type CompartmentType = "decomandat" | "semidecomandat" | "nedecomandat" | "circular";

export interface Property {
  id: string;
  
  // Step 1: Contact și adresă
  transactionType: TransactionType; // Vânzare/Închiriere
  type: PropertyType;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  county: string; // Județ
  zone?: string; // Zonă
  street: string;
  number: string;
  mapLocation?: string; // Locație pe hartă
  
  // Step 2: Caracteristici
  floor?: number; // Etaj
  totalFloors?: number; // Nr. etaje imobil
  comfort?: ComfortLevel;
  usefulArea: number; // Suprafață utilă
  totalArea?: number; // Suprafață totală
  balconyArea?: number; // Suprafață balcon
  terraceArea?: number; // Suprafață terasă
  yardArea?: number; // Suprafață curte
  bedrooms?: number;
  rooms?: number; // Nr. camere
  bathrooms?: number;
  balconies?: number;
  terraces?: number;
  parkingSpots?: number;
  buildingType?: BuildingType;
  /** Compartimentare (decomandat, semidecomandat etc.) */
  compartmentType?: CompartmentType;
  constructionYear?: number;
  hasAttic?: boolean;
  heatingSystem?: HeatingType;
  heatingType?: string;
  title: string;
  description?: string;
  
  // Câmpuri suplimentare pentru apartament
  hasElevator?: boolean; // Lift
  orientation?: "north" | "south" | "east" | "west" | "northeast" | "northwest" | "southeast" | "southwest"; // Orientare
  exposure?: "sunny" | "partial" | "shaded"; // Expoziție
  
  // Câmpuri suplimentare pentru casă
  roofType?: "tile" | "metal" | "asphalt" | "other"; // Tip acoperiș
  foundationType?: "concrete" | "strip" | "slab" | "other"; // Tip fundație
  accessRoad?: boolean; // Acces la drum
  hasBasement?: boolean; // Subsol
  hasSemiBasement?: boolean; // Demisol
  
  // Câmpuri suplimentare pentru teren
  landCategory?: "intravilan" | "extravilan" | "agricultural" | "forest"; // Tip teren
  landClassification?: "constructii" | "arabil" | "livada" | "vii" | "pasune" | "forestier" | "other"; // Clasificare teren
  streetFrontage?: number; // Front stradal (m)
  utilities?: string; // Utilități disponibile
  roadAccess?: boolean; // Acces la drum
  
  // Câmpuri suplimentare pentru comercial
  commercialCategory?: "office" | "retail" | "restaurant" | "warehouse" | "other"; // Categorie spațiu comercial
  allowedActivity?: string; // Activitate permisă
  visibility?: "high" | "medium" | "low"; // Vizibilitate
  footTraffic?: "high" | "medium" | "low"; // Trafic pietonal
  
  // Câmpuri pentru închiriere
  deposit?: number; // Garanție
  minRentalPeriod?: number; // Perioadă minimă (luni)
  utilitiesIncluded?: boolean; // Utilități incluse
  
  // Câmpuri pentru vânzare
  documentsReady?: boolean; // Acte gata
  availableFrom?: Date; // Disponibil de la
  mortgageAvailable?: boolean; // Credit ipotecar disponibil
  
  // Step 3: Poze (prima = copertă; la salvare: userId/anunțId/dată/poze)
  images?: PropertyImage[];
  /** Cale logică la salvare: userId/anunțId/dată */
  imageStoragePath?: string;
  
  // Step 4: Preț
  price: number;
  priceCurrency: "EUR";
  plusVAT?: boolean;
  negotiable?: boolean;
  commissionType: "none" | "custom";
  commissionPercent?: number;
  
  // Metadata
  status: PropertyStatus;
  city: string;
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  agentName: string;
  /** Afișează proprietatea pe site-ul agenției */
  showOnSite?: boolean;
  /** Afișează pe prima pagină a site-ului (4-5 apartamente) */
  featuredOnSite?: boolean;
}

export type PropertyFormData = Omit<Property, "id" | "createdAt" | "updatedAt" | "agentId" | "agentName">;

/** Label scurt pentru tip imobil (ex. "Apartament cu 2 camere", "Garsonieră", "Spațiu birou") – folosit în fișa de vizionare */
export function getPropertyTipImobilLabel(property: Property): string {
  const type = property.type;
  const rooms = property.rooms;
  const buildingType = property.buildingType;

  if (type === "commercial") return "Spațiu birou";
  if (type === "land") return "Teren";
  if (type === "house") {
    if (rooms != null && rooms > 0) return `Casă cu ${rooms} camere`;
    return "Casă";
  }
  if (type === "apartment") {
    if (buildingType === "studio" || (rooms != null && rooms === 1)) return "Garsonieră";
    if (rooms != null && rooms > 0) return `Apartament cu ${rooms} camere`;
    return "Apartament";
  }
  return "Imobil";
}
