# Sursa contractelor (migrare din Python)

Acest folder este folosit pentru a migra logica de generare contracte din tool-ul Python în acest proiect (Next.js/TypeScript).

## Pași

1. **Contract de vânzare** (primul)
   - Pune în `vanzare/`:
     - **Template-ul PDF** pentru contract de vânzare (ex: `template-vanzare.pdf`).
     - Opțional: fișierul/fișierele Python vechi (`.py`, `.html`) dacă îi mai ai – mă ajută să văd ce câmpuri folosești și cum se genera PDF-ul.
   - După ce pui fișierele, spune-mi și refacem aici: tip document, formular și generare PDF.

2. **Alte contracte** (ulterior)
   - La fel: creezi subfolder (ex: `inchiriere/`, `prestari/`) și pui template-ul + eventual codul vechi.

## Structură sugerată

```
contracts-source/
  vanzare/          ← pune aici PDF + (opțional) .py / .html pentru VÂNZARE
  inchiriere/       ← ulterior, dacă vrei să migrăm și acel template
  ...
```

Nu comit PDF-urile cu date personale. Template-urile goale (fără date reale) sunt ok.
