"use client";

import { create } from "zustand";
import type { Session } from "./mockSession";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionStore {
  session: Session | null;
  status: SessionStatus;
  setSession: (session: Session | null) => void;
  setStatus: (status: SessionStatus) => void;
}

const useSessionStore = create<SessionStore>((set) => ({
  session: null,
  status: "loading",
  setSession: (session) =>
    set(() => ({
      session,
      status: session ? "authenticated" : "unauthenticated",
    })),
  setStatus: (status) => set(() => ({ status })),
}));

export function useSession() {
  const { session, status, setSession, setStatus } = useSessionStore();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    session,
    user: session?.user ?? null,
    organization: session?.organization ?? null,
    isAuthenticated,
    isLoading,
    status,
    setSession,
    setStatus,
  };
}
