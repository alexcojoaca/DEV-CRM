"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionMembership {
  workspaceId: string;
  workspaceName: string;
  role: string;
}

interface Session {
  user: { id: string; email: string; fullName: string | null };
  memberships: SessionMembership[];
  activeWorkspaceId: string | null;
}

export default function SelectWorkspacePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.session) setSession(data.session);
        else router.replace("/auth/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSelect = async (workspaceId: string) => {
    const res = await fetch("/api/workspaces/set-active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  if (loading || !session) return <div className="flex min-h-screen items-center justify-center">Se încarcă…</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Alege workspace</CardTitle>
          <p className="text-sm text-muted-foreground">Selectează workspace-ul cu care vrei să lucrezi.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {session.memberships.map((m) => (
            <Button
              key={m.workspaceId}
              variant="outline"
              className="w-full justify-start border-purple-200"
              onClick={() => handleSelect(m.workspaceId)}
            >
              {m.workspaceName} <span className="ml-2 text-xs text-muted-foreground">({m.role})</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
