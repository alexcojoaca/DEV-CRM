# Real Estate CRM

A premium SaaS CRM for real-estate agents built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multi-tenant Architecture**: Organizations (Agencies) with multiple users
- **Role-Based Access Control**: OWNER, MANAGER, and AGENT roles with granular permissions
- **Premium UI**: Minimalist design with consistent 8px spacing grid
- **Responsive Design**: Desktop sidebar and mobile drawer navigation
- **Dashboard**: KPI cards, activity feed, tasks preview, and quick actions
- **Comprehensive Pages**: Leads, Clients, Deals, Properties, Viewings, Tasks, Documents, Team, Reports, Settings

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix-based)
- **State Management**: Zustand (for client state)
- **Validation**: Zod
- **Icons**: Lucide React
- **Font**: Inter

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically redirect to `/dashboard`.

## Project Structure

```txt
src/
  app/
    (auth)/                    # Auth-related pages
      login/
      register/
    (app)/                     # Main application pages (protected)
      dashboard/
      leads/
      clients/
      deals/
      properties/
      viewings/
      tasks/
      documents/
      team/
      reports/
      settings/
    (public)/
      prezentare/[token]/      # Public property presentations
      s/v/[token]/             # Public signing flows (vânzare)
      s/vi/[token]/            # Public signing flows (închiriere)
    api/                       # Backend API routes (Prisma + RBAC)
  components/
    layout/                    # App shell, sidebar, topbar, etc.
    common/                    # Reusable components (KpiCard, EmptyState, etc.)
    ui/                        # shadcn/ui components
    leads/
    clients/
    deals/
    properties/
    viewings/
    tasks/
    documents/
  features/
    auth/                      # Session types, JWT helpers
    permissions/               # RBAC system
    scoping.ts                 # requireAuth/requireMembership helpers
    session/                   # Client-side session provider/hook
    workspaces/                # Workspace hooks (useWorkspaceInfo, etc.)
    dashboard/                 # Dashboard types and mock data
    leads/                     # Lead types + API DTO mapping
    clients/                   # Client types + API DTO mapping
    deals/                     # Deal types + API DTO mapping
    properties/                # Property types + API mapping
    viewings/                  # Viewing types + API mapping
    tasks/                     # Task types + API mapping
    files/                     # File storage abstraction
  lib/
    prisma.ts                  # Prisma client
    pdf-temp-store.ts          # Temporary PDF downloads (token-based)
    prezentare-store.ts        # Property presentation store (FS + in-memory fallback)
    extension-imports-store.ts # Browser-extension imports store (FS + in-memory fallback)
    errors.ts                  # Custom error classes
  styles/                      # Global styles and design tokens
```

## Design System

The design system uses CSS variables defined in `src/styles/tokens.css`:

- **Colors**: Neutral palette with one accent color (blue)
- **Spacing**: 8px grid system (grid-1 = 8px, grid-2 = 16px, etc.)
- **Shadows**: Soft, premium shadows
- **Typography**: Inter font with consistent scale

All components use Tailwind utilities and design tokens - no hardcoded colors or ad-hoc styling.

## Authentication

The app uses a real session stored in an httpOnly cookie (JWT signed with `SESSION_SECRET`).

- `src/features/auth/types.ts` – `AppSession`, `SessionUser`, and membership types.
- `src/features/auth/session.ts` – encode/decode session JWT, cookie helpers.
- `src/features/session/useSession.ts` – client-side Zustand store for session (user + active workspace).
- `src/features/session/SessionProvider.tsx` – fetches `/api/auth/session` and keeps the client session in sync (including a `session-refresh` event).
- `src/middleware.ts` – protects `/app/*`, redirects to `/auth/login`, `/onboarding/create-workspace` or `/app/select-workspace` based on session and memberships.

## Permissions System

The RBAC system is defined in `src/features/permissions/`:

- **Roles**: OWNER, MANAGER, AGENT
- **Actions**: Granular permissions (e.g., `leads:read`, `team:invite`)
- **Helper**: `canAccess(role, action)` function

Example usage:

```typescript
import { canAccess } from "@/features/permissions/rbac";
import { useSession } from "@/features/session/useSession";

const { user } = useSession();
if (user && canAccess(user.role, "team:invite")) {
  // Show invite button
}
```

## Backend Overview

The backend is implemented with **Prisma + PostgreSQL** under `src/app/api/`. Core entities are multi-tenant and scoped by `workspaceId`:

- **Leads**: `/api/leads`, `/api/leads/[id]`
- **Clients**: `/api/clients`, `/api/clients/[id]`
- **Deals**: `/api/deals`, `/api/deals/[id]`
- **Properties**: `/api/properties`, `/api/properties/[id]`
- **Viewings**: `/api/viewings`, `/api/viewings/[id]`
- **Tasks**: `/api/tasks`, `/api/tasks/[id]`

All routes use:

- `requireMembership()` for scoping to the active workspace.
- `canAccessByAssignment` when a record has `assignedToUserId`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: Configured with Tailwind plugin
- **No `any` types**: All code is fully typed

## License

Private - All rights reserved
