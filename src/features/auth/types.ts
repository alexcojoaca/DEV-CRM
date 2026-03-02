import type { WorkspaceRole } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface SessionMembership {
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
}

export interface AppSession {
  user: SessionUser;
  memberships: SessionMembership[];
  activeWorkspaceId: string | null;
}
