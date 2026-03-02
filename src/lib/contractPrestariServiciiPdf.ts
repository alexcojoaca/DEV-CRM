/**
 * PDF Contract de intermediere imobiliară (tranzacție determinată).
 * Variantă: chirie sau vânzare – textul și câmpurile se adaptează.
 */

import { PDFDocument, StandardFonts, type PDFFont, rgb } from "pdf-lib";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN_CM = 2;
const MARGIN = (MARGIN_CM / 2.54) * 72;
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

function wrap(text: string, pdfFont: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = (text || "").split(/\s+/).filter(Boolean);
  let current = "";
  for (const w of words) {
    const test = current ? current + " " + w : w;
    const width = pdfFont.widthOfTextAtSize(toAscii(test), size);
    if (width <= maxWidth) current = test;
    else {
      if (current) lines.push(toAscii(current));
      current = w;
    }
  }
  if (current) lines.push(toAscii(current));
  return lines;
}

export type PrestariVariant = "chirie" | "vanzare";

export interface ContractPrestariServiciiPdfPayload {
  variant: PrestariVariant;
  nr_contract?: string;
  data_contract?: string;
  /** Prestator */
  agency_denumire?: string;
  agency_sediu?: string;
  agency_nr_orc?: string;
  agency_cui?: string;
  agency_iban?: string;
  agency_reprezentat_prin?: string;
  /** Client */
  client_nume?: string;
  client_cnp_cui?: string;
  client_ci_rc?: string;
  client_domiciliu?: string;
  client_telefon?: string;
  client_email?: string;
  /** Imobil */
  adresa_imobil?: string;
  /** Comision: tip + valoare */
  comision_tip?: "procent_chirie" | "chirii_lunare" | "procent_vanzare" | "alta";
  comision_valoare?: string;
  comision_alta_formula?: string;
  /** Exigibilitate (pentru chirie: inchiriere; pentru vanzare: antecontract/contract vanzare) */
  exigibilitate_inchiriere?: boolean;
  exigibilitate_antecontract?: boolean;
  exigibilitate_vanzare?: boolean;
  /** Penalități întârziere % pe zi */
  penalitati_procent?: string;
  /** Instanță competentă */
  instanta_competenta?: string;
}

const PLACEHOLDER = "—";

function fmtDate(d: string): string {
  if (!s(d)) return PLACEHOLDER;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s(d))) {
    const [yy, mm, dd] = s(d).split("-");
    return `${dd}.${mm}.${yy}`;
  }
  return s(d);
}

export async function buildContractPrestariServiciiPdf(
  data: ContractPrestariServiciiPdfPayload
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const variant = data.variant === "chirie" ? "chirie" : "vanzare";
  const isChirie = variant === "chirie";

  let page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
  let y = A4_HEIGHT - MARGIN;
  const lineHeight = 14;
  const lineHeightSmall = 12;
  const gap = 6;
  const sectionGap = 14;

  function ensureSpace(h: number) {
    if (y - h < MARGIN + 40) {
      page.drawText(`Pagina 1`, {
        x: A4_WIDTH - MARGIN - 40,
        y: 1.15 * (72 / 2.54),
        size: 9,
        font,
      });
      page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
      y = A4_HEIGHT - MARGIN;
    }
  }

  function drawPara(text: string, size = 10) {
    const lines = wrap(text, font, size, MAX_W);
    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, { x: MARGIN, y, size, font });
      y -= lineHeight;
    }
    y -= gap;
  }

  function drawTitle(text: string) {
    ensureSpace(sectionGap + 16);
    page.drawText(toAscii(text), { x: MARGIN, y, size: 11, font: fontBold });
    y -= lineHeightSmall + 2;
  }

  function drawLabelVal(label: string, value: string, size = 10) {
    const v = s(value) || PLACEHOLDER;
    page.drawText(toAscii(`${label}: ${v}`), { x: MARGIN, y, size, font });
    y -= lineHeightSmall;
  }

  const nrContract = s(data.nr_contract) || "___";
  const dataContract = fmtDate(data.data_contract ?? "");
  const denumire = s(data.agency_denumire) || PLACEHOLDER;
  const sediu = s(data.agency_sediu) || PLACEHOLDER;
  const nrOrc = s(data.agency_nr_orc) || PLACEHOLDER;
  const cui = s(data.agency_cui) || PLACEHOLDER;
  const iban = s(data.agency_iban) || PLACEHOLDER;
  const reprezentat = s(data.agency_reprezentat_prin) || PLACEHOLDER;
  const clientNume = s(data.client_nume) || PLACEHOLDER;
  const clientCnpCui = s(data.client_cnp_cui) || PLACEHOLDER;
  const clientCiRc = s(data.client_ci_rc) || PLACEHOLDER;
  const clientDomiciliu = s(data.client_domiciliu) || PLACEHOLDER;
  const clientTelefon = s(data.client_telefon) || PLACEHOLDER;
  const clientEmail = s(data.client_email) || PLACEHOLDER;
  const adresaImobil = s(data.adresa_imobil) || PLACEHOLDER;
  const penalitati = s(data.penalitati_procent) || "___";
  const instanta = s(data.instanta_competenta) || PLACEHOLDER;

  // ----- Titlu -----
  ensureSpace(24);
  page.drawText(toAscii("CONTRACT DE INTERMEDIERE IMOBILIARA"), {
    x: MARGIN,
    y,
    size: 14,
    font: fontBold,
  });
  y -= 8;
  page.drawText(toAscii("(Tranzactie determinata)"), { x: MARGIN, y, size: 10, font });
  y -= lineHeight;
  page.drawText(toAscii(`Nr. ${nrContract} / Data ${dataContract}`), { x: MARGIN, y, size: 10, font: fontBold });
  y -= sectionGap;

  // ----- I. PĂRȚILE -----
  drawTitle("I. PARTILE");

  drawTitle("1. PRESTATOR");
  drawPara(denumire + ",", 10);
  drawLabelVal("cu sediul in", sediu);
  drawLabelVal("inregistrata la ORC sub nr.", nrOrc);
  drawLabelVal("CUI", cui);
  drawLabelVal("IBAN", iban);
  drawLabelVal("reprezentata prin", reprezentat);
  drawPara('denumita in continuare „Prestatorul".', 10);
  y -= 4;

  drawTitle("2. CLIENT");
  drawLabelVal("Nume / Denumire", clientNume);
  drawLabelVal("CNP / CUI", clientCnpCui);
  drawLabelVal("CI / RC", clientCiRc);
  drawLabelVal("Domiciliu / Sediu", clientDomiciliu);
  drawLabelVal("Telefon", clientTelefon);
  drawLabelVal("Email", clientEmail);
  drawPara('denumit in continuare „Clientul".', 10);
  y -= sectionGap;

  // ----- Art. 1 -----
  drawTitle("Art. 1 – Obiectul contractului");
  drawPara("1.1. Prezentul contract are ca obiect intermedierea realizata de Prestator in vederea incheierii unei tranzactii privind imobilul situat in:", 10);
  y -= 2;
  drawPara(adresaImobil, 10);
  drawPara("1.2. Clientul confirma ca:", 10);
  drawPara("- a fost pus in legatura cu cealalta parte a tranzactiei prin intermediul Prestatorului;", 9.5);
  drawPara("- tranzactia este rezultatul direct al intermedierii realizate de Prestator.", 9.5);
  drawPara("1.3. Contractul are caracter punctual si priveste exclusiv imobilul mentionat.", 10);
  y -= sectionGap;

  // ----- Art. 2 – Comision (variant) -----
  drawTitle("Art. 2 – Comision");
  drawPara("2.1. Pentru serviciile prestate, Clientul datoreaza Prestatorului un comision de:", 10);

  const comisionTip = data.comision_tip ?? "";
  const comisionVal = s(data.comision_valoare) || "___";
  const altaFormula = s(data.comision_alta_formula) || "___";

  const cb = (v: boolean) => (v ? "[X]" : "[ ]");
  if (isChirie) {
    drawPara(`${cb(comisionTip === "procent_chirie")} ${comisionTip === "procent_chirie" ? comisionVal : "___"} % din valoarea chiriei lunare`, 10);
    drawPara(`${cb(comisionTip === "chirii_lunare")} echivalentul a ${comisionTip === "chirii_lunare" ? comisionVal : "___"} chirii lunare`, 10);
    drawPara("[ ] ___ % din pretul total de vanzare (nu se aplica la inchiriere)", 9.5);
    drawPara(`${cb(comisionTip === "alta")} alta formula: ${comisionTip === "alta" ? altaFormula : "_______________________"}`, 10);
  } else {
    drawPara("[ ] ___ % din valoarea chiriei lunare (nu se aplica la vanzare)", 9.5);
    drawPara("[ ] echivalentul a ___ chirii lunare (nu se aplica la vanzare)", 9.5);
    drawPara(`${cb(comisionTip === "procent_vanzare")} ${comisionTip === "procent_vanzare" ? comisionVal : "___"} % din pretul total de vanzare`, 10);
    drawPara(`${cb(comisionTip === "alta")} alta formula: ${comisionTip === "alta" ? altaFormula : "_______________________"}`, 10);
  }

  drawPara("2.2. Comisionul devine exigibil la data semnarii:", 10);
  if (isChirie) {
    const checkInch = data.exigibilitate_inchiriere !== false;
    drawPara(`${cb(checkInch)} contractului de inchiriere`, 9.5);
    drawPara("[ ] antecontractului (nu se aplica)", 9.5);
    drawPara("[ ] contractului de vanzare-cumparare (nu se aplica)", 9.5);
  } else {
    drawPara("[ ] contractului de inchiriere (nu se aplica)", 9.5);
    const checkAnte = data.exigibilitate_antecontract === true;
    const checkVanz = data.exigibilitate_vanzare !== false;
    drawPara(`${cb(checkAnte)} antecontractului`, 9.5);
    drawPara(`${cb(checkVanz)} contractului de vanzare-cumparare`, 9.5);
  }
  drawPara("oricare intervine prima.", 9.5);

  drawPara("2.3. Comisionul este datorat chiar daca:", 10);
  drawPara("- tranzactia este incheiata direct intre parti;", 9.5);
  drawPara("- conditiile (pret, termen, modalitate de plata) sunt modificate;", 9.5);
  drawPara("- tranzactia este incheiata ulterior, dar in legatura cu introducerea realizata de Prestator.", 9.5);
  y -= sectionGap;

  // ----- Art. 3 -----
  drawTitle("Art. 3 – Neeludarea intermedierii");
  drawPara("3.1. Clientul se obliga sa nu eludeze intermedierea realizata de Prestator.", 10);
  drawPara("3.2. In cazul in care, in termen de 6 (sase) luni de la data prezentului contract, Clientul incheie o tranzactie privind imobilul indicat la art. 1, comisionul ramane datorat.", 10);
  drawPara("3.3. Comisionul stabilit reprezinta prejudiciu minim prezumat in caz de eludare.", 10);
  y -= sectionGap;

  // ----- Art. 4 -----
  drawTitle("Art. 4 – Raspundere");
  drawPara("4.1. Prestatorul are obligatie de diligența, nu de rezultat.", 10);
  drawPara("4.2. Clientul este obligat la plata comisionului la termen.", 10);
  drawPara(`4.3. Penalitati pentru intarziere: ${penalitati} % pe zi.`, 10);
  y -= sectionGap;

  // ----- Art. 5 -----
  drawTitle("Art. 5 – Protectia datelor");
  drawPara("Datele sunt prelucrate in temeiul executarii prezentului contract si al interesului legitim privind dovedirea intermedierii si plata comisionului.", 10);
  y -= sectionGap;

  // ----- Art. 6 -----
  drawTitle("Art. 6 – Semnare electronica");
  drawPara("6.1. Prezentul contract poate fi semnat: olograf; prin semnatura electronica simpla (trasare pe ecran cu degetul sau stylus); prin confirmare electronica asociata adresei IP, datei, orei, fusului orar si altor metadate tehnice.", 10);
  drawPara("6.2. Partile accepta ca forma electronica produce efecte juridice si are valoare probatorie conform legislatiei romane aplicabile.", 10);
  drawPara("6.3. Contractul nu poate fi respins ca proba doar pentru faptul ca este in format electronic.", 10);
  y -= sectionGap;

  // ----- Art. 7 -----
  drawTitle("Art. 7 – Dispozitii finale");
  drawPara("Contractul este guvernat de legea romana.", 10);
  drawPara(`Eventualele litigii vor fi solutionate de instantele competente din ${instanta}.`, 10);
  y -= sectionGap;

  // ----- SEMNĂTURI -----
  drawTitle("SEMNATURI");
  drawPara("Prestator ___________________________", 10);
  drawPara("Client ______________________________", 10);
  drawPara("Data ________________________________", 10);

  page.drawText("Pagina 1", {
    x: A4_WIDTH - MARGIN - 40,
    y: 1.15 * (72 / 2.54),
    size: 9,
    font,
  });

  return doc.save();
}
