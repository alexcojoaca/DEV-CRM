/**
 * PDF Fișă de vizionare — VÂNZARE.
 * Draft aerișit, profesional; toate câmpurile din formular sunt completate în locul potrivit.
 * Semnătura clientului (imagine) se pune în chenarul Vizitator când e furnizată.
 */

import { PDFDocument, StandardFonts, type PDFPage, type PDFFont, rgb } from "pdf-lib";

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

export interface FisaVizionareVanzarePdfPayload {
  data_vizionarii?: string;
  ora_vizionarii?: string;
  agency_denumire?: string;
  agency_sediu?: string;
  agency_nr_orc?: string;
  agency_cui?: string;
  agency_iban?: string;
  agency_banca?: string;
  agency_reprezentat_prin?: string;
  agency_functia?: string;
  agent_name?: string;
  nume?: string;
  telefon?: string;
  email?: string;
  ci_serie?: string;
  ci_numar?: string;
  tip_imobil?: string;
  adresa_locuintei?: string;
  comision_procent?: string;
  signature_visitor_dataurl?: string;
  /** Pentru semnare la distanță: metadate semnătură electronică (data/ora, IP) */
  signature_meta?: {
    signed_at: string;
    timezone: string;
    ip: string;
  };
  /** Semnătură agent (imagine) — mod „Semnează acum” din setări */
  signature_agent_dataurl?: string;
  /** Semnătură agent la distanță: IP + data/ora când s-a generat linkul */
  agent_signature_meta?: {
    signed_at: string;
    timezone: string;
    ip: string;
  };
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
function fmtTime(t: string): string {
  if (!s(t)) return PLACEHOLDER;
  return s(t).length >= 5 ? s(t).slice(0, 5) : s(t);
}

export async function buildFisaVizionareVanzarePdf(
  data: FisaVizionareVanzarePdfPayload
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
  let y = A4_HEIGHT - MARGIN;
  let pageNo = 1;
  const lineHeight = 15;
  const lineHeightSmall = 13;
  const gap = 8;
  const sectionGap = 18;

  function newPage() {
    page.drawText(`Pagina ${pageNo}`, {
      x: A4_WIDTH - MARGIN - 40,
      y: 1.15 * (72 / 2.54),
      size: 9,
      font,
    });
    page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
    pageNo++;
    y = A4_HEIGHT - MARGIN;
  }

  function ensureSpace(h: number) {
    if (y - h < MARGIN + 30) newPage();
  }

  function drawLine() {
    ensureSpace(20);
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: A4_WIDTH - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.75, 0.75, 0.75),
    });
    y -= sectionGap;
  }

  function drawPara(text: string, size = 10.5) {
    const lines = wrap(text, font, size, MAX_W);
    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, { x: MARGIN, y, size, font });
      y -= lineHeight;
    }
    y -= gap;
  }

  function drawTitle(text: string) {
    ensureSpace(sectionGap + 22);
    page.drawText(toAscii(text), { x: MARGIN, y, size: 12, font: fontBold });
    y -= lineHeight + 4;
  }

  function drawLabelVal(label: string, value: string, size = 10.5) {
    const v = s(value) || PLACEHOLDER;
    page.drawText(toAscii(`${label}: ${v}`), { x: MARGIN, y, size, font });
    y -= lineHeightSmall;
  }

  const vizDate = fmtDate(data.data_vizionarii ?? "");
  const vizTime = fmtTime(data.ora_vizionarii ?? "");
  const denumire = s(data.agency_denumire) || PLACEHOLDER;
  const sediu = s(data.agency_sediu) || PLACEHOLDER;
  const nrOrc = s(data.agency_nr_orc) || PLACEHOLDER;
  const cui = s(data.agency_cui) || PLACEHOLDER;
  const iban = s(data.agency_iban) || PLACEHOLDER;
  const banca = s(data.agency_banca) || PLACEHOLDER;
  const reprezentat = s(data.agency_reprezentat_prin) || PLACEHOLDER;
  const functia = s(data.agency_functia) || PLACEHOLDER;
  const agentName = s(data.agent_name) || PLACEHOLDER;
  const nume = s(data.nume) || PLACEHOLDER;
  const telefon = s(data.telefon) || PLACEHOLDER;
  const email = s(data.email) || PLACEHOLDER;
  const ciSerie = s(data.ci_serie) || PLACEHOLDER;
  const ciNumar = s(data.ci_numar) || PLACEHOLDER;
  const tipImobil = s(data.tip_imobil) || PLACEHOLDER;
  const adresa = s(data.adresa_locuintei) || PLACEHOLDER;
  const comision = s(data.comision_procent) || "____";

  // ----- Titlu -----
  ensureSpace(32);
  page.drawText(toAscii("FISA DE VIZIONARE — VANZARE"), {
    x: A4_WIDTH / 2 - 105,
    y,
    size: 17,
    font: fontBold,
  });
  y -= 28;

  drawLabelVal("Data vizionarii (si semnarii)", vizDate, 11);
  drawLabelVal("Ora vizionarii (si semnarii)", vizTime, 11);
  y -= gap;
  drawLine();

  // ----- 1. PĂRȚI -----
  drawTitle("1. PARTI");
  page.drawText(toAscii("Prestator (Agentie imobiliara):"), { x: MARGIN, y, size: 10.5, font: fontBold });
  y -= lineHeightSmall;
  drawLabelVal("Denumire", denumire);
  drawLabelVal("Sediu social", sediu);
  drawLabelVal("Nr. ORC", nrOrc);
  drawLabelVal("CUI", cui);
  drawLabelVal("IBAN", iban);
  drawLabelVal("Banca", banca);
  drawLabelVal("Reprezentata legal prin", reprezentat);
  drawLabelVal("Functia", functia);
  drawPara('Denumita in continuare „Prestatorul".', 10.5);
  y -= 4;
  drawLabelVal("Agent imobiliar", agentName);
  y -= gap;
  drawLine();

  // ----- 2. VIZITATOR -----
  drawTitle("2. VIZITATOR (CLIENT)");
  drawLabelVal("Nume", nume);
  drawLabelVal("Telefon", telefon);
  drawLabelVal("E-mail", email);
  drawLabelVal("Act identitate (CI) — serie", ciSerie);
  drawLabelVal("Act identitate (CI) — numar", ciNumar);
  y -= 4;
  drawPara(
    "Vizitatorul declara ca datele furnizate sunt corecte, reale si ii apartin. Furnizarea datelor are ca scop organizarea vizionarii, intermedierea si, dupa caz, dovedirea intermedierii si a consimtamantului exprimat prin semnare."
  );
  drawPara(
    "In masura in care unele date sunt optionale, acestea sunt furnizate voluntar; refuzul furnizarii poate limita posibilitatea dovedirii identitatii in cazul unei contestari, fara a anula prin sine insasi valoarea prezentei fise."
  );
  drawLine();

  // ----- 3. IMOBIL -----
  drawTitle("3. IMOBIL VIZIONAT");
  drawLabelVal("Tip imobil", tipImobil);
  drawLabelVal("Adresa (completa)", adresa);
  y -= 4;
  drawPara(
    "Vizitatorul confirma ca i-au fost prezentate imobilul si informatiile relevante pentru vanzare (caracteristici, conditii, disponibilitate) prin intermediul Prestatorului/Agentului, iar aceasta introducere la proprietate reprezinta un element esential al activitatii de intermediere."
  );
  drawLine();

  // ----- 4. OBIECTUL FIȘEI -----
  drawTitle("4. OBIECTUL FISEI");
  drawPara(
    "Prin prezenta, Vizitatorul confirma ca a efectuat vizionarea imobilului descris mai sus prin intermediul Prestatorului, in prezenta/participarea Agentului imobiliar, primind informatii despre caracteristicile, starea si conditiile de vanzare ale imobilului."
  );
  drawPara(
    "Prezenta fisa are rol de dovada a intermedierii si a introducerii Vizitatorului la proprietate, in scopul protejarii dreptului Prestatorului la comision. De asemenea, fisa poate fi utilizata pentru a demonstra cronologia evenimentelor (vizionare/negociere/tranzactie) si legatura dintre vizionarea realizata prin Prestator si tranzactia finala."
  );
  drawPara(
    "Partile inteleg ca prezenta fisa nu tine loc de antecontract/contract de vanzare-cumparare si nu transfera drepturi de proprietate; totusi, ea produce efecte juridice intre parti cu privire la confirmarea intermedierii, obligatiile de neeludare si plata comisionului in cazurile prevazute."
  );
  drawLine();

  // ----- 5. CLAUZĂ NEELUDARE -----
  drawTitle("5. CLAUZA DE NEELUDARE A INTERMEDIERII");
  drawPara(
    "Vizitatorul se obliga ca, pe o perioada de 6 (sase) luni de la data semnarii prezentei fise, sa nu contacteze direct proprietarul/vanzatorul imobilului si sa nu incheie, direct sau indirect, nicio tranzactie de vanzare-cumparare avand ca obiect imobilul vizionat, fara participarea Prestatorului."
  );
  drawPara(
    "Interdictia se aplica inclusiv prin persoane interpuse (rude pana la gradul IV inclusiv, societati controlate, prieteni, colegi sau orice alte persoane interpuse), precum si in situatia in care tranzactia se realizeaza in conditii identice sau similare celor prezentate la vizionare ori in conditii modificate (pret negociat, termene diferite etc.), daca exista legatura cu introducerea la proprietate realizata de Prestator."
  );
  drawPara(
    "Incălcarea obligatiei de mai sus atrage raspunderea contractuala a Vizitatorului, iar comisionul prevazut la sectiunea urmatoare reprezinta prejudiciu minim prezumat rezultat din eludarea intermedierii. In plus, Prestatorul isi rezerva dreptul de a solicita, atunci cand este cazul, repararea integrala a prejudiciului dovedit (inclusiv cheltuieli de recuperare, taxe, onorarii si alte costuri ocazionate de demersurile necesare)."
  );
  drawLine();

  // ----- 6. COMISION -----
  drawTitle("6. COMISION");
  drawPara(
    `In cazul in care tranzactia de vanzare-cumparare se finalizeaza pentru imobilul vizionat (direct sau indirect), Vizitatorul se obliga sa achite Prestatorului un comision de ${toAscii(comision)} din prețul total de vânzare înscris în antecontract/contract, conform acordului comercial intre parti.`
  );
  drawPara(
    "Comisionul devine exigibil la data semnarii antecontractului/contractului de vanzare-cumparare ori la data la care tranzactia produce efecte (dupa caz), intrucat acesta este momentul in care intermedierea produce rezultatul final."
  );
  drawPara(
    "Plata comisionului se va efectua in termen de maximum 7 (sapte) zile calendaristice de la data finalizarii tranzactiei (semnare antecontract/contract, dupa caz). Neplata la scadenta poate conduce la demersuri de recuperare si, dupa caz, la actiuni legale."
  );
  drawLine();

  // ----- 7. ACORD -----
  drawTitle("7. ACORD SI CONFIRMARE");
  drawPara("Vizitatorul declara si confirma ca:");
  y -= 2;
  drawPara("a efectuat vizionarea imobilului prin intermediul Prestatorului;", 10);
  drawPara("a luat la cunostinta continutul prezentei fise si il accepta integral;", 10);
  drawPara("datele furnizate sunt reale si apartin Vizitatorului;", 10);
  drawPara(
    "a inteles clauza de neeludare si efectele acesteia, inclusiv obligatia de plata a comisionului in caz de eludare;",
    10
  );
  drawPara(
    "a primit / poate primi o copie electronica a documentului (WhatsApp / e-mail).",
    10
  );
  drawPara(
    "Vizitatorul confirma ca a avut posibilitatea de a citi documentul inainte de semnare, ca a solicitat lamuriri acolo unde a considerat necesar si ca isi exprima consimtamantul in mod liber. Orice neconcordanta observata ulterior va fi comunicata Prestatorului fara intarziere."
  );
  drawLine();

  // ----- 8. SEMNĂTURĂ ELECTRONICĂ -----
  drawTitle("8. SEMNATURA ELECTRONICA");
  drawPara(
    "Prin semnarea prezentului document, inclusiv prin semnatura electronica simpla (trasare pe ecran), Vizitatorul confirma acordul integral cu continutul prezentei fise."
  );
  drawPara(
    "Documentul poate fi comunicat si pastrat in format electronic, avand valoare probatorie conform dispozitiilor legale aplicabile. Partile accepta ca forma electronica este adecvata scopului, iar fisa nu poate fi respinsa ca proba doar pentru faptul ca este in format electronic."
  );
  drawPara(
    "In situatia in care semnarea se face la distanta, partile accepta utilizarea elementelor tehnice de trasabilitate (metadate) pentru a stabili momentul semnarii si a lega documentul de persoana care a primit linkul de semnare, conform sectiunii privind semnaturile."
  );
  drawLine();

  // ----- 9. GDPR -----
  drawTitle("9. PROTECTIA DATELOR (GDPR)");
  drawPara(
    "Operatorul de date cu caracter personal este Prestatorul (Agentia imobiliara) mentionat la sectiunea 1. Datele cu caracter personal sunt prelucrate in conformitate cu Regulamentul (UE) 2016/679 (GDPR) si legislatia nationala aplicabila."
  );
  drawPara("Scopurile prelucrarii sunt:");
  drawPara("(i) organizarea si derularea vizionarii;", 10);
  drawPara("(ii) intermedierea tranzactiei imobiliare;", 10);
  drawPara("(iii) comunicarea cu Vizitatorul;", 10);
  drawPara(
    "(iv) dovedirea intermedierii si protejarea dreptului Prestatorului la comision, inclusiv prevenirea eludarii intermedierii;",
    10
  );
  drawPara(
    "(v) securitatea procesului de semnare si prevenirea abuzurilor/fraudei;",
    10
  );
  drawPara(
    "(vi) apararea drepturilor in cazul unor litigii si indeplinirea obligatiilor legale.",
    10
  );
  drawPara(
    "Categoriile de date prelucrate pot include: nume, telefon, e-mail, date din actul de identitate (serie/numar — daca sunt furnizate), date privind imobilul vizionat si, in cazul semnarii la distanta, metadate tehnice precum data/ora semnarii, fus orar si adresa IP."
  );
  drawPara(
    "Temeiurile legale ale prelucrarii (art. 6 GDPR) sunt: executarea demersurilor precontractuale/contractuale, interesul legitim al Prestatorului si, dupa caz, indeplinirea obligatiilor legale."
  );
  drawPara(
    "Datele nu sunt vandute si nu sunt transmise tertilor in scopuri de marketing. Pot fi comunicate doar catre furnizori de servicii necesari functionarii sau catre autoritati/instante atunci cand exista obligatie legală ori este necesar pentru apararea unui drept."
  );
  drawPara(
    "Datele sunt pastrate pe perioada necesara indeplinirii scopurilor mentionate si conform obligatiilor legale aplicabile."
  );
  drawPara(
    "Vizitatorul are dreptul de acces, rectificare, stergere (in limitele legii), restricționare, opozitie, portabilitate (unde este aplicabil) si dreptul de a depune plangere la autoritatea competenta."
  );
  y -= sectionGap;

  // ----- SEMNĂTURI -----
  ensureSpace(90);
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: A4_WIDTH - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.75, 0.75, 0.75),
  });
  y -= 18;
  page.drawText(toAscii("SEMNĂTURI"), { x: MARGIN, y, size: 12, font: fontBold });
  y -= 22;
  const leftColX = MARGIN;
  const rightColX = A4_WIDTH - MARGIN - 200;
  const sigW = 200;
  const sigH = 72;

  page.drawText("Agent", { x: leftColX, y, size: 10.5, font: fontBold });
  page.drawText("Vizitator", { x: rightColX, y, size: 10.5, font: fontBold });
  y -= lineHeightSmall + 2;
  page.drawText(toAscii(`Nume: ${agentName || "________________________"}`), { x: leftColX, y, size: 10, font });
  page.drawText(toAscii(`Nume: ${nume || "________________________"}`), { x: rightColX, y, size: 10, font });
  y -= 10;

  const leftSigX = MARGIN;
  const rightSigX = A4_WIDTH - MARGIN - sigW;
  page.drawRectangle({
    x: leftSigX,
    y: y - sigH,
    width: sigW,
    height: sigH,
    borderColor: rgb(0.4, 0.4, 0.4),
    borderWidth: 0.6,
  });
  page.drawRectangle({
    x: rightSigX,
    y: y - sigH,
    width: sigW,
    height: sigH,
    borderColor: rgb(0.4, 0.4, 0.4),
    borderWidth: 0.6,
  });

  // Agent: imagine din setări (Semnează acum) sau text IP+dată (link)
  const agentDataUrl = (data.signature_agent_dataurl || "").trim();
  const agentMeta = data.agent_signature_meta;
  const agentHasImage = agentDataUrl.startsWith("data:image/");
  if (agentHasImage) {
    try {
      const base64 = agentDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const img = await doc.embedPng(bytes);
      const iw = img.width;
      const ih = img.height;
      const boxW = sigW - 10;
      const boxH = sigH - 10;
      const scale = Math.min(boxW / iw, boxH / ih, 1);
      const drawW = iw * scale;
      const drawH = ih * scale;
      const dx = leftSigX + (sigW - drawW) / 2;
      const dy = y - sigH + (sigH - drawH) / 2;
      page.drawImage(img, { x: dx, y: dy, width: drawW, height: drawH });
    } catch {
      // ignore
    }
  } else if (agentMeta?.signed_at && agentMeta?.ip) {
    const d = new Date(agentMeta.signed_at);
    const dateStr = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
    const timeStr = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    const tz = agentMeta.timezone || "Europe/Bucharest";
    page.drawText(toAscii("Semnare electronica (data, ora, adresa IP):"), { x: leftSigX + 8, y: y - sigH + 52, size: 8, font });
    page.drawText(toAscii(`${dateStr} ${timeStr} (${tz})`), { x: leftSigX + 8, y: y - sigH + 42, size: 8, font });
    page.drawText(toAscii(`IP: ${agentMeta.ip}`), { x: leftSigX + 8, y: y - sigH + 30, size: 8, font });
  }
  if (agentHasImage) {
    page.drawText(toAscii("Semnare prin trasare cu degetul pe ecran."), { x: leftSigX + 8, y: y - sigH + 12, size: 7, font });
  } else if (agentMeta?.signed_at && agentMeta?.ip) {
    page.drawText(toAscii("Semnare prin inregistrare adresa IP, data si ora."), { x: leftSigX + 8, y: y - sigH + 12, size: 7, font });
  }

  const dataUrl = (data.signature_visitor_dataurl || "").trim();
  const meta = data.signature_meta;
  const hasImage = dataUrl.startsWith("data:image/");

  if (hasImage) {
    try {
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const img = await doc.embedPng(bytes);
      const iw = img.width;
      const ih = img.height;
      const boxW = sigW - 10;
      const boxH = sigH - 10;
      const scale = Math.min(boxW / iw, boxH / ih, 1);
      const drawW = iw * scale;
      const drawH = ih * scale;
      const dx = rightSigX + (sigW - drawW) / 2;
      const dy = y - sigH + (sigH - drawH) / 2;
      page.drawImage(img, { x: dx, y: dy, width: drawW, height: drawH });
    } catch {
      // ignore
    }
  } else if (meta?.signed_at && meta?.ip) {
    const d = new Date(meta.signed_at);
    const dateStr = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
    const timeStr = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    const tz = meta.timezone || "Europe/Bucharest";
    page.drawText(toAscii("Semnare electronica (data, ora, adresa IP):"), { x: rightSigX + 8, y: y - sigH + 52, size: 8, font });
    page.drawText(toAscii(`${dateStr} ${timeStr} (${tz})`), { x: rightSigX + 8, y: y - sigH + 42, size: 8, font });
    page.drawText(toAscii(`IP: ${meta.ip}`), { x: rightSigX + 8, y: y - sigH + 30, size: 8, font });
  }
  if (hasImage) {
    page.drawText(toAscii("Semnare prin trasare cu degetul pe ecran."), { x: rightSigX + 8, y: y - sigH + 12, size: 7, font });
  } else if (meta?.signed_at && meta?.ip) {
    page.drawText(toAscii("Semnare prin inregistrare adresa IP, data si ora."), { x: rightSigX + 8, y: y - sigH + 12, size: 7, font });
  }

  y -= sigH + 8;

  y -= 6;
  page.drawText(`Pagina ${pageNo}`, {
    x: A4_WIDTH - MARGIN - 40,
    y: 1.15 * (72 / 2.54),
    size: 9,
    font,
  });

  return doc.save();
}
