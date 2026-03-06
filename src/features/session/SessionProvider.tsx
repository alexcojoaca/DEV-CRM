"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSession } from "./useSession";
import type { Session } from "./mockSession";

interface SessionContextValue {
  session: Session | null;
  user: Session["user"] | null;
  organization: Session["organization"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  setSession: (session: Session | null) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const sessionData = useSession();
  const { setSession, setStatus } = sessionData;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    const loadSession = () => {
      setStatus("loading");

      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          if (data.session) {
            const s = data.session;
            const mapped: Session = {
              user: {
                id: s.user.id,
                email: s.user.email,
                name: s.user.fullName || s.user.email,
                role: (s.activeRole ?? "AGENT") as Session["user"]["role"],
                organizationId: s.activeWorkspaceId ?? "",
                avatar: undefined,
              },
              organization: {
                id: s.activeWorkspaceId ?? "",
                name: s.activeWorkspaceName ?? "",
                createdAt: "",
              },
            };
            setSession(mapped);
          } else {
            setSession(null);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSession(null);
          }
        });
    };

    loadSession();

    const handleSessionRefresh = () => {
      if (!cancelled) {
        loadSession();
      }
    };

    window.addEventListener("session-refresh", handleSessionRefresh as EventListener);

    return () => {
      cancelled = true;
      window.removeEventListener("session-refresh", handleSessionRefresh as EventListener);
    };
  }, [setSession, setStatus]);

  return <SessionContext.Provider value={sessionData}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
