/**
 * Tipuri de documente disponibile în modulul Documente.
 * Slug-ul este folosit în ruta /documents/[slug].
 */
export type DocumentTypeId =
  | "fisa-vizionare-vanzare"
  | "fisa-vizionare-inchiriere"
  | "contract-prestari-servicii"
  | "contract-inchiriere"
  | "contract-exclusivitate";

export interface DocumentType {
  id: DocumentTypeId;
  label: string;
  description: string;
  slug: string;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: "fisa-vizionare-vanzare",
    slug: "fisa-vizionare-vanzare",
    label: "Fișă de vizionare – client vânzare",
    description: "Formular pentru vizionări imobile de vânzare.",
  },
  {
    id: "fisa-vizionare-inchiriere",
    slug: "fisa-vizionare-inchiriere",
    label: "Fișă de vizionare – client închiriere",
    description: "Formular pentru vizionări imobile de închiriere.",
  },
  {
    id: "contract-prestari-servicii",
    slug: "contract-prestari-servicii",
    label: "Contract de prestări servicii",
    description: "Contract între agenție și client pentru servicii imobiliare.",
  },
  {
    id: "contract-inchiriere",
    slug: "contract-inchiriere",
    label: "Contract de închiriere",
    description: "Contract de închiriere locuință între proprietar și chiriaș.",
  },
  {
    id: "contract-exclusivitate",
    slug: "contract-exclusivitate",
    label: "Contract de exclusivitate",
    description: "Contract de mandat exclusiv pentru vânzare sau închiriere.",
  },
];

export function getDocumentTypeBySlug(slug: string): DocumentType | undefined {
  return DOCUMENT_TYPES.find((t) => t.slug === slug);
}

export function getDocumentTypeById(id: DocumentTypeId): DocumentType | undefined {
  return DOCUMENT_TYPES.find((t) => t.id === id);
}
