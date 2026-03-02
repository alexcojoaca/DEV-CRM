# Pornire proiect (înregistrare / login)

## 1. Fișier `.env`

Proiectul are deja un fișier **`.env`** în rădăcină (creat din `.env.example`). Conține:

- **DATABASE_URL** – conexiunea la PostgreSQL
- **SESSION_SECRET** – secret pentru sesiune (minim 32 caractere)

Poți modifica `SESSION_SECRET` cu un șir lung aleatoriu dacă vrei.

---

## 2. PostgreSQL (baza de date)

Trebuie să ai PostgreSQL pornit pe `localhost:5432` cu utilizatorul `postgres`, parola `postgres` și baza `realestate_crm`.

### Varianta A: Docker (recomandat)

1. Instalează **Docker Desktop** pentru Windows: https://www.docker.com/products/docker-desktop/
2. Pornește Docker Desktop.
3. În terminal, în folderul proiectului:
   ```bash
   docker compose up -d
   ```
4. Aștepți câteva secunde, apoi continui cu pasul 3 mai jos.

### Varianta B: PostgreSQL instalat pe Windows

1. Descarcă PostgreSQL: https://www.postgresql.org/download/windows/
2. La instalare setează parola pentru utilizatorul `postgres` la: **postgres** (sau schimbă în `.env` la `DATABASE_URL` utilizatorul/parola).
3. Creează baza de date:
   - Deschide **pgAdmin** sau **psql** și rulează:
     ```sql
     CREATE DATABASE realestate_crm;
     ```
   - Sau din linia de comandă (dacă `psql` e în PATH):
     ```bash
     psql -U postgres -c "CREATE DATABASE realestate_crm;"
     ```
4. În `.env`, păstrezi sau ajustezi:
   ```env
   DATABASE_URL="postgresql://postgres:PAROLA_TA@localhost:5432/realestate_crm"
   ```

---

## 3. Prisma și migrări

În folderul proiectului rulează:

```bash
npx prisma generate
npx prisma db push
```

- **prisma generate** – generează clientul Prisma.
- **prisma db push** – creează/actualizează tabelele în baza de date.

---

## 4. Pornire server

```bash
npm run dev
```

Aplicația rulează la adresa afișată (de obicei http://localhost:3000).

---

## 5. Creare cont

1. Mergi la **http://localhost:3000/auth/register**
2. Completează email, parolă (min. 8 caractere), opțional numele.
3. După înregistrare ești redirecționat la login; te loghezi și creezi workspace-ul la primul acces.

---

## Rezumat rapid (dacă ai deja Docker)

```bash
docker compose up -d
npx prisma generate
npx prisma db push
npm run dev
```

Apoi deschizi în browser: http://localhost:3000/auth/register
