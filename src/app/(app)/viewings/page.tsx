"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewingListItem } from "@/components/viewings/ViewingListItem";
import { ViewingDetailPanel } from "@/components/viewings/ViewingDetailPanel";
import { ViewingForm } from "@/components/viewings/ViewingForm";
import { EmptyState } from "@/components/common/EmptyState";
import type { Viewing, ViewingFormData } from "@/features/viewings/viewingTypes";
import { viewingFromApi } from "@/features/viewings/viewingTypes";
import { getProperties, getPropertyById } from "@/features/properties/propertyMockData";
import { getClients, getClientById } from "@/features/clients/clientMockData";
import { Plus, Search, Calendar, ArrowLeft, Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/session/useSession";

type ViewMode = "list" | "detail" | "add";

const defaultFormData: ViewingFormData = {
  propertyId: undefined,
  clientId: undefined,
  propertyNameFree: undefined,
  clientNameFree: undefined,
  clientPhoneFree: undefined,
  viewingType: undefined,
  address: undefined,
  ownerName: undefined,
  ownerPhone: undefined,
  scheduledAt: new Date(),
  status: "scheduled",
  notes: undefined,
};

function ViewingsPageContent() {
  const searchParams = useSearchParams();
  const { organization } = useSession();
  const workspaceId = organization?.id ?? null;
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [filtered, setFiltered] = useState<Viewing[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "upcoming" | "past">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [addFormData, setAddFormData] = useState<ViewingFormData>(defaultFormData);
  /** Id-uri vizionări programate cu peste 24h de la data programată, neactualizate – verificat doar la încărcare */
  const [overdueViewingIds, setOverdueViewingIds] = useState<string[]>([]);
  const [overdueDismissed, setOverdueDismissed] = useState(false);

  const properties = getProperties(workspaceId);
  const clients = getClients(workspaceId);

  useEffect(() => {
    const add = searchParams.get("add");
    const clientId = searchParams.get("clientId") ?? undefined;
    const propertyId = searchParams.get("propertyId") ?? undefined;
    const dealId = searchParams.get("dealId") ?? undefined;
    if (add === "1" && (clientId || propertyId || dealId)) {
      const client = clientId ? getClientById(workspaceId, clientId) : null;
      const viewingTypeFromClient =
        client?.transactionType === "sale" ? "sale" : client?.transactionType === "rent" ? "rent" : undefined;
      setAddFormData((prev) => ({
        ...prev,
        propertyId: propertyId || prev.propertyId,
        clientId: clientId || prev.clientId,
        clientNameFree: client ? client.name : prev.clientNameFree,
        clientPhoneFree: client ? client.phone : prev.clientPhoneFree,
        viewingType: viewingTypeFromClient ?? prev.viewingType,
        dealId: dealId || prev.dealId,
        scheduledAt: prev.scheduledAt ?? new Date(Date.now() + 60 * 60 * 1000),
      }));
      setSelectedId(null);
      setViewMode("add");
    }
  }, [searchParams, workspaceId]);

  useEffect(() => {
    if (!workspaceId) {
      setViewings([]);
      setOverdueViewingIds([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/viewings", { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) {
            setViewings([]);
            setOverdueViewingIds([]);
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        const list = (data as any[]).map((v) => viewingFromApi(v));
        setViewings(list);
        const now = Date.now();
        const twentyFourHoursMs = 24 * 60 * 60 * 1000;
        const overdue = list
          .filter(
            (v) =>
              v.status === "scheduled" &&
              v.scheduledAt &&
              now - v.scheduledAt.getTime() >= twentyFourHoursMs
          )
          .map((v) => v.id);
        setOverdueViewingIds(overdue);
      } catch {
        if (!cancelled) {
          setViewings([]);
          setOverdueViewingIds([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    let list = [...viewings];
    if (statusFilter !== "all") list = list.filter((v) => v.status === statusFilter);
    if (dateFilter === "upcoming") {
      const now = new Date();
      list = list.filter((v) => v.scheduledAt && new Date(v.scheduledAt) >= now);
    }
    if (dateFilter === "past") {
      const now = new Date();
      list = list.filter((v) => v.scheduledAt && new Date(v.scheduledAt) < now);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((v) => {
        const prop = v.propertyId ? getPropertyById(workspaceId, v.propertyId) : null;
        const cl = v.clientId ? getClientById(workspaceId, v.clientId) : null;
        return (
          prop?.title?.toLowerCase().includes(q) ||
          prop?.zone?.toLowerCase().includes(q) ||
          cl?.name?.toLowerCase().includes(q) ||
          cl?.phone?.includes(q) ||
          v.propertyNameFree?.toLowerCase().includes(q) ||
          v.clientNameFree?.toLowerCase().includes(q)
        );
      });
    }
    setFiltered(list);
  }, [viewings, search, statusFilter, dateFilter, workspaceId]);

  const selectedViewing = selectedId ? viewings.find((v) => v.id === selectedId) ?? null : null;
  const selectedProperty = selectedViewing?.propertyId
    ? getPropertyById(workspaceId, selectedViewing.propertyId)
    : null;
  const selectedClient = selectedViewing?.clientId
    ? getClientById(workspaceId, selectedViewing.clientId)
    : null;

  const handleSelectViewing = (viewing: Viewing) => {
    setSelectedId(viewing.id);
    setViewMode("detail");
  };

  const handleAddNew = () => {
    setAddFormData({
      ...defaultFormData,
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // peste 1 oră
    });
    setSelectedId(null);
    setViewMode("add");
  };

  const handleSaveNew = () => {
    if (!workspaceId) return;
    void (async () => {
      const payload = {
        ...addFormData,
        scheduledAt: addFormData.scheduledAt?.toISOString(),
      };
      const res = await fetch("/api/viewings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
      const created = viewingFromApi(await res.json());
      setViewings((prev) => [...prev, created]);
      setViewMode("list");
      setSelectedId(null);
    })();
  };

  const handleUpdate = (id: string, data: ViewingFormData) => {
    if (!workspaceId) return;
    void (async () => {
      const payload = {
        ...data,
        scheduledAt: data.scheduledAt?.toISOString(),
      };
      const res = await fetch(`/api/viewings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
      const updated = viewingFromApi(await res.json());
      setViewings((prev) => prev.map((v) => (v.id === id ? updated : v)));
    })();
  };

  const handleDelete = (id: string) => {
    if (confirm("Ștergi vizionarea?")) {
      if (!workspaceId) return;
      void (async () => {
        const res = await fetch(`/api/viewings/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) return;
        setViewings((prev) => prev.filter((v) => v.id !== id));
        setViewMode("list");
        setSelectedId(null);
      })();
    }
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedId(null);
  };

  const showList = viewMode === "list";
  const showDetail = viewMode === "detail" && selectedViewing;
  const showAdd = viewMode === "add";

  return (
    <div className="-m-4 flex h-[calc(100vh-5rem)] min-h-[480px] overflow-hidden rounded-xl border border-purple-200/50 bg-white shadow-lg lg:h-[calc(100vh-5rem)]">
      {/* Left: list + search + filters + add */}
      <div
        className={cn(
          "flex w-full flex-col border-r border-purple-100 bg-gradient-to-b from-white to-purple-50/20 lg:w-[400px] lg:flex-shrink-0",
          "lg:block",
          !showList && "hidden"
        )}
      >
        <div className="flex shrink-0 flex-col gap-2 border-b border-purple-100 p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Caută proprietate sau client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-purple-200 pl-9"
              />
            </div>
            <Button
              type="button"
              size="icon"
              onClick={handleAddNew}
              className="shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as "all" | "upcoming" | "past")}>
              <SelectTrigger className="border-purple-200 text-xs w-[130px]">
                <SelectValue placeholder="Perioadă" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="upcoming">Viitoare</SelectItem>
                <SelectItem value="past">Trecute</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-purple-200 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate</SelectItem>
                <SelectItem value="scheduled">Programat</SelectItem>
                <SelectItem value="completed">Efectuat</SelectItem>
                <SelectItem value="cancelled">Anulat</SelectItem>
                <SelectItem value="no_show">Neprezentare</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {overdueViewingIds.length > 0 && !overdueDismissed && (
          <div className="mx-2 mb-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Bell className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-amber-800">
                Ai {overdueViewingIds.length} vizionare{overdueViewingIds.length === 1 ? "" : "i"} programată{overdueViewingIds.length === 1 ? "" : "e"} acum mai mult de 24h.
              </p>
              <p className="mt-0.5 text-amber-700">
                Le-ai efectuat? Deschide și actualizează statusul (Am făcut-o / Amânată / Anulată).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOverdueDismissed(true)}
              className="shrink-0 rounded p-1 text-amber-600 hover:bg-amber-100"
              aria-label="Închide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-purple-300" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {viewings.length === 0
                  ? "Nicio vizionare. Programează prima."
                  : "Niciun rezultat."}
              </p>
              {viewings.length === 0 && (
                <Button
                  type="button"
                  onClick={handleAddNew}
                  className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Programează vizionare
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((viewing) => (
                <ViewingListItem
                  key={viewing.id}
                  viewing={viewing}
                  property={viewing.propertyId ? getPropertyById(workspaceId, viewing.propertyId) : null}
                  client={viewing.clientId ? getClientById(workspaceId, viewing.clientId) : null}
                  isActive={selectedId === viewing.id}
                  onClick={() => handleSelectViewing(viewing)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: detail or add form */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          "absolute inset-0 z-10 bg-white lg:relative lg:z-0",
          showList && !showDetail && !showAdd && "hidden lg:flex lg:items-center lg:justify-center"
        )}
      >
        {showDetail && selectedViewing && (
          <ViewingDetailPanel
            viewing={selectedViewing}
            property={selectedProperty}
            client={selectedClient}
            properties={properties}
            clients={clients}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onBack={handleBack}
          />
        )}
        {showAdd && (
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center gap-3 border-b border-purple-100 px-4 py-3">
              <Button type="button" variant="ghost" size="icon" onClick={handleBack} className="lg:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-bold text-foreground">Vizionare nouă</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ViewingForm
                data={addFormData}
                onChange={setAddFormData}
                onSubmit={handleSaveNew}
                onCancel={handleBack}
                submitLabel="Programează vizionare"
                properties={properties}
                clients={clients}
              />
            </div>
          </div>
        )}
        {showList && !showDetail && !showAdd && (
          <div className="hidden lg:flex flex-1 items-center justify-center p-8">
            <EmptyState
              title="Selectează o vizionare"
              description="Alege o vizionare din listă sau programează una nouă."
              icon={<Calendar className="h-14 w-14 text-purple-400" />}
              action={{
                label: "Programează vizionare",
                onClick: handleAddNew,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViewingsPage() {
  return (
    <Suspense
      fallback={
        <div className="-m-4 flex h-[calc(100vh-5rem)] min-h-[480px] items-center justify-center rounded-xl border border-purple-200/50 bg-white">
          <div className="h-32 w-32 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
        </div>
      }
    >
      <ViewingsPageContent />
    </Suspense>
  );
}
