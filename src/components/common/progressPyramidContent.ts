export type ProgressPyramidLevel = "lead" | "client" | "deal";

export interface StageGuidance {
  title: string;
  description: string;
  actions: string[];
  nextStageHint: string;
}

export const STAGE_GUIDANCE: Record<ProgressPyramidLevel, StageGuidance> = {
  lead: {
    title: "Etapa Lead",
    description:
      "Scop: verifică intenția, bugetul, termenul și zona. Criterii pentru trecere la Client: buget SAU termen ȘI intenție confirmată.",
    actions: [
      "Care e bugetul maxim?",
      "În ce interval vreți să vă mutați / să semnați?",
      "Zonele obligatorii vs acceptabile?",
      "Metoda de finanțare (numerar / credit)?",
      "Confirmă că caută activ (nu doar „mă uit”).",
    ],
    nextStageHint:
      "Treci la Client când: buget SAU termen ȘI intenția sunt confirmate. Marchează lead-ul ca Calificat și apasă „Transformă în client”.",
  },
  client: {
    title: "Etapa Client",
    description:
      "Scop: potrivire + vizionări + listă scurtă. Următorii pași: arată opțiuni relevante, programează vizionare, confirmă finanțarea.",
    actions: [
      "Arată 3 opțiuni relevante (potrivite criteriilor)",
      "Programează vizionare",
      "Confirmă finanțarea (numerar/credit)",
      "Confirmă interesul pentru o proprietate anume",
    ],
    nextStageHint:
      "Treci la Deal când: proprietatea este aleasă ȘI vizionare programată sau intenție de ofertă. Creează Tranzacție din client + proprietate.",
  },
  deal: {
    title: "Etapa Tranzacție",
    description:
      "Scop: încheierea tranzacției. Pași în funcție de status: ofertă trimisă → clarifică obiecții; negociere → documentează termenii; acte → CF, acte, notar; semnat → marchează câștigat.",
    actions: [
      "OFFER_SENT → clarifică obiecții, stabilește termen limită",
      "NEGOTIATION → documentează termenii agreați",
      "DOCS → colectează CF, acte, programare notar",
      "SIGNED → marchează câștigat + înregistrează comision",
    ],
    nextStageHint:
      "După acord: marchează tranzacția ca Câștigată (Won) și completează checklist-ul de închidere.",
  },
};
