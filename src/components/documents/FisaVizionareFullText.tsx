"use client";

/**
 * Text integral fișă vizionare VÂNZARE — identic cu conținutul din PDF,
 * pentru citire înainte de semnare (fereastra „Documentul pe care îl semnezi”).
 */

interface FisaVizionareFullTextProps {
  dataVizionarii: string;
  oraVizionarii: string;
  tipImobil: string;
  adresaPublica: string;
  comisionProcent: string;
  agency_denumire?: string;
  agency_sediu?: string;
  agency_nr_orc?: string;
  agency_cui?: string;
  agency_iban?: string;
  agency_banca?: string;
  agency_reprezentat_prin?: string;
  agency_functia?: string;
  agent_name?: string;
}

function fmtDate(s: string): string {
  if (!s) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${d}.${m}.${y}`;
  }
  return s;
}

function fmtTime(s: string): string {
  if (!s) return "—";
  return s.length >= 5 ? s.slice(0, 5) : s;
}

function pl(s: string | undefined): string {
  return (s ?? "").trim() || "—";
}

export function FisaVizionareFullText({
  dataVizionarii,
  oraVizionarii,
  tipImobil,
  adresaPublica,
  comisionProcent,
  agency_denumire = "",
  agency_sediu = "",
  agency_nr_orc = "",
  agency_cui = "",
  agency_iban = "",
  agency_banca = "",
  agency_reprezentat_prin = "",
  agency_functia = "",
  agent_name = "",
}: FisaVizionareFullTextProps) {
  const dataStr = fmtDate(dataVizionarii);
  const oraStr = fmtTime(oraVizionarii);
  const tip = pl(tipImobil);
  const adresa = pl(adresaPublica);
  const comisionText = comisionProcent?.trim() || "____";

  const denumire = pl(agency_denumire);
  const sediu = pl(agency_sediu);
  const nrOrc = pl(agency_nr_orc);
  const cui = pl(agency_cui);
  const iban = pl(agency_iban);
  const banca = pl(agency_banca);
  const reprezentat = pl(agency_reprezentat_prin);
  const functia = pl(agency_functia);
  const agent = pl(agent_name);

  return (
    <article className="bg-white rounded-lg border-2 border-gray-300 p-6 text-sm leading-relaxed text-gray-800 space-y-4 max-h-[60vh] overflow-y-auto shadow-sm">
      <h2 className="text-lg font-bold text-center border-b pb-2">FIȘĂ DE VIZIONARE — VÂNZARE</h2>
      <p><strong>Data vizionării (și semnării):</strong> {dataStr}</p>
      <p><strong>Ora vizionării (și semnării):</strong> {oraStr}</p>

      <section>
        <h3 className="font-bold mt-4 mb-1">1. PĂRȚI</h3>
        <p className="font-semibold">Prestator (Agenție imobiliară):</p>
        <p>Denumire: {denumire}</p>
        <p>Sediu social: {sediu}</p>
        <p>Nr. ORC: {nrOrc}</p>
        <p>CUI: {cui}</p>
        <p>IBAN: {iban}</p>
        <p>Banca: {banca}</p>
        <p>Reprezentată legal prin: {reprezentat}</p>
        <p>Funcția: {functia}</p>
        <p>Denumită în continuare „Prestatorul”.</p>
        <p>Agent imobiliar: {agent}</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">2. VIZITATOR (CLIENT)</h3>
        <p>Nume: —</p>
        <p>Telefon: —</p>
        <p>E-mail: —</p>
        <p>Act identitate (CI) — serie: —</p>
        <p>Act identitate (CI) — număr: —</p>
        <p className="mt-2">Vizitatorul declară că datele furnizate sunt corecte, reale și îi aparțin. Furnizarea datelor are ca scop organizarea vizionării, intermedierea și, după caz, dovedirea intermedierii și a consimțământului exprimat prin semnare.</p>
        <p>În măsura în care unele date sunt opționale, acestea sunt furnizate voluntar; refuzul furnizării poate limita posibilitatea dovedirii identității în cazul unei contestări, fără a anula prin sine însuși valoarea prezentei fișe.</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">3. IMOBIL VIZIONAT</h3>
        <p>Tip imobil: {tip}</p>
        <p>Adresă (completă): {adresa}</p>
        <p className="mt-2">Vizitatorul confirmă că i-au fost prezentate imobilul și informațiile relevante pentru vânzare (caracteristici, condiții, disponibilitate) prin intermediul Prestatorului/Agentului, iar această introducere la proprietate este element esențial al activității de intermediere.</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">4. OBIECTUL FIȘEI</h3>
        <p>Prin prezenta, Vizitatorul confirmă că a efectuat vizionarea imobilului descris mai sus prin intermediul Prestatorului, în prezența/participarea Agentului imobiliar, primind informații despre caracteristicile, starea și condițiile de vânzare ale imobilului.</p>
        <p>Prezenta fișă are rol de dovadă a intermedierii și a introducerii Vizitatorului la proprietate, în scopul protejării dreptului Prestatorului la comision. De asemenea, fișa poate fi utilizată pentru a demonstra cronologia evenimentelor (vizionare/negociere/tranzacție) și legătura dintre vizionarea realizată prin Prestator și tranzacția finală.</p>
        <p>Părțile înțeleg că prezenta fișă nu ține loc de antecontract/contract de vânzare-cumpărare și nu transferă drepturi de proprietate; totuși, ea produce efecte juridice între părți cu privire la confirmarea intermedierii, obligațiile de neeludare și plata comisionului în cazurile prevăzute.</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">5. CLAUZĂ DE NEELUDARE A INTERMEDIERII</h3>
        <p>Vizitatorul se obligă ca, pe o perioadă de 6 (șase) luni de la data semnării prezentei fișe, să nu contacteze direct proprietarul/vânzătorul imobilului și să nu încheie, direct sau indirect, nicio tranzacție de vânzare-cumpărare având ca obiect imobilul vizionat, fără participarea Prestatorului.</p>
        <p>Interdicția se aplică inclusiv prin persoane interpuse (rude până la gradul IV inclusiv, societăți controlate, prieteni, colegi sau orice alte persoane interpuse), precum și în situația în care tranzacția se realizează în condiții identice sau similare celor prezentate la vizionare ori în condiții modificate (preț negociat, termene diferite etc.), dacă există legătură cu introducerea la proprietate realizată de Prestator.</p>
        <p>Încălcarea obligației de mai sus atrage răspunderea contractuală a Vizitatorului, iar comisionul prevăzut la secțiunea următoare reprezintă prejudiciu minim prezumat rezultat din eludarea intermedierii. În plus, Prestatorul își rezervă dreptul de a solicita, atunci când este cazul, repararea integrală a prejudiciului dovedit (inclusiv cheltuieli de recuperare, taxe, onorarii și alte costuri ocazionate de demersurile necesare).</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">6. COMISION</h3>
        <p>În cazul în care tranzacția de vânzare-cumpărare se finalizează pentru imobilul vizionat (direct sau indirect), Vizitatorul se obligă să achite Prestatorului un comision de {comisionText} din prețul de vânzare negociat, conform acordului comercial dintre părți.</p>
        <p>Comisionul devine exigibil la data semnării antecontractului/contractului de vânzare-cumpărare ori la data la care tranzacția produce efecte (după caz), întrucât acesta este momentul în care intermedierea produce rezultatul final.</p>
        <p>Plata comisionului se va efectua în termen de maximum 7 (șapte) zile calendaristice de la data finalizării tranzacției (semnare antecontract/contract, după caz). Neplata la scadență poate conduce la demersuri de recuperare și, după caz, la acțiuni legale.</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">7. ACORD ȘI CONFIRMARE</h3>
        <p>Vizitatorul declară și confirmă că:</p>
        <p>• a efectuat vizionarea imobilului prin intermediul Prestatorului;</p>
        <p>• a luat la cunoștință conținutul prezentei fișe și îl acceptă integral;</p>
        <p>• datele furnizate sunt reale și aparțin Vizitatorului;</p>
        <p>• a înțeles clauza de neeludare și efectele acesteia, inclusiv obligația de plată a comisionului în caz de eludare;</p>
        <p>• a primit / poate primi o copie electronică a documentului (WhatsApp / e-mail).</p>
        <p>Vizitatorul confirmă că a avut posibilitatea de a citi documentul înainte de semnare, că a solicitat lămuriri acolo unde a considerat necesar și că își exprimă consimțământul în mod liber. Orice neconcordanță observată ulterior va fi comunicată Prestatorului fără întârziere.</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">8. SEMNĂTURĂ ELECTRONICĂ</h3>
        <p>Prin semnarea prezentului document, inclusiv prin semnătură electronică simplă (trasare pe ecran), Vizitatorul confirmă acordul integral cu conținutul prezentei fișe.</p>
        <p>Documentul poate fi comunicat și păstrat în format electronic, având valoare probatorie conform dispozițiilor legale aplicabile. Părțile acceptă că forma electronică este adecvată scopului, iar fișa nu poate fi respinsă ca probă doar pentru faptul că este în format electronic. În situația în care semnarea se face la distanță, părțile acceptă utilizarea elementelor tehnice de trasabilitate (metadate) pentru a stabili momentul semnării și a lega documentul de persoana care a primit link-ul de semnare, conform secțiunii privind semnăturile.</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">9. PROTECȚIA DATELOR (GDPR)</h3>
        <p>Operatorul de date cu caracter personal este Prestatorul (Agenția imobiliară) menționat la secțiunea 1. Datele cu caracter personal sunt prelucrate în conformitate cu Regulamentul (UE) 2016/679 (GDPR) și legislația națională aplicabilă.</p>
        <p>Scopurile prelucrării sunt: (i) organizarea și derularea vizionării, (ii) intermedierea tranzacției imobiliare, (iii) comunicarea cu Vizitatorul, (iv) dovedirea intermedierii și protejarea dreptului Prestatorului la comision, inclusiv prevenirea eludării intermedierii, (v) securitatea procesului de semnare și prevenirea abuzurilor/fraudei, (vi) apărarea drepturilor în cazul unor litigii și îndeplinirea obligațiilor legale.</p>
        <p>Categoriile de date prelucrate pot include: nume, telefon, e-mail, date din actul de identitate (serie/număr — dacă sunt furnizate), date privind imobilul vizionat și, în cazul semnării la distanță, metadate tehnice precum data/ora semnării, fus orar și adresă IP. Aceste metadate sunt utilizate strict pentru trasabilitate, securitate și probă, nu pentru profilare sau marketing.</p>
        <p>Temeiurile legale ale prelucrării (art. 6 GDPR) sunt: executarea demersurilor precontractuale/contractuale (organizare vizionare, intermediere, comunicare), interesul legitim al Prestatorului (dovada intermedierii, prevenirea eludării, securitatea semnării și apărarea drepturilor) și, după caz, îndeplinirea obligațiilor legale. În situațiile în care anumite date sunt opționale, furnizarea lor este voluntară; refuzul nu împiedică în mod automat vizionarea, dar poate limita posibilitatea de probare în caz de contestare.</p>
        <p>Datele nu sunt vândute și nu sunt transmise terților în scopuri de marketing. Pot fi comunicate doar către furnizori de servicii necesari funcționării (ex.: servicii IT/găzduire, comunicare electronică), în baza obligațiilor de confidențialitate și securitate, precum și către autorități/instanțe/consultanți juridici atunci când există obligație legală sau este necesar pentru constatarea, exercitarea ori apărarea unui drept în instanță.</p>
        <p>Durata de stocare: datele sunt păstrate pe perioada necesară îndeplinirii scopurilor de mai sus, inclusiv pe durata în care pot apărea pretenții, contestații sau litigii privind intermedierea și comisionul, precum și pe duratele cerute de obligațiile legale aplicabile. După expirarea termenelor, datele sunt șterse sau anonimizate, după caz.</p>
        <p>Măsuri de securitate: Prestatorul aplică măsuri tehnice și organizatorice rezonabile pentru protecția datelor (control acces, limitare acces, logare, back-up, măsuri anti-abuz). Accesul la metadate (IP, loguri) este strict limitat la personal autorizat.</p>
        <p>Drepturile Vizitatorului: dreptul de acces, rectificare, ștergere (în limitele legii), restricționare, opoziție (în special față de prelucrări bazate pe interes legitim), portabilitate (unde este aplicabil) și dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP). Solicitările se pot transmite Prestatorului folosind datele de contact ale agenției.</p>
      </section>

      <section>
        <h3 className="font-bold mt-4 mb-1">SEMNĂTURI</h3>
        <p>Agent / Vizitator — semnătură electronică (dată, oră, IP). Semnare prin trasare cu degetul pe ecran sau prin înregistrare adresă IP, dată și oră.</p>
      </section>
    </article>
  );
}
