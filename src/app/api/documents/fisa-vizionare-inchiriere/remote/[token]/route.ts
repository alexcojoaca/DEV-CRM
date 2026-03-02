import { NextResponse } from "next/server";
import { getSession } from "@/lib/signing-sessions-inchiriere";

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
        { error: "Documentul a fost deja semnat.", status: "signed" },
        { status: 410 }
      );
    }
    const a = session.agentData;
    return NextResponse.json({
      token: session.token,
      data_vizionarii: a.data_vizionarii,
      ora_vizionarii: a.ora_vizionarii,
      tip_imobil: a.tip_imobil,
      adresa_publica: a.adresa_publica,
      adresa_completa: a.adresa_completa,
      comision_procent: a.comision_procent,
      comision_termen_plata_zile: a.comision_termen_plata_zile ?? "7",
      agency_denumire: a.agency_denumire ?? "",
      agency_sediu: a.agency_sediu ?? "",
      agency_nr_orc: a.agency_nr_orc ?? "",
      agency_cui: a.agency_cui ?? "",
      agency_iban: a.agency_iban ?? "",
      agency_banca: a.agency_banca ?? "",
      agency_reprezentat_prin: a.agency_reprezentat_prin ?? "",
      agency_functia: a.agency_functia ?? "",
      agent_name: a.agent_name ?? "",
    });
  } catch (e) {
    console.error("Remote get inchiriere error:", e);
    return NextResponse.json({ error: "Eroare." }, { status: 500 });
  }
}
