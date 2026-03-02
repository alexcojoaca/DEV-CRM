# Extensie Chrome – CRM Anunțuri Imobiliare

Extensie pentru preluarea anunțurilor de pe **imobiliare.ro**, **OLX** și **Storia** și adăugarea lor în portofoliul de proprietăți din CRM.

## Ce face

- Pe o pagină de anunț (imobiliare.ro, olx.ro, storia.ro) extrage:
  - **Titlul**
  - **Descrierea**
  - **Caracteristicile** (listă)
  - **Pozele** (URL-uri convertite în base64)
  - **Prețul**
  - **Numărul de telefon** (dacă este vizibil pe pagină)
- Trimite datele la aplicația CRM (API `/api/properties/import`).
- Deschide pagina **Import din extensie** (`/properties/import`) unde poți confirma și adăuga anunțul în portofoliu.

## Instalare (mod developer)

1. Deschide Chrome și mergi la `chrome://extensions/`.
2. Activează **Developer mode** (dreapta sus).
3. Apasă **Load unpacked** și selectează folderul `extension` din acest proiect.
4. Asigură-te că aplicația CRM rulează (ex. `http://localhost:3000` sau URL-ul de producție).

## Utilizare

1. Deschide un anunț pe imobiliare.ro, OLX sau Storia (pagină de detaliu a unui singur anunț).
2. Apasă pe iconița extensiei în toolbar.
3. În popup, completează **URL Dashboard CRM** (ex. `http://localhost:3000` sau `https://domeniul-tau.com`).
4. Apasă **Adaugă anunțul în CRM**.
5. Se deschide tab-ul cu **Import din extensie** în CRM; apasă **Adaugă în portofoliu** pentru a crea proprietatea.

## Meniu în CRM

În aplicație, la **Extensie anunțuri** (în meniul lateral) se deschide aceeași pagină de import, unde vezi toate anunțurile trimise de extensie și le poți adăuga în portofoliu.

## Notă

Selectori pentru titlu, descriere, preț, telefon și imagini pot varia când portalurile își schimbă designul. Dacă extragerea nu mai funcționează pe un site, trebuie actualizat fișierul `content/scraper.js` (obiectul `PORTALS` și selectori per portal).
