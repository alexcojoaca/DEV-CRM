"use client";

import { create } from "zustand";
import { mockSession, type Session } from "./mockSession";

interface SessionStore {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

const useSessionStore = create<SessionStore>((set) => ({
  session: mockSession,
  setSession: (session) => set({ session }),
}));

export function useSession() {
  const { session, setSession } = useSessionStore();

  return {
    session,
    user: session?.user ?? null,
    organization: session?.organization ?? null,
    isAuthenticated: !!session,
    setSession,
  };
}
