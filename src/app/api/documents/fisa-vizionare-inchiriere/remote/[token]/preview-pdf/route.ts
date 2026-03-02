import { NextResponse } from "next/server";
import { getSession } from "@/lib/signing-sessions-inchiriere";
import { buildFisaVizionareInchirierePdf } from "@/lib/fisaVizionareInchirierePdf";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await getSession(token);
    if (!session) {
      return NextResponse.json({ error: "Link invalid sau expirat." }, { status: 404 });
    }
    if (session.status === "signed") {
      return NextResponse.json(
        { error: "Documentul a fost deja semnat." },
        { status: 410 }
      );
    }

    const agent = session.agentData;
    const payload = {
      data_vizionarii: agent.data_vizionarii ?? "",
      ora_vizionarii: agent.ora_vizionarii ?? "",
      agency_denumire: agent.agency_denumire ?? "",
      agency_sediu: agent.agency_sediu ?? "",
      agency_nr_orc: agent.agency_nr_orc ?? "",
      agency_cui: agent.agency_cui ?? "",
      agency_iban: agent.agency_iban ?? "",
      agency_banca: agent.agency_banca ?? "",
      agency_reprezentat_prin: agent.agency_reprezentat_prin ?? "",
      agency_functia: agent.agency_functia ?? "",
      agent_name: agent.agent_name ?? "",
      nume: "—",
      telefon: "—",
      email: "—",
      ci_serie_numar: "—",
      tip_imobil: agent.tip_imobil ?? "",
      adresa_zona: agent.adresa_completa ?? "",
      alte_detalii: "",
      comision_procent: agent.comision_procent ?? "",
      comision_termen_plata_zile: agent.comision_termen_plata_zile ?? "7",
      signature_visitor_dataurl: "",
      agent_signature_meta: session.agentSignatureMeta ?? undefined,
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
    console.error("Preview PDF inchiriere error:", e);
    return NextResponse.json(
      { error: "Eroare la generare previzualizare." },
      { status: 500 }
    );
  }
}
