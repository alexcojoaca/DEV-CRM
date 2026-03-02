import { NextResponse } from "next/server";
import { buildFisaVizionareInchirierePdf } from "@/lib/fisaVizionareInchirierePdf";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      data_vizionarii: body.data_vizionarii ?? "",
      ora_vizionarii: body.ora_vizionarii ?? "",
      agency_denumire: body.agency_denumire ?? "",
      agency_sediu: body.agency_sediu ?? "",
      agency_nr_orc: body.agency_nr_orc ?? "",
      agency_cui: body.agency_cui ?? "",
      agency_iban: body.agency_iban ?? "",
      agency_banca: body.agency_banca ?? "",
      agency_reprezentat_prin: body.agency_reprezentat_prin ?? "",
      agency_functia: body.agency_functia ?? "",
      agent_name: body.agent_name ?? "",
      nume: "—",
      telefon: "—",
      email: "—",
      ci_serie_numar: "—",
      tip_imobil: body.tip_imobil ?? "",
      adresa_zona: body.adresa_completa ?? "",
      alte_detalii: "",
      comision_procent: body.comision_procent ?? "",
      comision_termen_plata_zile: body.comision_termen_plata_zile ?? "7",
      signature_visitor_dataurl: "",
      agent_signature_meta: undefined,
    };
    const pdfBytes = await buildFisaVizionareInchirierePdf(payload);
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="fisa-vizionare-inchiriere-vizualizare.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Remote preview PDF inchiriere error:", e);
    return NextResponse.json(
      { error: "Eroare la previzualizare." },
      { status: 500 }
    );
  }
}
