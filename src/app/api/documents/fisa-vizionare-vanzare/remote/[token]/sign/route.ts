import { NextResponse } from "next/server";
import { getSession, markSigned } from "@/lib/signing-sessions";
import { buildFisaVizionareVanzarePdf } from "@/lib/fisaVizionareVanzarePdf";
import { createDownloadToken } from "@/lib/pdf-temp-store";

export const dynamic = "force-dynamic";

const PDF_FILENAME = "fisa-vizionare-vanzare-semnata.pdf";

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "";
}

export async function POST(
  request: Request,
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
        { status: 409 }
      );
    }

    const body = await request.json();
    const nume = (body.nume ?? "").toString().trim();
    const signatureDataurl = (body.signature_visitor_dataurl ?? "").toString().trim();
    if (!nume) {
      return NextResponse.json({ error: "Numele este obligatoriu." }, { status: 400 });
    }
    // Semnătură digitală: fără imagine, doar IP + dată/ora (în signature_meta)

    const ip = getClientIp(request);
    const now = new Date();
    const signatureMeta = {
      signed_at: now.toISOString(),
      timezone: "Europe/Bucharest",
      ip: ip || "—",
    };

    const agent = session.agentData;
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
      nume,
      telefon: (body.telefon ?? "").toString().trim(),
      email: (body.email ?? "").toString().trim(),
      ci_serie: (body.ci_serie ?? "").toString().trim(),
      ci_numar: (body.ci_numar ?? "").toString().trim(),
      tip_imobil: agent.tip_imobil,
      adresa_locuintei: agent.adresa_completa,
      comision_procent: agent.comision_procent,
      signature_visitor_dataurl: signatureDataurl.startsWith("data:image/") ? signatureDataurl : "",
      signature_meta: signatureMeta,
      agent_signature_meta: session.agentSignatureMeta ?? undefined,
    };

    const pdfBytes = await buildFisaVizionareVanzarePdf(payload);

    await markSigned(
      token,
      {
        nume,
        telefon: (body.telefon ?? "").toString().trim(),
        email: (body.email ?? "").toString().trim(),
        ci_serie: (body.ci_serie ?? "").toString().trim(),
        ci_numar: (body.ci_numar ?? "").toString().trim(),
        signature_visitor_dataurl: signatureDataurl.startsWith("data:image/") ? signatureDataurl : undefined,
      },
      signatureMeta,
      pdfBytes
    );

    const bytes = new Uint8Array(pdfBytes);
    const downloadToken = await createDownloadToken(bytes, PDF_FILENAME);
    return NextResponse.json(
      { downloadToken, filename: PDF_FILENAME },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Remote sign error:", e);
    return NextResponse.json(
      { error: "Eroare la semnare." },
      { status: 500 }
    );
  }
}
