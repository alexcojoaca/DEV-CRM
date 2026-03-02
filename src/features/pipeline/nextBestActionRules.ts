/**
 * Rule-based Next Best Action engine for Lead, Client, Deal.
 * Returns title, suggestion text, and primary CTA for the current entity state.
 */

import type { Lead } from "@/features/leads/leadTypes";
import type { Client } from "@/features/clients/clientTypes";
import type { Deal } from "@/features/deals/dealTypes";

export interface NextBestAction {
  title: string;
  suggestion: string;
  ctaLabel: string;
  ctaId: string;
}

function leadHasQualification(lead: Lead): boolean {
  const hasBudget = lead.budgetMin != null || lead.budgetMax != null;
  const hasTimeline = !!lead.timeline?.trim();
  const hasIntent = !!lead.interest?.trim() || !!lead.intentType;
  return !!(hasBudget || hasTimeline) && !!hasIntent;
}

export function getNextBestActionForLead(lead: Lead): NextBestAction {
  const status = lead.status;

  // Calculăm același tip de progres ca în piramida de lead:
  // 5 criterii (telefon, buget, termen/interes, intenție, zone), fiecare ~20%.
  const progressCriteria = [
    !!lead.phone,
    lead.budgetMin != null || lead.budgetMax != null,
    !!(lead.timeline?.trim() || lead.interest?.trim()),
    !!lead.intentType,
    (lead.zones?.length ?? lead.preferredZones?.length ?? 0) > 0,
  ];
  const progressToClient =
    (progressCriteria.filter(Boolean).length / 5) * 100;

  // Dacă lead-ul are deja >50% progres către Client (suficiente informații),
  // oferim direct acțiunea de "Transformă în client" (dacă nu este descalificat).
  if (status !== "disqualified" && progressToClient >= 50) {
    return {
      title: "Convertire în client",
      suggestion:
        "Ai deja suficiente informații (buget, intenție, criterii). Transformă lead-ul în client pentru a programa vizionări și a crea tranzacții.",
      ctaLabel: "Transformă în client",
      ctaId: "convert_to_client",
    };
  }

  if (status === "new") {
    return {
      title: "Primul contact",
      suggestion: "Sună sau scrie pe WhatsApp pentru a confirma interesul și a stabili o discuție.",
      ctaLabel: "Marchează contactat",
      ctaId: "mark_contacted",
    };
  }

  if (status === "contacted" || status === "response_received" || status === "no_response") {
    const qualified = leadHasQualification(lead);
    if (!qualified) {
      return {
        title: "Calificare lead",
        suggestion: "Completează bugetul, termenul și criteriile pentru a trece lead-ul în calificare.",
        ctaLabel: "Califică lead-ul",
        ctaId: "qualify_lead",
      };
    }
    return {
      title: "Pregătește calificarea",
      suggestion: "Dacă ai confirmat buget, termen și intenția, marchează lead-ul ca Calificat.",
      ctaLabel: "Marchează calificat",
      ctaId: "mark_qualified",
    };
  }

  if (status === "qualified") {
    return {
      title: "Convertire în client",
      suggestion:
        "Lead-ul este calificat. Transformă-l în client pentru a programa vizionări și a crea tranzacții.",
      ctaLabel: "Transformă în client",
      ctaId: "convert_to_client",
    };
  }

  if (status === "disqualified") {
    return {
      title: "Lead necalificat",
      suggestion: "Poți adăuga un motiv (opțional) sau recontacta mai târziu.",
      ctaLabel: "Editează",
      ctaId: "edit",
    };
  }

  return {
    title: "Următorul pas",
    suggestion: "Contactează lead-ul și actualizează statusul sau calificarea.",
    ctaLabel: "Editează",
    ctaId: "edit",
  };
}

export function getNextBestActionForClient(client: Client): NextBestAction {
  const status = client.status;

  if (status === "active") {
    return {
      title: "Potrivire proprietăți",
      suggestion: "Caută proprietăți după buget, zone și criterii, apoi trimite opțiuni relevante.",
      ctaLabel: "Potrivește proprietăți",
      ctaId: "match_properties",
    };
  }

  return {
    title: "Programează vizionare",
    suggestion: "Programează o vizionare pentru o proprietate potrivită sau creează o tranzacție dacă clientul a ales.",
    ctaLabel: "Programează vizionare",
    ctaId: "schedule_viewing",
  };
}

export function getNextBestActionForDeal(deal: Deal): NextBestAction {
  const status = deal.status;

  if (status === "negotiation") {
    return {
      title: "Înregistrează oferta",
      suggestion: "Notează oferta sau contraoferta și termenii negociați.",
      ctaLabel: "Înregistrează ofertă",
      ctaId: "record_offer",
    };
  }

  if (status === "offer_sent") {
    return {
      title: "Urmează oferta",
      suggestion: "Stabilește un termen de răspuns și clarifică obiecțiile dacă există.",
      ctaLabel: "Actualizează status",
      ctaId: "update_status",
    };
  }

  if (status === "offer_accepted" || status === "contract") {
    return {
      title: "Acte și checklist",
      suggestion: "Completează checklist-ul: acte identitate, CF, programare notar.",
      ctaLabel: "Completează checklist",
      ctaId: "complete_checklist",
    };
  }

  if (status === "won") {
    return {
      title: "Tranzacție câștigată",
      suggestion: "Arhivează și înregistrează comisionul dacă nu e deja făcut.",
      ctaLabel: "Închide și arhivează",
      ctaId: "close_archive",
    };
  }

  if (status === "lost") {
    return {
      title: "Tranzacție pierdută",
      suggestion: "Adaugă motivul pierderii (opțional) pentru rapoarte.",
      ctaLabel: "Editează",
      ctaId: "edit",
    };
  }

  return {
    title: "Următorul pas",
    suggestion: "Programează vizionare sau trimite oferta conform stadiului tranzacției.",
    ctaLabel: "Programează vizionare",
    ctaId: "schedule_viewing",
  };
}
