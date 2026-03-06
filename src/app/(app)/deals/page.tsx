"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DealListItem } from "@/components/deals/DealListItem";
import { DealDetailPanel } from "@/components/deals/DealDetailPanel";
import { EmptyState } from "@/components/common/EmptyState";
import type { Deal } from "@/features/deals/dealTypes";
import { DEAL_STATUS_OPTIONS, DEAL_TRANSACTION_TYPE_OPTIONS, dealFromApi } from "@/features/deals/dealTypes";
import { getClients, getClientById } from "@/features/clients/clientMockData";
import { Plus, Search, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/session/useSession";

type PanelMode = "empty" | "select_client" | "view";

export default function DealsPage() {
  const { organization } = useSession();
  const workspaceId = organization?.id ?? null;
  const [deals, setDeals] = useState<Deal[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("empty");
  const [isDesktop, setIsDesktop] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  const loadDeals = useCallback(async () => {
    if (!workspaceId) {
      setDeals([]);
      return;
    }
    try {
      const res = await fetch("/api/deals", { credentials: "include" });
      if (!res.ok) {
        setDeals([]);
        return;
      }
      const data = await res.json();
      setDeals((data as any[]).map((d) => dealFromApi(d)));
    } catch {
      setDeals([]);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const allDeals = deals;
  const filtered = deals.filter((d) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const name = (d.clientNameFree || d.title || "").toLowerCase();
      const phone = (d.clientPhoneFree || "").replace(/\D/g, "");
      const typeLabel = d.transactionType === "sale" ? "vanzare" : "chirie";
      const matchName = name.includes(q);
      const matchPhone = phone.includes(q.replace(/\D/g, ""));
      const matchType = typeLabel.includes(q);
      if (!matchName && !matchPhone && !matchType) return false;
    }
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (typeFilter !== "all" && d.transactionType !== typeFilter) return false;
    return true;
  });

  const selectedDeal = selectedId ? deals.find((d) => d.id === selectedId) ?? null : null;
  const clients = getClients(workspaceId);
  const clientFiltered = clients.filter((c) => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return true;
    const matchName = c.name.toLowerCase().includes(q);
    const matchPhone = c.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
    const matchType =
      (c.transactionType === "sale" ? "vanzare" : "chirie").includes(q);
    return matchName || matchPhone || matchType;
  });

  const handleStartDeal = () => {
    setSelectedId(null);
    setPanelMode("select_client");
    setClientSearch("");
  };

  const handleSelectClient = (clientId: string) => {
    const client = getClientById(workspaceId, clientId);
    if (!client) return;
    void (async () => {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientId: client.id,
          clientNameFree: client.name,
          clientPhoneFree: client.phone,
          transactionType: client.transactionType,
          side: "buyer",
          status: "in_progress",
          offers: [],
          matchedProperties: [],
          documents: [],
          checklist: [],
          events: [],
        }),
      });
      if (!res.ok) return;
      const json = await res.json();
      const created = dealFromApi(json);
      await loadDeals();
      setSelectedId(created.id);
      setPanelMode("view");
    })();
  };

  const isPanelOpen = panelMode !== "empty";
  const showList = isDesktop || !isPanelOpen;
  const showPanel = isDesktop || isPanelOpen;

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-4">
      {/* Stânga: listă tranzacții */}
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
              placeholder="Caută după nume, telefon, tip..."
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
                <SelectItem value="all">Toate</SelectItem>
                {DEAL_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1 min-w-0 h-9 border-purple-200">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                {DEAL_TRANSACTION_TYPE_OPTIONS.map((o) => (
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
            onClick={handleStartDeal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Începe o tranzacție
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {filtered.length === 0 ? (
            <EmptyState
              title={allDeals.length === 0 ? "Nicio tranzacție" : "Niciun rezultat"}
              description={
                allDeals.length === 0
                  ? "Începe o tranzacție și selectează un client."
                  : "Încearcă altă căutare sau filtre."
              }
            />
          ) : (
            filtered.map((deal) => {
              const client = deal.clientId ? getClientById(workspaceId, deal.clientId) : null;
              return (
                <DealListItem
                  key={deal.id}
                  deal={deal}
                  clientName={client?.name}
                  isActive={selectedId === deal.id}
                  onClick={() => {
                    setSelectedId(deal.id);
                    setPanelMode("view");
                  }}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Dreapta: panou */}
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
                Înapoi la tranzacții
              </Button>
            </div>
          )}

          {panelMode === "empty" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[280px] text-center text-muted-foreground">
              <p className="font-medium">
                Selectează o tranzacție sau începe una nouă.
              </p>
            </div>
          )}

          {panelMode === "select_client" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Selectează clientul
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Caută după nume, telefon, tip tranzacție..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="pl-9 border-purple-200"
                />
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {clientFiltered.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    Niciun client găsit.
                  </p>
                ) : (
                  clientFiltered.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectClient(c.id)}
                      className="w-full rounded-xl border border-purple-100 p-3 text-left hover:bg-purple-50/50 transition-colors"
                    >
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.transactionType === "sale" ? "Vânzare" : "Chirie"}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {panelMode === "view" && selectedDeal && (
            <DealDetailPanel
              workspaceId={workspaceId}
              deal={selectedDeal}
              onDealUpdated={loadDeals}
              onDealDeleted={() => {
                setSelectedId(null);
                setPanelMode("empty");
                loadDeals();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
