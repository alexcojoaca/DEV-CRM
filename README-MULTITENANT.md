# Multi-tenant Real Estate CRM – Setup & Architecture

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + **PostgreSQL** (local via Docker)
- **Auth**: email + password (bcrypt), no email verification
- **Session**: httpOnly cookie (JWT signed with `SESSION_SECRET`)
- **File storage**: local filesystem under `UPLOAD_DIR` (default `uploads/`), swappable to Supabase/S3 later

## Quick start

### 1. Environment

```bash
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` – PostgreSQL connection string (see below).
- `SESSION_SECRET` – at least 32 characters (used to sign the session JWT).
- `UPLOAD_DIR` – optional; default `uploads` (relative to project root or absolute path).

### 2. PostgreSQL (Docker)

```bash
docker compose up -d
```

This starts Postgres 16 on `localhost:5432` with:

- User: `postgres`
- Password: `postgres`
- Database: `realestate_crm`

`DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/realestate_crm"
```

### 3. Install & DB

```bash
npm install
npx prisma migrate dev --name init
# or: npm run db:push
```

### 4. Run

```bash
npm run dev
```

- **Register**: `/auth/register`
- **Login**: `/auth/login`
- **Onboarding** (no workspace): `/onboarding/create-workspace`
- **App**: `/app/dashboard` (after login and workspace selection)

## Architecture

### Auth & session

- **Register** `POST /api/auth/register`: creates `User` (email, passwordHash, fullName).
- **Login** `POST /api/auth/login`: checks password, loads memberships, sets httpOnly cookie with JWT (user, memberships, activeWorkspaceId).
- **Logout** `POST /api/auth/logout`: clears cookie.
- **Session** `GET /api/auth/session`: returns current session (user, memberships, activeWorkspaceId, activeRole, activeWorkspaceName) from cookie (for client-side).
- **Middleware** (`src/middleware.ts`): protects `/app/*`. Redirects to `/auth/login` if no/invalid session, to `/onboarding/create-workspace` if no memberships, to `/app/select-workspace` if no active workspace.

### Multi-tenant & RBAC

- **Workspace**: one per agency/team. Creator is **OWNER**.
- **WorkspaceMembership**: user + workspace + role (`OWNER` | `MANAGER` | `AGENT`).
- **WorkspaceInvite**: invited email, role (`MANAGER` | `AGENT`), status `PENDING` | `ACCEPTED` | `REVOKED`. Invited user must already exist (register first).
- **Scoping** (`src/features/scoping.ts`):
  - `requireAuth()` – throws if not logged in.
  - `requireMembership()` – ensures there is an active workspace and returns `{ user, activeWorkspaceId, role, workspaceName }`.
  - `requireRole(allowed)` – throws if current role not in allowed list.
  - `canAccessByAssignment(role, userId, ownerUserId)` – OWNER/MANAGER can access any record; AGENT can access only assigned or unassigned records.
- **Role changes**: OWNER can change MANAGER/AGENT; MANAGER can change only AGENT.

### File storage (local)

- **Paths** (under `UPLOAD_DIR`):
  - Listings: `workspaces/{workspaceId}/listings/{listingCode}/images/original|images/thumbs|pdf|attachments`
  - Users: `workspaces/{workspaceId}/users/{userId}/images|pdf|docs`
- **Interface** `IStorageService` (`src/features/files/types.ts`): `uploadFile`, `deleteFile`, `listFiles`, `getFileStream`, `getAbsolutePath`. Implemented in `src/features/files/localStorage.ts` so you can swap to Supabase/S3 with minimal changes.
- **Quotas**: `StorageQuota` per (workspaceId, userId), default 1GB. Checked on upload; `bytesUsed` updated after save.
- **FileAsset**: metadata (workspaceId, entityType, entityId, kind, storagePath, sizeBytes, mimeType). Download API enforces auth and assignment.

### Image thumbnails

- **sharp**: on image upload you can generate `_sm` / `_md` thumbnails (see `src/features/files/thumbnails.ts`). Use in listing UI.

### Code layout

- `src/lib/` – Prisma client, crypto (bcrypt), errors, temporary PDF/prezentare/import stores.
- `src/features/auth/` – types, session (encode/decode JWT, cookie).
- `src/features/scoping.ts` – `requireAuth`, `requireMembership`, `requireRole`, `canAccessByAssignment`.
- `src/features/workspaces/` – reusable workspace hooks (`useWorkspaceInfo`, `useActiveWorkspaceId`, etc.).
- `src/features/team/` – invite, accept, revoke, remove member, change role (API routes under `src/app/api/`).
- `src/features/files/` – types, localStorage service, thumbnails.
- `src/features/leads/` – Prisma-backed leads types and API integration.
- `src/features/clients/` – Prisma-backed clients types and API integration.
- `src/features/deals/` – Prisma-backed deals types and API integration.
- `src/features/properties/` – property types, mapping between Prisma and frontend.
- `src/features/viewings/` – viewing types and API integration.
- `src/features/tasks/` – task types and API integration.

### API routes (summary)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Create user |
| `/api/auth/login` | POST | Login, set session cookie |
| `/api/auth/logout` | POST | Clear cookie |
| `/api/auth/session` | GET | Current session (for client) |
| `/api/workspaces/create` | POST | Create workspace (auth) |
| `/api/workspaces/set-active` | POST | Set activeWorkspaceId in cookie |
| `/api/invites/create` | POST | Invite by email (OWNER/MANAGER) |
| `/api/invites/accept` | POST | Accept invite (invited user) |
| `/api/invites/revoke` | POST | Revoke invite (OWNER/MANAGER) |
| `/api/team/remove` | POST | Remove member (OWNER/MANAGER) |
| `/api/team/change-role` | POST | Change member role |
| `/api/files/upload` | POST | Upload file (FormData), quota check, FileAsset |
| `/api/files/[id]` | GET | Download file (auth + scoping) |
| `/api/leads` | GET/POST | List/create leads (workspace-scoped) |
| `/api/leads/[id]` | PATCH/DELETE | Update/delete a lead (assignment + role checks) |
| `/api/clients` | GET/POST | List/create clients (workspace-scoped) |
| `/api/clients/[id]` | PATCH/DELETE | Update/delete a client (assignment + role checks) |
| `/api/deals` | GET/POST | List/create deals (workspace-scoped) |
| `/api/deals/[id]` | PATCH/DELETE | Update/delete a deal (assignment + role checks) |
| `/api/properties` | GET/POST | List/create properties (workspace-scoped) |
| `/api/properties/[id]` | GET/PATCH/DELETE | Get/update/delete a property (assignment + role checks) |
| `/api/viewings` | GET/POST | List/create viewings (workspace-scoped) |
| `/api/viewings/[id]` | PATCH/DELETE | Update/delete a viewing (assignment + role checks) |
| `/api/tasks` | GET/POST | List/create tasks (workspace-scoped) |
| `/api/tasks/[id]` | PATCH/DELETE | Update/delete a task (assignment + role checks) |

## Swapping storage to Supabase/S3

1. Implement `IStorageService` in e.g. `src/features/files/supabaseStorage.ts` (or `s3Storage.ts`) with the same methods.
2. Use env to choose provider and instantiate the correct service in `getStorageService()` (or a small factory). Keep folder/key conventions so `storagePath` stays the same in `FileAsset`.
3. Thumbnails: generate in memory and upload to the same paths (`images/thumbs/{uuid}_sm.ext`, etc.) or use provider’s image transform if available.

## Scripts

- `npm run dev` – Next.js dev server
- `npm run build` / `npm run start` – production
- `npm run db:push` – push Prisma schema without migration files
- `npm run db:migrate` – `prisma migrate dev`
- `npx prisma generate` – regenerate client (runs on postinstall)
