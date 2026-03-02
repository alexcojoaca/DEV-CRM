/**
 * PDF Prezentare proprietate – fișă cu titlu, preț, adresă, caracteristici, descriere.
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 50;
const MAX_W = A4_WIDTH - 2 * MARGIN;

function toAscii(s: string): string {
  return (s || "")
    .replace(/ă/g, "a")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/ș/g, "s")
    .replace(/ț/g, "t")
    .replace(/Ă/g, "A")
    .replace(/Â/g, "A")
    .replace(/Î/g, "I")
    .replace(/Ș/g, "S")
    .replace(/Ț/g, "T")
    .replace(/—/g, "-");
}

function s(val: unknown): string {
  if (val == null) return "";
  if (typeof val === "string") return val.trim();
  return String(val).trim();
}

export interface PropertyPresentationPayload {
  title: string;
  transactionType: "sale" | "rent";
  type: string;
  price: number;
  priceCurrency: string;
  address?: string;
  usefulArea?: number;
  yardArea?: number;
  rooms?: number;
  bathrooms?: number;
  description?: string;
  details?: string[];
  /** Base64 data URL image (optional) */
  imageDataUrl?: string;
}

export async function buildPropertyPresentationPdf(data: PropertyPresentationPayload): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
  let y = A4_HEIGHT - MARGIN;

  const drawText = (text: string, x: number, size: number, bold = false) => {
    const f = bold ? fontBold : font;
    page.drawText(toAscii(text), { x, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
    y -= size * 1.2;
  };

  const typeLabels: Record<string, string> = {
    apartment: "Apartament",
    house: "Casa",
    land: "Teren",
    commercial: "Spatiu comercial",
  };
  const typeLabel = typeLabels[data.type] || data.type;

  // Title
  const titleLine = (data.title || "Prezentare proprietate").slice(0, 80);
  page.drawText(toAscii(titleLine), {
    x: MARGIN,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.4, 0.2, 0.5),
  });
  y -= 24;

  // Type + Price
  drawText(`${typeLabel} • ${data.transactionType === "rent" ? "Inchiriere" : "Vanzare"}`, MARGIN, 10);
  const priceStr = `${data.price.toLocaleString("ro-RO")} ${data.priceCurrency || "EUR"}${data.transactionType === "rent" ? " / luna" : ""}`;
  page.drawText(toAscii(priceStr), { x: MARGIN, y, size: 14, font: fontBold, color: rgb(0.4, 0.2, 0.5) });
  y -= 20;

  if (data.address) {
    drawText("Adresa: " + data.address.slice(0, 100), MARGIN, 10);
  }

  if (data.usefulArea != null && data.usefulArea > 0) {
    drawText(`Suprafata utila: ${data.usefulArea} mp`, MARGIN, 10);
  }
  if (data.yardArea != null && data.yardArea > 0) {
    drawText(`Suprafata teren: ${data.yardArea} mp`, MARGIN, 10);
  }
  if (data.rooms != null) {
    drawText(`Camere: ${data.rooms}`, MARGIN, 10);
  }
  if (data.bathrooms != null) {
    drawText(`Bai: ${data.bathrooms}`, MARGIN, 10);
  }

  if (data.details?.length) {
    y -= 6;
    data.details.slice(0, 8).forEach((line) => {
      drawText(line.slice(0, 120), MARGIN, 9);
    });
  }

  if (data.description) {
    y -= 10;
    const desc = data.description.slice(0, 800).replace(/\n/g, " ");
    const words = desc.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(toAscii(test), 9) <= MAX_W) line = test;
      else {
        if (line) {
          page.drawText(toAscii(line), { x: MARGIN, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
          y -= 11;
        }
        line = w;
      }
    }
    if (line) {
      page.drawText(toAscii(line), { x: MARGIN, y, size: 9, font, color: rgb(0.3, 0.3, 0.3) });
      y -= 11;
    }
  }

  return doc.save();
}
