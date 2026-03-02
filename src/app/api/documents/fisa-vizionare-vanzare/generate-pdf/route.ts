import { NextResponse } from "next/server";
import { buildFisaVizionareVanzarePdf } from "@/lib/fisaVizionareVanzarePdf";
import { createDownloadToken } from "@/lib/pdf-temp-store";

export const dynamic = "force-dynamic";

const PDF_FILENAME = "fisa-vizionare-vanzare.pdf";

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
      nume: body.nume ?? "",
      telefon: body.telefon ?? "",
      email: body.email ?? "",
      ci_serie: body.ci_serie ?? "",
      ci_numar: body.ci_numar ?? "",
      tip_imobil: body.tip_imobil ?? "",
      adresa_locuintei: body.adresa_locuintei ?? "",
      comision_procent: body.comision_procent ?? "",
      signature_visitor_dataurl: body.signature_visitor_dataurl ?? "",
      signature_meta: body.signature_meta
        ? {
            signed_at: body.signature_meta.signed_at,
            timezone: body.signature_meta.timezone ?? "Europe/Bucharest",
            ip: body.signature_meta.ip ?? "",
          }
        : undefined,
      signature_agent_dataurl: body.signature_agent_dataurl ?? undefined,
      agent_signature_meta: body.agent_signature_meta
        ? {
            signed_at: body.agent_signature_meta.signed_at,
            timezone: body.agent_signature_meta.timezone ?? "Europe/Bucharest",
            ip: body.agent_signature_meta.ip ?? "",
          }
        : undefined,
    };

    const pdfBytes = await buildFisaVizionareVanzarePdf(payload);
    const bytes = new Uint8Array(pdfBytes);

    const preview = body.preview === true;
    if (preview) {
      return new NextResponse(bytes, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'inline; filename="fisa-vizionare-vanzare-vizualizare.pdf"',
          "Cache-Control": "no-store",
        },
      });
    }

    const token = await createDownloadToken(bytes, PDF_FILENAME);
    return NextResponse.json(
      { downloadToken: token, filename: PDF_FILENAME },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Generate PDF error:", e);
    return NextResponse.json(
      { error: "Generare PDF esuata." },
      { status: 500 }
    );
  }
}
