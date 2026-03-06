"use client";

import { useSession } from "@/features/session/useSession";
import type { SessionMembership, AppSession } from "@/features/auth/types";
import { useEffect, useState } from "react";

export function useActiveWorkspaceId(): string | null {
  const { organization } = useSession();
  return organization?.id ?? null;
}

export function useWorkspaceRole(): string | null {
  const { user } = useSession();
  return user?.role ?? null;
}

export function useWorkspaceInfo() {
  const { user, organization } = useSession();
  return {
    workspaceId: organization?.id ?? null,
    workspaceName: organization?.name ?? null,
    role: user?.role ?? null,
  };
}

interface SessionWithMemberships extends AppSession {}

export function useAuthSessionWithMemberships() {
  const [session, setSession] = useState<SessionWithMemberships | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.session) {
          setSession(data.session as SessionWithMemberships);
        } else {
          setSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { session, loading };
}

export function getActiveMembership(session: SessionWithMemberships | null): SessionMembership | null {
  if (!session || !session.activeWorkspaceId) return null;
  return session.memberships.find((m) => m.workspaceId === session.activeWorkspaceId) ?? null;
}

