import { NextResponse } from "next/server";
import { buildContractPrestariServiciiPdf } from "@/lib/contractPrestariServiciiPdf";
import type { ContractPrestariServiciiPdfPayload } from "@/lib/contractPrestariServiciiPdf";
import { createDownloadToken } from "@/lib/pdf-temp-store";

export const dynamic = "force-dynamic";

const PDF_FILENAME = "contract-prestari-servicii.pdf";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const variant = body.variant === "chirie" ? "chirie" : "vanzare";

    const payload: ContractPrestariServiciiPdfPayload = {
      variant,
      nr_contract: body.nr_contract ?? "",
      data_contract: body.data_contract ?? "",
      agency_denumire: body.agency_denumire ?? "",
      agency_sediu: body.agency_sediu ?? "",
      agency_nr_orc: body.agency_nr_orc ?? "",
      agency_cui: body.agency_cui ?? "",
      agency_iban: body.agency_iban ?? "",
      agency_reprezentat_prin: body.agency_reprezentat_prin ?? "",
      client_nume: body.client_nume ?? "",
      client_cnp_cui: body.client_cnp_cui ?? "",
      client_ci_rc: body.client_ci_rc ?? "",
      client_domiciliu: body.client_domiciliu ?? "",
      client_telefon: body.client_telefon ?? "",
      client_email: body.client_email ?? "",
      adresa_imobil: body.adresa_imobil ?? "",
      comision_tip: body.comision_tip ?? undefined,
      comision_valoare: body.comision_valoare ?? "",
      comision_alta_formula: body.comision_alta_formula ?? "",
      exigibilitate_inchiriere: variant === "chirie" ? body.exigibilitate_inchiriere !== false : undefined,
      exigibilitate_antecontract: variant === "vanzare" ? body.exigibilitate_antecontract === true : undefined,
      exigibilitate_vanzare: variant === "vanzare" ? body.exigibilitate_vanzare !== false : undefined,
      penalitati_procent: body.penalitati_procent ?? "",
      instanta_competenta: body.instanta_competenta ?? "",
    };

    const pdfBytes = await buildContractPrestariServiciiPdf(payload);
    const bytes = new Uint8Array(pdfBytes);

    const token = await createDownloadToken(bytes, PDF_FILENAME);
    return NextResponse.json(
      { downloadToken: token, filename: PDF_FILENAME },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Contract prestari servicii PDF error:", e);
    return NextResponse.json(
      { error: "Generare PDF eșuată." },
      { status: 500 }
    );
  }
}
