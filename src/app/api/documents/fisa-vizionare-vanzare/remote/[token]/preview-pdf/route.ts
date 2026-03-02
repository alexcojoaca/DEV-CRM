import { NextResponse } from "next/server";
import { getSession } from "@/lib/signing-sessions";
import { buildFisaVizionareVanzarePdf } from "@/lib/fisaVizionareVanzarePdf";

export const dynamic = "force-dynamic";

/**
 * Returnează un PDF de previzualizare al fișei (fără date vizitator, doar agenție + detaliu vizionare).
 * Clientul poate deschide acest PDF în tab nou pentru a citi contractul înainte de semnare.
 */
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
      ci_serie: "—",
      ci_numar: "—",
      tip_imobil: agent.tip_imobil ?? "",
      adresa_locuintei: agent.adresa_completa ?? "",
      comision_procent: agent.comision_procent ?? "",
      signature_visitor_dataurl: "",
      agent_signature_meta: session.agentSignatureMeta ?? undefined,
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
    console.error("Preview PDF error:", e);
    return NextResponse.json(
      { error: "Eroare la generare previzualizare." },
      { status: 500 }
    );
  }
}
