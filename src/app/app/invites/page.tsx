"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InviteItem {
  id: string;
  workspaceId: string;
  workspaceName: string;
  role: string;
  createdAt: string;
}

export default function InvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invites/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.invites) setInvites(data.invites);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (inviteId: string) => {
    const res = await fetch("/api/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId }),
    });
    if (res.ok) {
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      router.refresh();
    }
  };

  if (loading) return <div className="p-4">Se încarcă…</div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Invitații" description="Invitații de aderat la workspace-uri" />
      {invites.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Nu ai invitații în așteptare.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invitații în așteptare</CardTitle>
            <CardDescription>Acceptă invitațiile pentru a te alătura workspace-urilor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border border-purple-100 p-3">
                <div>
                  <p className="font-medium">{inv.workspaceName}</p>
                  <p className="text-sm text-muted-foreground">Rol: {inv.role}</p>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleAccept(inv.id)}>
                  Acceptă
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
