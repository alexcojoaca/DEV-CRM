import type { Action } from "./actions";

export type Role = "OWNER" | "MANAGER" | "AGENT";

// Permission matrix: role -> actions allowed
const PERMISSIONS: Record<Role, Action[]> = {
  OWNER: [
    // Full access to everything, including remove members
    "leads:read",
    "leads:create",
    "leads:update",
    "leads:delete",
    "clients:read",
    "clients:create",
    "clients:update",
    "clients:delete",
    "deals:read",
    "deals:create",
    "deals:update",
    "deals:delete",
    "properties:read",
    "properties:create",
    "properties:update",
    "properties:delete",
    "viewings:read",
    "viewings:create",
    "viewings:update",
    "viewings:delete",
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "documents:read",
    "documents:create",
    "documents:update",
    "documents:delete",
    "team:read",
    "team:invite",
    "team:update",
    "team:remove",
    "reports:read",
    "settings:read",
    "settings:update",
  ],
  MANAGER: [
    // Can manage team and all operations, but limited settings
    "leads:read",
    "leads:create",
    "leads:update",
    "leads:delete",
    "clients:read",
    "clients:create",
    "clients:update",
    "clients:delete",
    "deals:read",
    "deals:create",
    "deals:update",
    "deals:delete",
    "properties:read",
    "properties:create",
    "properties:update",
    "properties:delete",
    "viewings:read",
    "viewings:create",
    "viewings:update",
    "viewings:delete",
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "tasks:delete",
    "documents:read",
    "documents:create",
    "documents:update",
    "documents:delete",
    "team:read",
    "team:invite",
    "team:update",
    "reports:read",
    "settings:read",
  ],
  AGENT: [
    // Can perform operations but cannot manage team or delete critical items
    "leads:read",
    "leads:create",
    "leads:update",
    "clients:read",
    "clients:create",
    "clients:update",
    "deals:read",
    "deals:create",
    "deals:update",
    "properties:read",
    "properties:create",
    "properties:update",
    "viewings:read",
    "viewings:create",
    "viewings:update",
    "tasks:read",
    "tasks:create",
    "tasks:update",
    "documents:read",
    "documents:create",
    "documents:update",
    "team:read",
    "reports:read",
    "settings:read",
  ],
};

/**
 * Check if a role has permission to perform an action
 */
export function canAccess(role: Role, action: Action): boolean {
  return PERMISSIONS[role]?.includes(action) ?? false;
}

/**
 * Get all actions allowed for a role
 */
export function getRoleActions(role: Role): Action[] {
  return PERMISSIONS[role] ?? [];
}

/**
 * Check if role is a manager-level role (OWNER or MANAGER)
 */
export function isManagerRole(role: Role): boolean {
  return role === "OWNER" || role === "MANAGER";
}
