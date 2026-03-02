"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Client } from "@/features/clients/clientTypes";
import type { Property } from "@/features/properties/propertyTypes";
import { normalizePropertyImages } from "@/features/properties/propertyTypes";
import { getClients } from "@/features/clients/clientMockData";
import { getProperties } from "@/features/properties/propertyMockData";
import { formatPriceDisplay } from "@/components/properties/PriceInput";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { useSession } from "@/features/session/useSession";
import { ArrowLeft, Search, Users, Home, Puzzle } from "lucide-react";

type Mode = "client" | "property";

function propertyMatchesClient(property: Property, client: Client): boolean {
  if (property.transactionType !== client.transactionType) return false;

  const price = property.price ?? 0;
  const budgetMin = client.budgetMin ?? null;
  const budgetMax = client.budgetMax ?? null;
  const budgetMaxWithMargin = budgetMax != null ? budgetMax * 1.1 : null;

  if (budgetMin != null && price < budgetMin) return false;
  if (budgetMaxWithMargin != null && price > budgetMaxWithMargin) return false;

  const rooms = property.rooms ?? property.bedrooms ?? 0;
  if (client.roomsMin != null && rooms && rooms < client.roomsMin) return false;
  if (client.roomsMax != null && rooms && rooms > client.roomsMax) return false;

  if (client.zone) {
    const cz = client.zone.toLowerCase();
    const pz = (property.zone ?? "").toLowerCase();
    if (!pz || pz !== cz) return false;
  }

  return true;
}

export default function MatchesPage() {
  const { organization } = useSession();
  const workspaceId = organization?.id ?? null;
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [mode, setMode] = useState<Mode>("client");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);

  useEffect(() => {
    setClients(getClients(workspaceId));
    setProperties(getProperties(workspaceId));
  }, [workspaceId]);

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

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      const name = c.name.toLowerCase();
      const phoneDigits = c.phone.replace(/\D/g, "");
      const queryDigits = q.replace(/\D/g, "");
      const zone = (c.zone ?? "").toLowerCase();
      return (
        name.includes(q) ||
        (queryDigits && phoneDigits.includes(queryDigits)) ||
        zone.includes(q)
      );
    });
  }, [clients, search]);

  const filteredProperties = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) => {
      const title = p.title.toLowerCase();
      const zone = (p.zone ?? "").toLowerCase();
      const city = (p.city ?? "").toLowerCase();
      return title.includes(q) || zone.includes(q) || city.includes(q);
    });
  }, [properties, search]);

  const selectedClient =
    mode === "client" && selectedId
      ? clients.find((c) => c.id === selectedId) ?? null
      : null;
  const selectedProperty =
    mode === "property" && selectedId
      ? properties.find((p) => p.id === selectedId) ?? null
      : null;

  const clientMatchesMap = useMemo(() => {
    const map = new Map<string, Property[]>();
    clients.forEach((client) => {
      const matches = properties.filter((p) => propertyMatchesClient(p, client));
      map.set(client.id, matches);
    });
    return map;
  }, [clients, properties]);

  const propertyMatchesMap = useMemo(() => {
    const map = new Map<string, Client[]>();
    properties.forEach((property) => {
      const matches = clients.filter((c) => propertyMatchesClient(property, c));
      map.set(property.id, matches);
    });
    return map;
  }, [clients, properties]);

  const currentMatches =
    mode === "client" && selectedClient
      ? clientMatchesMap.get(selectedClient.id) ?? []
      : mode === "property" && selectedProperty
        ? propertyMatchesMap.get(selectedProperty.id) ?? []
        : [];

  const isPanelOpen = !!selectedId;
  const showList = isDesktop || !isPanelOpen;
  const showPanel = isDesktop || isPanelOpen;

  const toggleMatchSelection = (id: string) => {
    setSelectedMatchIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedMatchIds([]);

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-4">
      {/* Stânga: listă entități (clienți / proprietăți) */}
      <div
        className={cn(
          "flex flex-col w-full md:w-[380px] shrink-0 overflow-hidden",
          "md:border md:border-purple-100 md:rounded-xl md:bg-white",
          !showList && "hidden md:flex"
        )}
      >
        <div className="p-3 border-b border-purple-100 space-y-3 bg-white md:bg-transparent">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  mode === "client"
                    ? "Caută client după nume, telefon, zonă..."
                    : "Caută proprietate după titlu, zonă..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-purple-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "client" ? "default" : "outline"}
              className={cn(
                "flex-1 justify-center border-purple-200",
                mode === "client" &&
                  "bg-purple-600 hover:bg-purple-700 text-white"
              )}
              onClick={() => {
                setMode("client");
                setSelectedId(null);
                clearSelection();
              }}
            >
              <Users className="h-4 w-4 mr-1.5" />
              Clienți
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "property" ? "default" : "outline"}
              className={cn(
                "flex-1 justify-center border-purple-200",
                mode === "property" &&
                  "bg-purple-600 hover:bg-purple-700 text-white"
              )}
              onClick={() => {
                setMode("property");
                setSelectedId(null);
                clearSelection();
              }}
            >
              <Home className="h-4 w-4 mr-1.5" />
              Proprietăți
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {mode === "client" ? (
            filteredClients.length === 0 ? (
              <EmptyState
                title={
                  clients.length === 0
                    ? "Nu ai clienți încă"
                    : "Niciun client găsit"
                }
                description={
                  clients.length === 0
                    ? "Adaugă clienți în CRM pentru a vedea potrivirile."
                    : "Încearcă altă căutare."
                }
              />
            ) : (
              filteredClients.map((client) => {
                const matches = clientMatchesMap.get(client.id) ?? [];
                return (
                  <div
                    key={client.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedId(client.id);
                      clearSelection();
                    }}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      setSelectedId(client.id)
                    }
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-all",
                      selectedId === client.id
                        ? "border-purple-400 bg-purple-50/80 shadow-sm"
                        : "border-purple-100 bg-white hover:border-purple-200 hover:bg-purple-50/40"
                    )}
                  >
                    <p className="font-semibold text-foreground truncate">
                      {client.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {client.phone}
                    </p>
                    {client.zone && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {client.zone}
                      </p>
                    )}
                    {matches.length > 0 && (
                      <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <Puzzle className="h-3 w-3 mr-1" />
                        {matches.length} potriviri
                      </span>
                    )}
                  </div>
                );
              })
            )
          ) : filteredProperties.length === 0 ? (
            <EmptyState
              title={
                properties.length === 0
                  ? "Nu ai proprietăți încă"
                  : "Nicio proprietate găsită"
              }
              description={
                properties.length === 0
                  ? "Adaugă proprietăți în portofoliu pentru a vedea potrivirile."
                  : "Încearcă altă căutare."
              }
            />
          ) : (
            filteredProperties.map((property) => {
              const matches = propertyMatchesMap.get(property.id) ?? [];
              return (
                <div
                  key={property.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedId(property.id);
                    clearSelection();
                  }}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    setSelectedId(property.id)
                  }
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all",
                    selectedId === property.id
                      ? "border-purple-400 bg-purple-50/80 shadow-sm"
                      : "border-purple-100 bg-white hover:border-purple-200 hover:bg-purple-50/40"
                  )}
                >
                  <p className="font-semibold text-foreground truncate">
                    {property.title}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {property.city}
                    {property.zone ? `, ${property.zone}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatPriceDisplay(property.price)} EUR •{" "}
                    {property.transactionType === "sale" ? "Vânzare" : "Chirie"}
                  </p>
                  {matches.length > 0 && (
                    <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      <Puzzle className="h-3 w-3 mr-1" />
                      {matches.length} potriviri
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dreapta: card + listă potriviri */}
      <div
        className={cn(
          "flex-1 min-w-0 overflow-hidden",
          "md:border md:border-purple-100 md:rounded-xl md:bg-white",
          !showPanel && "hidden md:block"
        )}
      >
        <div className="h-full overflow-y-auto p-4 md:p-5 bg-white md:bg-transparent">
          {!isDesktop && selectedId && (
            <div className="mb-4 md:hidden">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedId(null);
                  clearSelection();
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Înapoi la listă
              </Button>
            </div>
          )}

          {!selectedId && (
            <div className="flex flex-col items-center justify-center h-full min-h-[260px] text-center text-muted-foreground">
              <p className="font-medium">
                Alege un client sau o proprietate pentru a vedea potrivirile.
              </p>
            </div>
          )}

          {selectedId && mode === "client" && selectedClient && (
            <div className="space-y-4">
              {/* Card client */}
              <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50/70 to-pink-50/60 p-4 flex flex-col gap-1">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                  Client selectat
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {selectedClient.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedClient.phone}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedClient.zone && `${selectedClient.zone} • `}
                  {selectedClient.transactionType === "sale"
                    ? "Vânzare"
                    : "Chirie"}
                </p>
                {(selectedClient.budgetMin != null ||
                  selectedClient.budgetMax != null) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Buget:{" "}
                    {selectedClient.budgetMin != null &&
                    selectedClient.budgetMax != null
                      ? `${formatPriceDisplay(
                          selectedClient.budgetMin
                        )} – ${formatPriceDisplay(
                          selectedClient.budgetMax
                        )} EUR`
                      : selectedClient.budgetMin != null
                        ? `min ${formatPriceDisplay(
                            selectedClient.budgetMin
                          )} EUR`
                        : `max ${formatPriceDisplay(
                            selectedClient.budgetMax!
                          )} EUR`}
                  </p>
                )}
              </div>

              {/* Listă proprietăți potrivite */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Proprietăți potrivite ({currentMatches.length})
                </h3>
                {currentMatches.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={selectedMatchIds.length === 0}
                    className="text-xs"
                    onClick={() => {
                      // aici poți lega ulterior fluxul de „propune selectate”
                    }}
                  >
                    Propune selectate
                  </Button>
                )}
              </div>

              {currentMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nu am găsit deocamdată proprietăți care să respecte bugetul,
                  camerele și zona acestui client.
                </p>
              ) : (
                <div className="space-y-2">
                  {(currentMatches as Property[]).map((property) => {
                    const cover =
                      property.images && property.images.length
                        ? normalizePropertyImages(property.images)[0]?.data
                        : null;
                    return (
                      <div
                        key={property.id}
                        className="flex items-start gap-3 rounded-xl border border-purple-100 bg-white p-3"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selectedMatchIds.includes(property.id)}
                          onChange={() => toggleMatchSelection(property.id)}
                        />
                        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              Fără poză
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {property.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {property.city}
                            {property.zone ? `, ${property.zone}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatPriceDisplay(property.price)} EUR •{" "}
                            {property.transactionType === "sale"
                              ? "Vânzare"
                              : "Chirie"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            window.open(
                              `/properties?viewId=${property.id}`,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                        >
                          Propune
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedId && mode === "property" && selectedProperty && (
            <div className="space-y-4">
              {/* Card proprietate */}
              <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50/70 to-pink-50/60 p-4 flex flex-col gap-1">
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                  Proprietate selectată
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {selectedProperty.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedProperty.city}
                  {selectedProperty.zone
                    ? `, ${selectedProperty.zone}`
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPriceDisplay(selectedProperty.price)} EUR •{" "}
                  {selectedProperty.transactionType === "sale"
                    ? "Vânzare"
                    : "Chirie"}
                </p>
              </div>

              {/* Listă clienți potriviți */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Clienți potriviți ({currentMatches.length})
                </h3>
                {currentMatches.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={selectedMatchIds.length === 0}
                    className="text-xs"
                    onClick={() => {
                      // aici poți lega ulterior fluxul de „propune selectate”
                    }}
                  >
                    Propune selectați
                  </Button>
                )}
              </div>

              {currentMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nu am găsit clienți care să se încadreze în buget, camere și
                  zonă pentru această proprietate.
                </p>
              ) : (
                <div className="space-y-2">
                  {(currentMatches as Client[]).map((client) => (
                    <div
                      key={client.id}
                      className="flex items-start gap-3 rounded-xl border border-purple-100 bg-white p-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selectedMatchIds.includes(client.id)}
                        onChange={() => toggleMatchSelection(client.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client.phone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {client.zone && `${client.zone} • `}
                          {client.transactionType === "sale"
                            ? "Vânzare"
                            : "Chirie"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          window.open(
                            `/clients`,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                      >
                        Propune
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

