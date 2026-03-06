"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientListItem } from "@/components/clients/ClientListItem";
import { ClientForm } from "@/components/clients/ClientForm";
import { ClientDetailPanel } from "@/components/clients/ClientDetailPanel";
import { EmptyState } from "@/components/common/EmptyState";
import type { Client, ClientFormData } from "@/features/clients/clientTypes";
import { FOLLOW_UP_DAYS, MAX_FOLLOW_UPS, STATUS_OPTIONS, TRANSACTION_TYPE_OPTIONS, clientFromApi } from "@/features/clients/clientTypes";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/session/useSession";

const FOLLOW_UP_MS = FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000;

type PanelMode = "empty" | "add" | "edit" | "view";

function openCall(phone: string) {
  window.location.href = `tel:${phone.replace(/\D/g, "").replace(/^0/, "")}`;
}

function openWhatsApp(phone: string) {
  const clean = phone.replace(/^\+/, "").replace(/\D/g, "");
  window.open(`https://wa.me/${clean}`, "_blank", "noopener,noreferrer");
}

function ClientsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { organization } = useSession();
  const workspaceId = organization?.id ?? null;
  const [clients, setClients] = useState<Client[]>([]);
  const [initialAddFromLead, setInitialAddFromLead] = useState<Partial<ClientFormData> | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [transactionFilter, setTransactionFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("empty");
  const [isDesktop, setIsDesktop] = useState(false);

  const loadClients = useCallback(async () => {
    if (!workspaceId) {
      setClients([]);
      return;
    }
    try {
      const res = await fetch("/api/clients", { credentials: "include" });
      if (!res.ok) {
        setClients([]);
        return;
      }
      const data = (await res.json()) as import("@/features/clients/clientTypes").ClientApiDto[];
      setClients(data.map(clientFromApi));
    } catch {
      setClients([]);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    const fromLead = searchParams.get("fromLead");
    const name = searchParams.get("name") ?? "";
    const phone = searchParams.get("phone") ?? "";
    const notes = searchParams.get("notes") ?? "";
    if (fromLead === "1" && (name || phone || notes)) {
      setInitialAddFromLead({
        ...(name && { name }),
        ...(phone && { phone }),
        ...(notes && { notes }),
      });
      setPanelMode("add");
      setSelectedId(null);
      router.replace("/clients", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };
    setIsDesktop(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
      const matchZone = (c.zone ?? "").toLowerCase().includes(q) || (c.county ?? "").toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchZone) return false;
    }
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (transactionFilter !== "all" && c.transactionType !== transactionFilter) return false;
    return true;
  });

  const selected = selectedId ? clients.find((c) => c.id === selectedId) ?? null : null;

  const showFollowUpNotification =
    selected?.lastContactedAt &&
    selected.status !== "disqualified" &&
    (selected.followUpCount ?? 0) < MAX_FOLLOW_UPS &&
    Date.now() - new Date(selected.lastContactedAt).getTime() >= FOLLOW_UP_MS;

  const handleSaveNew = (data: ClientFormData) => {
    if (!workspaceId) return;
    void (async () => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) return;
      await loadClients();
      setPanelMode("empty");
      setSelectedId(null);
    })();
  };

  const handleSaveEdit = (data: ClientFormData) => {
    if (!selectedId || !workspaceId) return;
    void (async () => {
      const res = await fetch(`/api/clients/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) return;
      await loadClients();
      setPanelMode("view");
    })();
  };

  const handleContactedNow = () => {
    if (!selectedId || !workspaceId) return;
    const client = clients.find((c) => c.id === selectedId);
    const count = client?.followUpCount ?? 0;
    void (async () => {
      const res = await fetch(`/api/clients/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lastContactedAt: new Date().toISOString(),
          followUpCount: count + 1,
        }),
      });
      if (!res.ok) return;
      await loadClients();
    })();
  };

  const handleCall = (phone: string, clientId: string) => {
    if (!workspaceId) return;
    const client = clients.find((c) => c.id === clientId);
    const count = client?.followUpCount ?? 0;
    void (async () => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lastContactedAt: new Date().toISOString(),
          followUpCount: count + 1,
        }),
      });
      if (!res.ok) return;
      await loadClients();
      openCall(phone);
    })();
  };

  const handleWhatsApp = (phone: string, clientId: string) => {
    if (!workspaceId) return;
    const client = clients.find((c) => c.id === clientId);
    const count = client?.followUpCount ?? 0;
    void (async () => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lastContactedAt: new Date().toISOString(),
          followUpCount: count + 1,
        }),
      });
      if (!res.ok) return;
      await loadClients();
      openWhatsApp(phone);
    })();
  };

  const handleDelete = (clientId: string) => {
    if (!workspaceId) return;
    const confirm = window.confirm("Sigur vrei să ștergi acest contact?");
    if (!confirm) return;
    void (async () => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) return;
      await loadClients();
      if (selectedId === clientId) {
        setSelectedId(null);
        setPanelMode("empty");
      }
    })();
  };

  const isPanelOpen = panelMode !== "empty";
  const showList = isDesktop || !isPanelOpen;
  const showPanel = isDesktop || isPanelOpen;

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-4">
      {/* Stânga: listă + căutare + filtre */}
      <div
        className={cn(
          "flex flex-col w-full md:w-[380px] shrink-0 overflow-hidden",
          "md:border md:border-purple-100 md:rounded-xl md:bg-white",
          !showList && "hidden md:flex"
        )}
      >
        <div className="p-3 border-b border-purple-100 space-y-3 bg-white md:bg-transparent">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută după nume, telefon, zonă..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-purple-200"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 min-w-0 h-9 border-purple-200">
                <SelectValue placeholder="Stare" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate stările</SelectItem>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger className="flex-1 min-w-0 h-9 border-purple-200">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                {TRANSACTION_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              setSelectedId(null);
              setPanelMode("add");
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adaugă contact
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {filtered.length === 0 ? (
            <EmptyState
              title={clients.length === 0 ? "Niciun client" : "Niciun rezultat"}
              description={
                clients.length === 0
                  ? "Adaugă un contact pentru a începe."
                  : "Încearcă altă căutare sau filtre."
              }
            />
          ) : (
            filtered.map((client) => (
              <ClientListItem
                key={client.id}
                client={client}
                isActive={selectedId === client.id}
                onClick={() => {
                  setSelectedId(client.id);
                  setPanelMode("view");
                }}
                onCall={handleCall}
                onWhatsApp={handleWhatsApp}
              />
            ))
          )}
        </div>
      </div>

      {/* Dreapta: panou add / edit / view */}
      <div
        className={cn(
          "flex-1 min-w-0 overflow-hidden",
          "md:border md:border-purple-100 md:rounded-xl md:bg-white",
          !showPanel && "hidden md:block"
        )}
      >
        <div className="h-full overflow-y-auto p-4 md:p-5 bg-white md:bg-transparent">
          {!isDesktop && panelMode !== "empty" && (
            <div className="mb-4 md:hidden">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPanelMode("empty");
                  setSelectedId(null);
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Înapoi la clienți
              </Button>
            </div>
          )}
          {panelMode === "empty" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center text-muted-foreground">
              <p className="font-medium">Selectează un client sau adaugă unul nou.</p>
            </div>
          )}
          {panelMode === "add" && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Adaugă contact</h2>
              <ClientForm
                initialData={initialAddFromLead ?? undefined}
                onSave={(data) => {
                  handleSaveNew(data);
                  setInitialAddFromLead(null);
                }}
                onCancel={() => {
                  setPanelMode("empty");
                  setInitialAddFromLead(null);
                }}
              />
            </div>
          )}
          {panelMode === "edit" && selected && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Editează contact</h2>
              <ClientForm
                client={selected}
                onSave={handleSaveEdit}
                onCancel={() => setPanelMode("view")}
              />
            </div>
          )}
          {panelMode === "view" && selected && (
            <ClientDetailPanel
              client={selected}
              showFollowUpNotification={!!showFollowUpNotification}
              onEdit={() => setPanelMode("edit")}
              onDelete={() => handleDelete(selected.id)}
              onContactedNow={handleContactedNow}
              onCall={(phone) => selectedId && handleCall(phone, selectedId)}
              onWhatsApp={(phone) => selectedId && handleWhatsApp(phone, selectedId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full flex-col md:flex-row gap-4 p-4">
          <div className="w-full md:w-[380px] shrink-0 h-64 rounded-xl border border-purple-100 bg-white animate-pulse" />
          <div className="flex-1 min-h-[400px] rounded-xl border border-purple-100 bg-white animate-pulse" />
        </div>
      }
    >
      <ClientsPageContent />
    </Suspense>
  );
}
