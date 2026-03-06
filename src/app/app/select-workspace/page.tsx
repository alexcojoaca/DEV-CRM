"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { refreshSession } from "@/features/session/refreshSession";
import { useAuthSessionWithMemberships } from "@/features/workspaces/useWorkspace";

export default function SelectWorkspacePage() {
  const router = useRouter();
  const { session, loading } = useAuthSessionWithMemberships();

  const handleSelect = async (workspaceId: string) => {
    const res = await fetch("/api/workspaces/set-active", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId }),
    });
    if (!res.ok) return;
    refreshSession();
    router.push("/dashboard");
    router.refresh();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Se încarcă…</div>;
  if (!session) {
    router.replace("/auth/login");
    return null;
  }

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
