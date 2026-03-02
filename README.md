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

```
src/
  app/
    (auth)/          # Auth-related pages
      login/
    (app)/            # Main application pages (protected)
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
  components/
    layout/           # App shell, sidebar, topbar, etc.
    common/           # Reusable components (KpiCard, EmptyState, etc.)
    ui/               # shadcn/ui components
  features/
    permissions/      # RBAC system
    session/          # Session management (mock)
    dashboard/        # Dashboard types and mock data
  lib/                # Utilities
  styles/             # Global styles and design tokens
```

## Design System

The design system uses CSS variables defined in `src/styles/tokens.css`:

- **Colors**: Neutral palette with one accent color (blue)
- **Spacing**: 8px grid system (grid-1 = 8px, grid-2 = 16px, etc.)
- **Shadows**: Soft, premium shadows
- **Typography**: Inter font with consistent scale

All components use Tailwind utilities and design tokens - no hardcoded colors or ad-hoc styling.

## Authentication (Placeholder)

Currently, the app uses a mock session system. The session is provided via:

- `src/features/session/mockSession.ts` - Mock session data
- `src/features/session/useSession.ts` - Zustand hook for session
- `src/features/session/SessionProvider.tsx` - React context provider

**To connect real authentication:**

1. Replace `mockSession.ts` with your auth provider (e.g., NextAuth, Clerk, Auth0)
2. Update `useSession.ts` to fetch from your auth provider
3. Add authentication middleware in `middleware.ts`
4. Protect routes using Next.js middleware or route guards

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

## Next Steps to Connect Backend

1. **Database Setup**:
   - Set up your database (PostgreSQL, MySQL, etc.)
   - Create schema for Organizations, Users, Leads, Deals, Properties, etc.
   - Use Prisma, Drizzle, or your preferred ORM

2. **API Routes**:
   - Create API routes in `src/app/api/`
   - Implement CRUD operations for each entity
   - Add authentication middleware

3. **Replace Mock Data**:
   - Update `dashboardMockData.ts` to fetch from API
   - Replace mock session with real auth
   - Connect all placeholder pages to backend

4. **Add Real Features**:
   - File upload for documents
   - Email notifications for invites
   - Calendar integration for viewings
   - Reporting and analytics

5. **Environment Variables**:
   - Create `.env.local` for API keys, database URLs, etc.
   - Add to `.gitignore`

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
