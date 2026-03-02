import { NextResponse } from "next/server";
import { buildPropertyPresentationPdf } from "@/lib/propertyPresentationPdf";
import { createDownloadToken } from "@/lib/pdf-temp-store";

export const dynamic = "force-dynamic";

const PDF_FILENAME = "prezentare-proprietate.pdf";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = [body.street, body.number, body.zone, body.county].filter(Boolean).join(", ") || body.city || "";
    const details: string[] = [];
    if (body.buildingType) details.push(`Tip imobil: ${body.buildingType}`);
    if (body.floor != null) details.push(`Etaj: ${body.floor}`);
    if (body.landCategory) details.push(`Tip teren: ${body.landCategory}`);
    if (body.commercialCategory) details.push(`Categorie: ${body.commercialCategory}`);
    if (body.constructionYear) details.push(`An constructie: ${body.constructionYear}`);

    const payload = {
      title: body.title ?? "Proprietate",
      transactionType: body.transactionType ?? "sale",
      type: body.type ?? "apartment",
      price: typeof body.price === "number" ? body.price : 0,
      priceCurrency: body.priceCurrency ?? "EUR",
      address,
      usefulArea: body.usefulArea,
      yardArea: body.yardArea,
      rooms: body.rooms ?? body.bedrooms,
      bathrooms: body.bathrooms,
      description: body.description,
      details: details.length ? details : undefined,
    };

    const pdfBytes = await buildPropertyPresentationPdf(payload);
    const bytes = new Uint8Array(pdfBytes);
    const token = await createDownloadToken(bytes, PDF_FILENAME);
    return NextResponse.json(
      { downloadToken: token, filename: PDF_FILENAME },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Prezentare proprietate PDF error:", e);
    return NextResponse.json(
      { error: "Generare PDF eșuată." },
      { status: 500 }
    );
  }
}
