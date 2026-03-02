# Variabile de mediu pentru Vercel (producție)

Pentru ca **înregistrarea** și **login-ul** să funcționeze pe domeniul live, setează în **Vercel → Proiect → Settings → Environment Variables**:

## Obligatorii

| Variabilă | Descriere |
|-----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL (ex. Supabase: Session pooler, port 5432). |
| `DIRECT_URL` | Pentru Prisma migrations (ex. Supabase: Connection string direct, port 5432). |
| `SESSION_SECRET` | Secret pentru semnarea sesiunii JWT – **minim 32 de caractere**. Generează cu: `openssl rand -base64 32` sau un șir lung aleatoriu. |

Fără `SESSION_SECRET`, login-ul va returna eroare 503 cu mesaj explicativ.  
Fără `DATABASE_URL`, înregistrarea și login-ul vor eșua (conexiune la DB).

## După ce le adaugi

1. Salvează variabilele și refă deploy-ul (Redeploy) sau așteaptă următorul push.
2. Asigură-te că baza de date există și tabelele sunt create: local rulează `npx prisma db push` sau `npx prisma migrate deploy` pe baza de date folosită de producție.

## Opțional (stocare fișiere)

- `STORAGE_BACKEND=supabase`
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`

Pentru stocare doar local pe server, poți lăsa implicite (directoare pe disc).
