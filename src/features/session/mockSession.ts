import type { Role } from "@/features/permissions/rbac";

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  avatar?: string;
}

export interface Session {
  user: User;
  organization: Organization;
}

// Mock session data - in production this would come from auth provider
export const mockSession: Session = {
  user: {
    id: "user_1",
    email: "ion.popescu@example.com",
    name: "Ion Popescu",
    role: "OWNER",
    organizationId: "org_1",
    avatar: undefined,
  },
  organization: {
    id: "org_1",
    name: "Agenție Imobiliară Premium",
    createdAt: "2024-01-15T00:00:00Z",
  },
};
