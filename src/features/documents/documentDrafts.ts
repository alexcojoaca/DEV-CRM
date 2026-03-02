/**
 * Definiții câmpuri și structură payload pentru documente.
 * Sunt aliniate cu drafturile din folderul "Exemple contracte":
 *   - vanzare_form.html / chirie_form.html → fișă vizionare
 *   - contract_form.html + contract_pdf.py → contract închiriere
 *   - prestari_servicii/form.py → contract prestări servicii
 * La generare PDF, payload-ul trimis poate folosi aceleași chei ca în exemple.
 */

import type { DocumentTypeId } from "./documentTypes";

/** Payload pentru fișă vizionare (vânzare/chirie) – compatibil cu vanzare_pdf.py / chirie_pdf.py */
export interface FisaVizionarePayload {
  data_vizionarii: string;
  ora_vizionarii: string;
  nume: string;
  telefon: string;
  email: string;
  ci_serie?: string;
  ci_numar?: string;
  tip_imobil: string;
  adresa_locuintei: string;
  comision_procent: string;
  /** Agenție – pentru PDF (secțiunea Părți) */
  agency_name?: string;
  agency_hq_address?: string;
  agency_orc_number?: string;
  agency_cui?: string;
  agency_iban?: string;
  agency_bank?: string;
  agency_administrator?: string;
  agent_name?: string;
  signature_agent_dataurl?: string;
  signature_visitor_dataurl?: string;
  /** Metadate semnătură (onsite / remote) */
  signature_meta?: {
    mode?: "onsite" | "remote";
    signed_at_local?: string;
    timezone?: string;
    ip?: string;
  };
}

/** Payload pentru contract închiriere – compatibil cu contract_pdf.py */
export interface ContractInchirierePayload {
  owner_name: string;
  owner_address: string;
  owner_phone: string;
  owner_email: string;
  owner_id_type?: "ci" | "pasaport";
  owner_cnp?: string;
  owner_ci_series?: string;
  owner_passport_no?: string;
  owner_citizenship?: string;
  tenant_name: string;
  tenant_address: string;
  tenant_phone: string;
  tenant_email: string;
  tenant_id_type?: "ci" | "pasaport";
  tenant_cnp?: string;
  tenant_ci_series?: string;
  tenant_passport_no?: string;
  tenant_citizenship?: string;
  property_type: string;
  property_rooms?: string;
  property_mp?: string;
  property_address: string;
  date_signed?: string;
  start_date?: string;
  end_date?: string;
  duration_months?: string;
  pay_day?: string;
  rent_amount: string;
  rent_currency: "EUR" | "RON";
  deposit_amount?: string;
  paid_today_total?: string;
  bank_name?: string;
  bank_iban?: string;
  bank_swift?: string;
  pets_allowed?: "yes" | "no";
  notice_days?: string;
  notes?: string;
  signature_owner_dataurl?: string;
  signature_tenant_dataurl?: string;
}

/** Payload pentru contract prestări servicii – compatibil cu prestari_servicii/form.py */
export interface ContractPrestariPayload {
  beneficiar_tip: "pf" | "pj";
  beneficiar_nume: string;
  beneficiar_cnp?: string;
  beneficiar_cui?: string;
  beneficiar_adresa?: string;
  beneficiar_telefon: string;
  beneficiar_email?: string;
  tip_tranzactie: "inchiriere" | "vanzare" | "cumparare";
  imobil_tip: string;
  imobil_adresa: string;
  currency: "RON" | "EUR";
  comision_tva: "fara" | "cu";
  comision: string;
  nr_contract: string;
  data_contractului: string;
}

/** Payload pentru contract exclusivitate (draft intern) */
export interface ContractExclusivitatePayload {
  client_name: string;
  agency_name: string;
  property_description: string;
  transaction_type: string;
  exclusivity_period: string;
  commission: string;
  notes?: string;
}

export type DocumentPayload =
  | { type: "fisa-vizionare-vanzare"; data: FisaVizionarePayload }
  | { type: "fisa-vizionare-inchiriere"; data: FisaVizionarePayload }
  | { type: "contract-inchiriere"; data: ContractInchirierePayload }
  | { type: "contract-prestari-servicii"; data: ContractPrestariPayload }
  | { type: "contract-exclusivitate"; data: ContractExclusivitatePayload };

/** Mapare id document → chei câmpuri (pentru export/PDF) */
export const DOCUMENT_PAYLOAD_KEYS: Record<DocumentTypeId, string[]> = {
  "fisa-vizionare-vanzare": [
    "data_vizionarii", "ora_vizionarii", "nume", "telefon", "email",
    "ci_serie", "ci_numar", "tip_imobil", "adresa_locuintei", "comision_procent",
    "agency_name", "agency_hq_address", "agency_orc_number", "agency_cui",
    "agency_iban", "agency_bank", "agency_administrator", "agent_name",
  ],
  "fisa-vizionare-inchiriere": [
    "data_vizionarii", "ora_vizionarii", "nume", "telefon", "email",
    "ci_serie", "ci_numar", "tip_imobil", "adresa_locuintei", "comision_procent",
  ],
  "contract-prestari-servicii": [
    "prestari_variant", "nr_contract", "data_contract",
    "agency_denumire", "agency_sediu", "agency_nr_orc", "agency_cui", "agency_iban", "agency_reprezentat_prin",
    "client_nume", "client_cnp_cui", "client_ci_rc", "client_domiciliu", "client_telefon", "client_email",
    "adresa_imobil", "comision_tip", "comision_valoare", "comision_alta_formula",
    "exigibilitate_inchiriere", "exigibilitate_antecontract", "exigibilitate_vanzare",
    "penalitati_procent", "instanta_competenta",
  ],
  "contract-inchiriere": [
    "owner_name", "owner_address", "owner_phone", "owner_email",
    "owner_id_type", "owner_cnp", "owner_ci_series", "owner_passport_no", "owner_citizenship",
    "tenant_name", "tenant_address", "tenant_phone", "tenant_email",
    "tenant_id_type", "tenant_cnp", "tenant_ci_series", "tenant_passport_no", "tenant_citizenship",
    "property_type", "property_rooms", "property_mp", "property_address",
    "date_signed", "start_date", "end_date", "duration_months", "pay_day",
    "rent_amount", "rent_currency", "deposit_amount", "paid_today_total",
    "bank_name", "bank_iban", "bank_swift", "pets_allowed", "notice_days", "notes",
  ],
  "contract-exclusivitate": [
    "client_name", "agency_name", "property_description", "transaction_type",
    "exclusivity_period", "commission", "notes",
  ],
};
