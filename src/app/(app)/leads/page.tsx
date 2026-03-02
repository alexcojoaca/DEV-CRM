"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LeadListItem } from "@/components/leads/LeadListItem";
import { EmptyState } from "@/components/common/EmptyState";
import { getLeads, addLead, updateLead, deleteLead, getLeadById } from "@/features/leads/leadMockData";
import type { Lead, LeadFormData } from "@/features/leads/leadTypes";
import { Plus, Search, ArrowLeft, Trash2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/session/useSession";

type PanelMode = "empty" | "add" | "edit";

export default function LeadsPage() {
  const router = useRouter();
  const { organization } = useSession();
  const workspaceId = organization?.id ?? null;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("empty");
  const [isDesktop, setIsDesktop] = useState(false);

  const [form, setForm] = useState<LeadFormData>({
    name: "",
    phone: "",
    location: "",
    notes: "",
  });

  const loadLeads = useCallback(() => {
    setLeads(getLeads(workspaceId));
  }, [workspaceId]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

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

  const filtered = leads.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = l.name.toLowerCase();
    const phoneDigits = l.phone.replace(/\D/g, "");
    const queryDigits = q.replace(/\D/g, "");
    const location = (l.location ?? "").toLowerCase();
    const matchName = name.includes(q);
    const matchPhone = phoneDigits.includes(queryDigits);
    const matchLocation = location.includes(q);
    return matchName || matchPhone || matchLocation;
  });

  const selected = selectedId ? getLeadById(workspaceId, selectedId) : null;

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      location: "",
      notes: "",
    });
  };

  const handleStartAdd = () => {
    resetForm();
    setSelectedId(null);
    setPanelMode("add");
  };

  const handleEdit = (lead: Lead) => {
    setSelectedId(lead.id);
    setForm({
      name: lead.name,
      phone: lead.phone,
      location: lead.location,
      notes: lead.notes,
    });
    setPanelMode("edit");
  };

  const handleDelete = () => {
    if (!selectedId) return;
    deleteLead(workspaceId, selectedId);
    loadLeads();
    setSelectedId(null);
    resetForm();
    setPanelMode("empty");
  };

  const handleSave = () => {
    const payload: LeadFormData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      location: form.location?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };
    if (!payload.name && !payload.phone) return;

    if (panelMode === "add") {
      const added = addLead(workspaceId, payload);
      if (!added) return;
    } else if (panelMode === "edit" && selectedId) {
      updateLead(workspaceId, selectedId, payload);
    }
    loadLeads();
    setPanelMode("empty");
    setSelectedId(null);
    resetForm();
  };

  const isPanelOpen = panelMode !== "empty";
  const showList = isDesktop || !isPanelOpen;
  const showPanel = isDesktop || isPanelOpen;

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-4">
      {/* Stânga: listă lead-uri */}
      <div
        className={cn(
          "flex flex-col w-full md:w-[360px] shrink-0 overflow-hidden",
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
          <Button
            type="button"
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleStartAdd}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adaugă lead
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {filtered.length === 0 ? (
            <EmptyState
              title={leads.length === 0 ? "Nu ai lead-uri încă" : "Niciun lead găsit"}
              description={
                leads.length === 0
                  ? "Adaugă lead-uri noi cu nume, telefon și locație."
                  : "Încearcă altă căutare."
              }
            />
          ) : (
            filtered.map((lead) => (
              <LeadListItem
                key={lead.id}
                lead={lead}
                isActive={selectedId === lead.id}
                onClick={() => {
                  setSelectedId(lead.id);
                  handleEdit(lead);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Dreapta: panou detalii / formular */}
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
                  resetForm();
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Înapoi la lead-uri
              </Button>
            </div>
          )}

          {panelMode === "empty" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[260px] text-center text-muted-foreground">
              <p className="font-medium">
                Selectează un lead sau adaugă unul nou.
              </p>
            </div>
          )}

          {panelMode !== "empty" && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {panelMode === "add" ? "Lead nou" : "Editează lead"}
                </h2>
                {panelMode === "edit" && selected && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Șterge
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nume</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5 border-purple-200"
                    placeholder="Nume lead"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="mt-1.5 border-purple-200"
                    placeholder="ex: 07xx xxx xxx"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Locație / Zonă</label>
                  <Input
                    value={form.location ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="mt-1.5 border-purple-200"
                    placeholder="ex: Pipera, București"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notițe</label>
                  <Textarea
                    value={form.notes ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="mt-1.5 border-purple-200 min-h-[80px]"
                    placeholder="Detalii importante despre lead..."
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {panelMode === "edit" && selected && (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("fromLead", "1");
                      if (selected.name) params.set("name", selected.name);
                      if (selected.phone) params.set("phone", selected.phone);
                      const notesParts: string[] = [];
                      if (selected.location?.trim()) notesParts.push(`Zonă: ${selected.location.trim()}`);
                      if (selected.notes?.trim()) notesParts.push(selected.notes.trim());
                      if (notesParts.length) params.set("notes", notesParts.join("\n\n"));
                      router.push(`/clients?${params.toString()}`);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Transformă în client
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (panelMode === "add") {
                      resetForm();
                    } else if (panelMode === "edit" && selected) {
                      handleEdit(selected);
                    }
                    if (!isDesktop) {
                      setPanelMode("empty");
                      setSelectedId(null);
                    }
                  }}
                >
                  Anulează
                </Button>
                <Button
                  type="button"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleSave}
                >
                  Salvează
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

