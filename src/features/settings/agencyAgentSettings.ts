"use client";

const STORAGE_KEY = "crm_agency_agent_settings";

export interface AgencySettings {
  /** Denumire: ex. S.C. Exemplu Imobiliar S.R.L. */
  denumire: string;
  /** Sediul social (adresă completă) */
  sediu_social: string;
  /** Înregistrată la ORC sub nr. ... */
  orc: string;
  /** CUI */
  cui: string;
  /** Cont IBAN */
  iban: string;
  /** Banca (ex. Banca Transilvania) */
  banca: string;
  /** Reprezentată legal prin (nume) */
  reprezentat_prin: string;
  /** În calitate de (ex. Administrator) */
  calitate: string;
}

export interface AgentSettings {
  /** Numele agentului */
  nume: string;
  /** Nr. de telefon */
  telefon: string;
  /** Semnătură: data URL (imagine) sau base64 */
  semnatura_dataurl: string;
}

export interface AgencyAgentSettings {
  agency: AgencySettings;
  agent: AgentSettings;
}

const defaultAgency: AgencySettings = {
  denumire: "",
  sediu_social: "",
  orc: "",
  cui: "",
  iban: "",
  banca: "",
  reprezentat_prin: "",
  calitate: "Administrator",
};

const defaultAgent: AgentSettings = {
  nume: "",
  telefon: "",
  semnatura_dataurl: "",
};

function getDefault(): AgencyAgentSettings {
  return { agency: { ...defaultAgency }, agent: { ...defaultAgent } };
}

export function getAgencyAgentSettings(): AgencyAgentSettings {
  if (typeof window === "undefined") return getDefault();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefault();
    const parsed = JSON.parse(raw) as Partial<AgencyAgentSettings>;
    return {
      agency: { ...defaultAgency, ...parsed.agency },
      agent: { ...defaultAgent, ...parsed.agent },
    };
  } catch {
    return getDefault();
  }
}

export function setAgencyAgentSettings(settings: Partial<AgencyAgentSettings>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getAgencyAgentSettings();
    const next: AgencyAgentSettings = {
      agency: { ...current.agency, ...settings.agency },
      agent: { ...current.agent, ...settings.agent },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

/** Mapare pentru câmpurile din formularul fișă vizionare (agency_denumire, agency_sediu, etc.) */
export function agencyToFormFields(agency: AgencySettings): Record<string, string> {
  return {
    agency_denumire: agency.denumire ?? "",
    agency_sediu: agency.sediu_social ?? "",
    agency_nr_orc: agency.orc ?? "",
    agency_cui: agency.cui ?? "",
    agency_iban: agency.iban ?? "",
    agency_banca: agency.banca ?? "",
    agency_reprezentat_prin: agency.reprezentat_prin ?? "",
    agency_functia: agency.calitate ?? "",
  };
}

export function agentToFormFields(agent: AgentSettings): Record<string, string> {
  return {
    agent_name: agent.nume ?? "",
    agent_telefon: agent.telefon ?? "",
  };
}
