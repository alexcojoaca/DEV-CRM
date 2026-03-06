"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/features/session/useSession";
import { refreshSession } from "@/features/session/refreshSession";
import { canAccess } from "@/features/permissions/rbac";
import { Plus, Mail, Clock, UserMinus, Crown, Shield, UserCheck, Inbox } from "lucide-react";

interface Member {
  userId: string;
  email: string;
  fullName: string | null;
  role: "OWNER" | "MANAGER" | "AGENT";
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ReceivedInvite {
  id: string;
  workspaceId: string;
  workspaceName: string;
  role: string;
  createdAt: string;
}

const roleLabels: Record<string, string> = {
  OWNER: "Proprietar",
  MANAGER: "Manager",
  AGENT: "Agent",
};

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  OWNER: Crown,
  MANAGER: Shield,
  AGENT: UserCheck,
};

export default function TeamPage() {
  const { user, organization } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<ReceivedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MANAGER" | "AGENT">("AGENT");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRole = user?.role ?? "AGENT";
  const canInvite = canAccess(currentRole, "team:invite");
  const canRemove = canAccess(currentRole, "team:remove");

  useEffect(() => {
    loadTeam();
    loadReceivedInvites();
  }, []);

  async function loadTeam() {
    try {
      const res = await fetch("/api/team/list");
      const data = await res.json();
      if (data.members) setMembers(data.members);
      if (data.pendingInvites) setPendingInvites(data.pendingInvites);
    } catch {
      setMembers([]);
      setPendingInvites([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadReceivedInvites() {
    try {
      const res = await fetch("/api/invites/list");
      const data = await res.json();
      if (data.invites) setReceivedInvites(data.invites);
    } catch {
      setReceivedInvites([]);
    }
  }

  const handleInvite = async () => {
    if (!email.trim()) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/invites/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Eroare la trimitere");
        return;
      }
      setEmail("");
      setRole("AGENT");
      await loadTeam();
    } catch {
      setError("Eroare la trimitere");
    } finally {
      setSending(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      const res = await fetch("/api/invites/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      if (res.ok) await loadTeam();
    } catch {
      /* ignore */
    }
  };

  const handleAccept = async (inviteId: string) => {
    try {
      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      if (res.ok) {
        setReceivedInvites((prev) => prev.filter((i) => i.id !== inviteId));
        loadTeam();
        refreshSession();
      }
    } catch {
      /* ignore */
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Ești sigur că vrei să elimini acest membru din echipă?")) return;
    try {
      const res = await fetch("/api/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) await loadTeam();
    } catch {
      /* ignore */
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    const order = { OWNER: 0, MANAGER: 1, AGENT: 2 };
    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Echipa" description="Membri și invitații" />
        <p className="text-muted-foreground">Se încarcă…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Echipa"
        description="Proprietarul poate invita manageri și agenți, trimite invitații prin email și elimina membri."
      />

      {/* Invitații primite – pentru utilizatorul curent */}
      {receivedInvites.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Inbox className="h-5 w-5" />
              Invitații primite
            </CardTitle>
            <CardDescription>
              Ai fost invitat în aceste echipe. Acceptă pentru a te alătura.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {receivedInvites.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-purple-200 bg-white p-3"
              >
                <div>
                  <p className="font-medium">{inv.workspaceName}</p>
                  <p className="text-sm text-muted-foreground">Rol: {roleLabels[inv.role] ?? inv.role}</p>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleAccept(inv.id)}>
                  Acceptă
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Membrii echipei */}
      <Card>
        <CardHeader>
          <CardTitle>Membri</CardTitle>
          <CardDescription>
            {organization?.name ?? "Workspace"} – proprietarul echipei poate elimina agenți și manageri.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {sortedMembers.map((m) => {
              const Icon = roleIcons[m.role] ?? UserCheck;
              const isCurrentUser = user?.id === m.userId;
              return (
                <li key={m.userId}>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-purple-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {m.fullName || m.email}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">(eu)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800">
                        {roleLabels[m.role] ?? m.role}
                      </span>
                      {canRemove && m.role !== "OWNER" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleRemove(m.userId)}
                          title="Elimină din echipă"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Invită membru nou – doar OWNER și MANAGER */}
      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle>Trimite invitație</CardTitle>
            <CardDescription>
              Introdu adresa de email și rolul. Persoana va primi invitația și o poate accepta după ce se înregistrează sau se conectează cu acel email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_140px_auto]">
              <div className="space-y-2">
                <label htmlFor="invite-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="exemplu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-purple-200"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invite-role" className="text-sm font-medium">
                  Rol
                </label>
                <Select value={role} onValueChange={(v) => setRole(v as "MANAGER" | "AGENT")}>
                  <SelectTrigger id="invite-role" className="border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AGENT">Agent</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleInvite}
                  disabled={!email.trim() || sending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {sending ? "Se trimite…" : "Trimite"}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Invitații în așteptare */}
      {canInvite && pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitații trimise (în așteptare)</CardTitle>
            <CardDescription>Invitații care nu au fost încă acceptate. Poți revoca o invitație.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {pendingInvites.map((inv) => (
                <li key={inv.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-purple-100 p-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{inv.email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Trimis {new Date(inv.createdAt).toLocaleDateString("ro-RO")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                        {roleLabels[inv.role] ?? inv.role}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(inv.id)}
                        title="Revocă invitația"
                      >
                        Revocă
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!canInvite && (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-muted-foreground">
              Nu ai permisiunea să inviți membri. Doar proprietarul și managerii pot trimite invitații.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
