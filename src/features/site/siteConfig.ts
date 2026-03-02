"use client";

import type { Property } from "@/features/properties/propertyTypes";

const PREFIX = "crm_site_";

export type SiteThemeId = "classic" | "modern";

export interface SitePalette {
  primary: string;
  secondary: string;
  accent: string;
}

export interface SiteTeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatarDataUrl?: string | null;
}

export interface SiteConfig {
  theme: SiteThemeId;
  palette: SitePalette;
  logoDataUrl: string | null;
  coverImageDataUrl: string | null;
  agencyName: string;
  agencyPhone: string;
  agencyEmail: string;
  aboutAgency: string;
  forOwnersText: string;
  forBuyersTenantsText: string;
  /** Proprietăți afișate pe site (bifate „Postează pe site” la fiecare proprietate) */
  properties: Property[];
  /** Echipă (sincronizată din CRM) */
  teamMembers: SiteTeamMember[];
}

const DEFAULT_PALETTE: SitePalette = {
  primary: "#1e293b",
  secondary: "#475569",
  accent: "#0ea5e9",
};

const DEFAULT_CONFIG: SiteConfig = {
  theme: "classic",
  palette: DEFAULT_PALETTE,
  logoDataUrl: null,
  coverImageDataUrl: null,
  agencyName: "Agenția Mea",
  agencyPhone: "",
  agencyEmail: "",
  aboutAgency: "",
  forOwnersText: "",
  forBuyersTenantsText: "",
  properties: [],
  teamMembers: [],
};

function getKey(key: string) {
  return PREFIX + key;
}

export function getSiteConfig(): SiteConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(getKey("config"));
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      palette: { ...DEFAULT_PALETTE, ...parsed.palette },
      properties: Array.isArray(parsed.properties) ? parsed.properties : [],
      teamMembers: Array.isArray(parsed.teamMembers) ? parsed.teamMembers : [],
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function setSiteConfig(updates: Partial<SiteConfig>) {
  if (typeof window === "undefined") return;
  try {
    const current = getSiteConfig();
    const next = {
      ...current,
      ...updates,
      palette: { ...current.palette, ...(updates.palette || {}) },
    };
    localStorage.setItem(getKey("config"), JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function setSitePalette(palette: Partial<SitePalette>) {
  setSiteConfig({ palette: { ...getSiteConfig().palette, ...palette } });
}

export function setSiteLogo(dataUrl: string | null) {
  setSiteConfig({ logoDataUrl: dataUrl });
}

/** Actualizează lista de proprietăți pe site: adaugă/actualizează dacă showOnSite, altfel scoate. */
export function syncPropertyToSite(property: Property & { showOnSite?: boolean }) {
  const config = getSiteConfig();
  const list = config.properties.filter((p) => p.id !== property.id);
  if (property.showOnSite) {
    list.push(property);
  }
  setSiteConfig({ properties: list });
}

/** Elimină o proprietate din site (la ștergere). */
export function removePropertyFromSite(propertyId: string) {
  const config = getSiteConfig();
  setSiteConfig({ properties: config.properties.filter((p) => p.id !== propertyId) });
}

export function setSiteTeamMembers(members: SiteTeamMember[]) {
  setSiteConfig({ teamMembers: members });
}

export { DEFAULT_PALETTE };
