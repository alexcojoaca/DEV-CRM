import { NextResponse } from "next/server";
import { buildFisaVizionareVanzarePdf } from "@/lib/fisaVizionareVanzarePdf";

export const dynamic = "force-dynamic";

/**
 * Previzualizare PDF pentru flow-ul „Trimite către client”.
 * Primește același body ca create (fără userId), returnează PDF-ul cu date agenție/vizionare și placeholder pentru vizitator.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agent = {
      data_vizionarii: body.data_vizionarii ?? "",
      ora_vizionarii: body.ora_vizionarii ?? "",
      tip_imobil: body.tip_imobil ?? "",
      adresa_completa: body.adresa_completa ?? "",
      adresa_publica: body.adresa_publica ?? "",
      comision_procent: body.comision_procent ?? "",
      agency_denumire: body.agency_denumire ?? "",
      agency_sediu: body.agency_sediu ?? "",
      agency_nr_orc: body.agency_nr_orc ?? "",
      agency_cui: body.agency_cui ?? "",
      agency_iban: body.agency_iban ?? "",
      agency_banca: body.agency_banca ?? "",
      agency_reprezentat_prin: body.agency_reprezentat_prin ?? "",
      agency_functia: body.agency_functia ?? "",
      agent_name: body.agent_name ?? "",
    };
    const payload = {
      data_vizionarii: agent.data_vizionarii,
      ora_vizionarii: agent.ora_vizionarii,
      agency_denumire: agent.agency_denumire,
      agency_sediu: agent.agency_sediu,
      agency_nr_orc: agent.agency_nr_orc,
      agency_cui: agent.agency_cui,
      agency_iban: agent.agency_iban,
      agency_banca: agent.agency_banca,
      agency_reprezentat_prin: agent.agency_reprezentat_prin,
      agency_functia: agent.agency_functia,
      agent_name: agent.agent_name,
      nume: "—",
      telefon: "—",
      email: "—",
      ci_serie: "—",
      ci_numar: "—",
      tip_imobil: agent.tip_imobil,
      adresa_locuintei: agent.adresa_completa,
      comision_procent: agent.comision_procent,
      signature_visitor_dataurl: "",
      agent_signature_meta: undefined,
    };
    const pdfBytes = await buildFisaVizionareVanzarePdf(payload);
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="fisa-vizionare-vanzare-vizualizare.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Remote preview PDF error:", e);
    return NextResponse.json(
      { error: "Eroare la previzualizare." },
      { status: 500 }
    );
  }
}
