import type { WorkspaceRole } from "@prisma/client";
import { getSessionFromCookie } from "@/features/auth/session";
import type { AppSession, SessionUser } from "@/features/auth/types";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

/**
 * Ensures the request has a valid session. Throws UnauthorizedError if not logged in.
 */
export async function requireAuth(): Promise<AppSession> {
  const session = await getSessionFromCookie();
  if (!session) {
    throw new UnauthorizedError("Not authenticated");
  }
  return session;
}

export interface MembershipContext {
  user: SessionUser;
  activeWorkspaceId: string;
  role: WorkspaceRole;
  workspaceName: string;
}

/**
 * Ensures the request has a valid session and an active workspace selected.
 * Throws UnauthorizedError if not logged in, ForbiddenError if no workspace selected or not a member.
 */
export async function requireMembership(): Promise<MembershipContext> {
  const session = await requireAuth();
  if (!session.activeWorkspaceId) {
    throw new ForbiddenError("No workspace selected");
  }
  const membership = session.memberships.find((m) => m.workspaceId === session.activeWorkspaceId);
  if (!membership) {
    throw new ForbiddenError("Not a member of the active workspace");
  }
  return {
    user: session.user,
    activeWorkspaceId: session.activeWorkspaceId,
    role: membership.role,
    workspaceName: membership.workspaceName,
  };
}

/**
 * Throws ForbiddenError if currentRole is not in the allowedRoles list.
 */
export function requireRole(currentRole: WorkspaceRole, allowedRoles: WorkspaceRole[]): void {
  if (!allowedRoles.includes(currentRole)) {
    throw new ForbiddenError("Insufficient permissions");
  }
}

/**
 * Returns true if the user can access a resource by assignment rules:
 * - OWNER and MANAGER can access any resource in the workspace
 * - AGENT can access only if they are the owner (assigned) or there is no owner
 */
export function canAccessByAssignment(
  role: WorkspaceRole,
  userId: string,
  ownerUserId: string | null
): boolean {
  if (!ownerUserId) return true;
  if (role === "OWNER" || role === "MANAGER") return true;
  return userId === ownerUserId;
}
