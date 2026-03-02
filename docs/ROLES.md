# Roluri și permisiuni (Echipa)

## Roluri

| Rol        | Descriere |
|-----------|------------|
| **Proprietar (OWNER)** | Proprietarul echipei. Poate invita manageri/agenți, **elimina** membri din echipă, revoca invitații. Acces total la toate resursele și setări. |
| **Manager (MANAGER)**  | Poate invita agenți și manageri. Poate vedea **rezultatele echipei** și ale fiecărui membru (dashboard, portofoliu). Nu poate elimina membri. |
| **Agent (AGENT)**      | Vede doar **ce îi aparține** (lead-uri, clienți, tranzacții, proprietăți asignate/l create de el). Poate vedea portofoliul oricărui membru (selector pe pagina Proprietăți). |

## Matrice rezumat

| Acțiune | Proprietar | Manager | Agent |
|---------|------------|---------|-------|
| Invită în echipă | ✅ | ✅ | ❌ |
| Elimină membru din echipă | ✅ | ❌ | ❌ |
| Revocă invitație | ✅ | ✅ | ❌ |
| Vezi toată echipa | ✅ | ✅ | ✅ |
| Vezi portofoliul oricui | ✅ | ✅ | ✅ (selector) |
| Vezi doar datele tale | - | - | ✅ (implicit) |
| Șterge lead/client/deal/proprietate | ✅ | ✅ | ❌ (doar create/update) |
| Setări workspace | ✅ | citire | citire |

## Invitații

- Se trimite invitația prin **email** (adresa introdusă). Persoana poate **accepta** după ce se înregistrează sau se conectează cu acel email.
- Pentru trimitere automată de email la invitație (link de acceptare), poți integra un serviciu (ex. Resend, SendGrid) în `POST /api/invites/create` și trimite un link de tip `/invites` sau un token de acceptare.

## Portofoliu

- Pe pagina **Proprietăți**, proprietarul și managerul au un selector **Portofoliu: Al meu / [Nume membru]** și pot vedea proprietățile create de orice membru.
- Agentul vede doar propriul portofoliu (fără selector sau cu o singură opțiune „Al meu”).
