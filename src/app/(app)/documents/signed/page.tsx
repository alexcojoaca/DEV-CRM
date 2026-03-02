"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Download,
  FileText,
  Eye,
  Trash2,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  KeyRound,
  Handshake,
  Calendar,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSession } from "@/features/session/useSession";
import { format, parseISO } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";

type DocType = "vanzare" | "inchiriere";

interface SignedItem {
  token: string;
  type: DocType;
  createdAt: string;
  signedAt: string;
  clientName: string;
  propertyAddress: string;
  tipImobil: string;
}

function itemId(item: SignedItem): string {
  return `${item.type}:${item.token}`;
}

const API_VANZARE = "/api/documents/fisa-vizionare-vanzare";
const API_INCHIRIERE = "/api/documents/fisa-vizionare-inchiriere";

function apiBase(type: DocType): string {
  return type === "vanzare" ? API_VANZARE : API_INCHIRIERE;
}

const MONTHS_RO = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];

function monthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const monthName = MONTHS_RO[parseInt(m, 10) - 1] ?? m;
  return `${monthName} ${y}`;
}

function SignedDocumentsPageContent() {
  const searchParams = useSearchParams();
  const { user } = useSession();
  const [items, setItems] = useState<SignedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const typeParam = searchParams.get("type");
  const initialFilter: "all" | DocType =
    typeParam === "inchiriere" || typeParam === "vanzare" ? typeParam : "all";
  const [filterType, setFilterType] = useState<"all" | DocType>(initialFilter);
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | "bulk" | null>(null);

  const uid = user?.id ?? "";

  useEffect(() => {
    setFilterType(initialFilter);
  }, [initialFilter]);

  const fetchList = useCallback(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`${API_VANZARE}/signed?userId=${encodeURIComponent(uid)}&sort=date`).then((r) => r.json()),
      fetch(`${API_INCHIRIERE}/signed?userId=${encodeURIComponent(uid)}&sort=date`).then((r) => r.json()),
    ])
      .then(([vanzare, inchiriere]) => {
        const vanzareItems: SignedItem[] = (vanzare.items ?? []).map((i: Record<string, unknown>) => ({
          ...i,
          type: "vanzare" as DocType,
        })) as SignedItem[];
        const inchiriereItems: SignedItem[] = (inchiriere.items ?? []).map((i: Record<string, unknown>) => ({
          ...i,
          type: "inchiriere" as DocType,
        })) as SignedItem[];
        const merged = [...vanzareItems, ...inchiriereItems].sort((a, b) => {
          const da = a.signedAt ? new Date(a.signedAt).getTime() : 0;
          const db = b.signedAt ? new Date(b.signedAt).getTime() : 0;
          return db - da;
        });
        setItems(merged);
        setSelected(new Set());
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [uid]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (filterType !== "all") {
      list = list.filter((i) => i.type === filterType);
    }
    if (monthFilter !== "all") {
      list = list.filter((i) => {
        if (!i.signedAt) return false;
        const k = monthKey(parseISO(i.signedAt));
        return k === monthFilter;
      });
    }
    return list;
  }, [items, filterType, monthFilter]);

  const byMonth = useMemo(() => {
    const map = new Map<string, SignedItem[]>();
    for (const item of filteredItems) {
      const d = item.signedAt ? parseISO(item.signedAt) : new Date(item.createdAt);
      const key = monthKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    const keys = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return { keys, map };
  }, [filteredItems]);

  const monthOptions = useMemo(() => {
    const keys = new Set<string>();
    for (const item of items) {
      const d = item.signedAt ? parseISO(item.signedAt) : new Date(item.createdAt);
      keys.add(monthKey(d));
    }
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [items]);

  const downloadPdf = (item: SignedItem) => {
    const base = apiBase(item.type);
    window.open(
      `${base}/signed/${item.token}/pdf?userId=${encodeURIComponent(uid)}`,
      "_blank",
      "noopener"
    );
  };

  const viewPdf = (item: SignedItem) => {
    const base = apiBase(item.type);
    window.open(
      `${base}/signed/${item.token}/pdf?userId=${encodeURIComponent(uid)}&view=1`,
      "_blank",
      "noopener"
    );
  };

  const deleteOne = async (item: SignedItem) => {
    if (!uid || !confirm("Ștergi definitiv acest document? Acțiunea nu poate fi anulată.")) return;
    const id = itemId(item);
    setDeleting(id);
    const base = apiBase(item.type);
    try {
      const res = await fetch(
        `${base}/signed/${item.token}?userId=${encodeURIComponent(uid)}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Eroare");
      setItems((prev) => prev.filter((i) => itemId(i) !== id));
      setSelected((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    } catch {
      alert("Eroare la ștergere.");
    } finally {
      setDeleting(null);
    }
  };

  const deleteSelected = async () => {
    const toDelete = Array.from(selected)
      .map((id) => {
        const [type, token] = id.split(":");
        return items.find((i) => i.type === type && i.token === token);
      })
      .filter(Boolean) as SignedItem[];
    if (!uid || toDelete.length === 0 || !confirm(`Ștergi definitiv ${toDelete.length} document(e)? Acțiunea nu poate fi anulată.`)) return;
    setDeleting("bulk");
    try {
      for (const item of toDelete) {
        const base = apiBase(item.type);
        await fetch(
          `${base}/signed/${item.token}?userId=${encodeURIComponent(uid)}`,
          { method: "DELETE" }
        );
      }
      const ids = new Set(toDelete.map(itemId));
      setItems((prev) => prev.filter((i) => !ids.has(itemId(i))));
      setSelected(new Set());
    } catch {
      alert("Eroare la ștergere.");
    } finally {
      setDeleting(null);
    }
  };

  const toggleOne = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMonth = (key: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAllVisible = () => {
    if (selected.size === filteredItems.length) setSelected(new Set());
    else setSelected(new Set(filteredItems.map(itemId)));
  };

  const filteredSelectedSize = useMemo(() => {
    return filteredItems.filter((i) => selected.has(itemId(i))).length;
  }, [filteredItems, selected]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/documents" aria-label="Înapoi la Documente">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <PageHeader
          title="Documente semnate"
          description="Fișe de vizionare (vânzare și închiriere) semnate de clienți. Filtrează, vizualizează, descarcă sau șterge."
        />
      </div>

      {/* Filtre: buton care deschide popover + rezumat vizual */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default" className="gap-2 shadow-sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filtre
              <ChevronRight className="h-4 w-4 rotate-90 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Tip document
                </p>
                <div className="grid grid-cols-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setFilterType("all")}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      filterType === "all"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted/60"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                      <LayoutGrid className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium">Toate</span>
                      <p className="text-xs text-muted-foreground">Vânzare + închiriere</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("inchiriere")}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      filterType === "inchiriere"
                        ? "border-amber-500 bg-amber-50 text-amber-800"
                        : "border-border hover:bg-muted/60"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-100">
                      <KeyRound className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <span className="font-medium">Chirie</span>
                      <p className="text-xs text-muted-foreground">Fișe vizionare închiriere</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("vanzare")}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      filterType === "vanzare"
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-border hover:bg-muted/60"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100">
                      <Handshake className="h-4 w-4 text-blue-700" />
                    </div>
                    <div>
                      <span className="font-medium">Vânzare</span>
                      <p className="text-xs text-muted-foreground">Fișe vizionare vânzare</p>
                    </div>
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Lună
                </p>
                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toate lunile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate lunile</SelectItem>
                    {monthOptions.map((key) => (
                      <SelectItem key={key} value={key}>
                        {monthLabel(key)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setFilterType("all");
                  setMonthFilter("all");
                }}
              >
                Resetează filtrele
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium">
            {filterType === "all" && <LayoutGrid className="h-3.5 w-3.5" />}
            {filterType === "inchiriere" && <KeyRound className="h-3.5 w-3.5 text-amber-600" />}
            {filterType === "vanzare" && <Handshake className="h-3.5 w-3.5 text-blue-600" />}
            {filterType === "all" ? "Toate" : filterType === "inchiriere" ? "Chirie" : "Vânzare"}
          </span>
          <span className="text-muted-foreground/70">·</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium">
            <Calendar className="h-3.5 w-3.5" />
            {monthFilter === "all" ? "Toate lunile" : monthLabel(monthFilter)}
          </span>
        </span>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Se încarcă...</p>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="font-medium text-foreground">Niciun document semnat</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filterType !== "all" || monthFilter !== "all"
                ? "Schimbă filtrele pentru a vedea mai multe documente."
                : "Documentele semnate de clienți (prin linkul „Trimite către client”) vor apărea aici."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <span className="text-sm font-medium text-amber-800">
                {selected.size} document(e) selectate
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelected}
                disabled={deleting === "bulk"}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting === "bulk" ? "Se șterg..." : "Șterge selectate"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
                Anulează selecția
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 py-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filteredItems.length > 0 && filteredSelectedSize === filteredItems.length}
                onChange={toggleAllVisible}
                className="rounded border-gray-300"
              />
              Selectează toate (din listă)
            </label>
          </div>

          {/* Grupat pe luni, secțiuni expandabile */}
          <div className="space-y-2">
            {byMonth.keys.map((key) => {
              const monthItems = byMonth.map.get(key) ?? [];
              const isCollapsed = collapsedMonths.has(key);
              return (
                <Card key={key} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleMonth(key)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span
                      className={cn(
                        "transition-transform",
                        isCollapsed ? "rotate-0" : "rotate-90"
                      )}
                    >
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <span className="font-semibold text-foreground">{monthLabel(key)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({monthItems.length} documente)
                    </span>
                  </button>
                  {!isCollapsed && (
                    <div className="border-t border-border">
                      {monthItems.map((item) => {
                        const id = itemId(item);
                        return (
                          <div
                            key={id}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/20 sm:odd:bg-transparent border-b border-border last:border-b-0"
                          >
                            <label className="flex items-center gap-3 min-w-0 cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                checked={selected.has(id)}
                                onChange={() => toggleOne(id)}
                                className="rounded border-gray-300"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium truncate">{item.clientName}</p>
                                  <span
                                    className={cn(
                                      "text-xs px-2 py-0.5 rounded-full",
                                      item.type === "vanzare"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-amber-100 text-amber-800"
                                    )}
                                  >
                                    {item.type === "vanzare" ? "Vânzare" : "Chirie"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {item.tipImobil} — {item.propertyAddress}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Semnat:{" "}
                                  {item.signedAt
                                    ? format(parseISO(item.signedAt), "d MMM yyyy, HH:mm", { locale: ro })
                                    : "—"}
                                </p>
                              </div>
                            </label>
                            <div className="flex flex-wrap gap-2 shrink-0 sm:ml-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewPdf(item)}
                                title="Vizualizează"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Vezi
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadPdf(item)}
                                title="Descarcă"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Descarcă
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => deleteOne(item)}
                                disabled={deleting === id}
                                title="Șterge definitiv"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {deleting === id ? "Se șterge..." : "Șterge"}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignedDocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 animate-pulse" />
          <div className="h-10 rounded-lg border border-purple-100 bg-white animate-pulse" />
          <div className="space-y-2">
            <div className="h-20 rounded-xl border border-purple-100 bg-white animate-pulse" />
            <div className="h-20 rounded-xl border border-purple-100 bg-white animate-pulse" />
          </div>
        </div>
      }
    >
      <SignedDocumentsPageContent />
    </Suspense>
  );
}
