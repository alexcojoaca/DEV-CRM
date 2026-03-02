"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MessageCircle, Phone, Home, Calendar, FileText, ThumbsUp, ThumbsDown, Plus, Trash2, Star } from "lucide-react";
import type { Deal, DealEvent, DealOffer, DealPropertyMatch, DealChecklistItem } from "@/features/deals/dealTypes";
import {
  DEAL_STATUS_OPTIONS,
  DEAL_TRANSACTION_TYPE_OPTIONS,
} from "@/features/deals/dealTypes";
import { formatPriceDisplay, parsePriceInput, PriceInput } from "@/components/properties/PriceInput";
import { phoneForWhatsApp } from "@/components/clients/ClientListItem";
import { getClientById } from "@/features/clients/clientMockData";
import { getProperties, getPropertyById } from "@/features/properties/propertyMockData";
import { normalizePropertyImages } from "@/features/properties/propertyTypes";
import { updateDeal, addOfferToDeal, deleteDeal } from "@/features/deals/dealMockData";
import { cn } from "@/lib/utils";

function openCall(phone: string) {
  window.location.href = `tel:${phone.replace(/\D/g, "").replace(/^0/, "")}`;
}
function openWhatsApp(phone: string) {
  const clean = phone.replace(/^\+/, "").replace(/\D/g, "");
  window.open(`https://wa.me/${clean}`, "_blank", "noopener,noreferrer");
}

interface DealDetailPanelProps {
  workspaceId: string | null;
  deal: Deal;
  onDealUpdated: () => void;
  onDealDeleted?: () => void;
  className?: string;
}

export function DealDetailPanel({ workspaceId, deal, onDealUpdated, onDealDeleted, className }: DealDetailPanelProps) {
  const client = deal.clientId ? getClientById(workspaceId, deal.clientId) : null;
  const displayName = client?.name ?? deal.clientNameFree ?? "—";
  const displayPhone = client?.phone ?? deal.clientPhoneFree ?? "";
  const displayEmail = client ? undefined : deal.clientEmailFree;
  const wappPhone = displayPhone ? phoneForWhatsApp(displayPhone) : "";

  const [newOfferAmount, setNewOfferAmount] = useState("");
  const [newCheckItem, setNewCheckItem] = useState("");
  const [newPropLabel, setNewPropLabel] = useState("");
  const [showWonModal, setShowWonModal] = useState(false);
  const [commissionReceivedInput, setCommissionReceivedInput] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const mainPrice = deal.mainPropertyPrice ?? deal.listingPrice ?? 0;
  const lastOffer = deal.offers.length > 0 ? deal.offers[deal.offers.length - 1] : null;
  const acceptedOffer = deal.offers.find((o) => o.status === "accepted");
  const commissionBase =
    deal.listingPrice ??
    acceptedOffer?.amount ??
    deal.mainPropertyPrice ??
    0;
  const commissionFromPercent =
    deal.commissionPercent != null && commissionBase > 0
      ? Math.round((commissionBase * deal.commissionPercent) / 100)
      : null;
  const commissionAmount = deal.commissionReceivedTotal ?? commissionFromPercent ?? null;
  const negotiationPercent =
    mainPrice > 0 && lastOffer && lastOffer.amount > 0
      ? Math.round(((mainPrice - lastOffer.amount) / mainPrice) * 100)
      : null;

  const handleStatusChange = (status: Deal["status"]) => {
    if (status === "won") {
      setCommissionReceivedInput(
        commissionAmount != null ? formatPriceDisplay(commissionAmount) : ""
      );
      setShowWonModal(true);
      return;
    }
    updateDeal(workspaceId, deal.id, { status });
    onDealUpdated();
  };

  const handleConfirmWon = () => {
    const amount = parsePriceInput(commissionReceivedInput);
    updateDeal(workspaceId, deal.id, { status: "won", commissionReceivedTotal: amount > 0 ? amount : undefined });
    setShowWonModal(false);
    setCommissionReceivedInput("");
    onDealUpdated();
  };

  const handleAddOffer = () => {
    const amount = parsePriceInput(newOfferAmount);
    if (!amount) return;
    addOfferToDeal(workspaceId, deal.id, amount);
    setNewOfferAmount("");
    onDealUpdated();
  };

  const handleAcceptOffer = (offerId: string) => {
    const offers = deal.offers.map((o) =>
      o.id === offerId ? { ...o, status: "accepted" as const } : { ...o, status: "rejected" as const }
    );
    updateDeal(workspaceId, deal.id, { offers });
    onDealUpdated();
  };

  const handleRejectOffer = (offerId: string) => {
    const offers = deal.offers.map((o) =>
      o.id === offerId ? { ...o, status: "rejected" as const } : o
    );
    updateDeal(workspaceId, deal.id, { offers });
    onDealUpdated();
  };

  const handleAddMatchedProperty = (
    propertyId?: string,
    label?: string,
    opts?: { price?: number; ownerName?: string; ownerPhone?: string }
  ) => {
    const prop = getPropertyById(workspaceId, propertyId || "");
    const newMatch: DealPropertyMatch = {
      id: `match_${Date.now()}`,
      propertyId,
      label: label || prop?.title || "Proprietate",
      price: opts?.price ?? prop?.price,
      ownerName: opts?.ownerName ?? prop?.ownerName,
      ownerPhone: opts?.ownerPhone ?? prop?.ownerPhone,
    };
    const next = [...(deal.matchedProperties || []), newMatch];
    const updates: Partial<Deal> = { matchedProperties: next };
    if (propertyId && prop && !deal.mainPropertyId) {
      updates.mainPropertyId = propertyId;
      updates.mainPropertyTitle = prop.title;
      updates.mainPropertyPrice = prop.price;
      updates.listingPrice = prop.price;
    } else if (opts?.price != null && !deal.mainPropertyPrice) {
      updates.mainPropertyPrice = opts.price;
      updates.listingPrice = opts.price;
    }
    updateDeal(workspaceId, deal.id, updates);
    onDealUpdated();
  };

  const handleSetMainProperty = (match: DealPropertyMatch) => {
    const prop = match.propertyId ? getPropertyById(workspaceId, match.propertyId) : null;
    const price = match.price ?? prop?.price;
    updateDeal(workspaceId, deal.id, {
      mainPropertyId: match.propertyId,
      mainPropertyTitle: match.label,
      mainPropertyPrice: price,
      listingPrice: price ?? deal.listingPrice,
    });
    onDealUpdated();
  };

  const handlePropertyLike = (matchId: string, liked: "like" | "dislike") => {
    const next = deal.matchedProperties.map((m) =>
      m.id === matchId ? { ...m, liked } : m
    );
    updateDeal(workspaceId, deal.id, { matchedProperties: next });
    onDealUpdated();
  };

  const handleChecklistToggle = (itemId: string) => {
    const next = deal.checklist.map((c) =>
      c.id === itemId ? { ...c, done: !c.done } : c
    );
    updateDeal(workspaceId, deal.id, { checklist: next });
    onDealUpdated();
  };

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const next: DealChecklistItem[] = [
      ...deal.checklist,
      { id: `check_${Date.now()}`, label: newCheckItem.trim(), done: false },
    ];
    updateDeal(workspaceId, deal.id, { checklist: next });
    setNewCheckItem("");
    onDealUpdated();
  };

  const handleRemoveCheckItem = (itemId: string) => {
    updateDeal(workspaceId, deal.id, { checklist: deal.checklist.filter((c) => c.id !== itemId) });
    onDealUpdated();
  };

  const events = deal.events ?? [];
  const handleAddEvent = (date: Date, title: string) => {
    const ev: DealEvent = { id: `ev_${Date.now()}`, date, title: title || "Eveniment" };
    updateDeal(workspaceId, deal.id, { events: [...events, ev] });
    onDealUpdated();
  };
  const handleRemoveEvent = (eventId: string) => {
    updateDeal(workspaceId, deal.id, { events: events.filter((e) => e.id !== eventId) });
    onDealUpdated();
  };
  const handleUpdateMatchOwner = (matchId: string, ownerName?: string, ownerPhone?: string) => {
    const next = deal.matchedProperties.map((m) =>
      m.id === matchId ? { ...m, ownerName, ownerPhone } : m
    );
    updateDeal(workspaceId, deal.id, { matchedProperties: next });
    onDealUpdated();
  };

  const properties = getProperties(workspaceId);

  const handleDeleteDeal = () => {
    deleteDeal(workspaceId, deal.id);
    setShowDeleteConfirm(false);
    onDealUpdated();
    onDealDeleted?.();
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Acțiuni: Șterge tranzacția */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Șterge tranzacția
        </Button>
      </div>

      {/* 1. Client + contact */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-foreground break-words">{displayName}</p>
            {displayPhone && <p className="text-sm text-muted-foreground">{displayPhone}</p>}
            {displayEmail && <p className="text-sm text-muted-foreground">{displayEmail}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {displayPhone && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => openCall(displayPhone)}
                  className="h-9 w-9 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  title="Sună"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => openWhatsApp(wappPhone)}
                  className="h-9 w-9 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. Acțiuni rapide */}
      <section className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/properties">
            <Home className="h-4 w-4 mr-1.5" />
            Propune o proprietate
          </Link>
        </Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href={`/viewings?add=1&clientId=${deal.clientId || ""}`}>
            <Calendar className="h-4 w-4 mr-1.5" />
            Programează vizionare
          </Link>
        </Button>
      </section>

      {/* 3. Stare + Finalizată / Pierdută */}
      <section className="space-y-2 border-b border-border pb-4">
        <Label>Stare tranzacție</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={deal.status}
            onValueChange={(v) => handleStatusChange(v as Deal["status"])}
          >
            <SelectTrigger className="w-[180px] border-purple-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEAL_STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {deal.status !== "won" && deal.status !== "lost" && (
            <>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleStatusChange("won")}
              >
                Tranzacție finalizată
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => handleStatusChange("lost")}
              >
                Pierdută
              </Button>
            </>
          )}
        </div>
      </section>

      {/* 4. Tip tranzacție */}
      <section className="space-y-2 border-b border-border pb-4">
        <Label>Tip tranzacție</Label>
        <Select
          value={deal.transactionType}
          onValueChange={(v) => {
            updateDeal(workspaceId, deal.id, { transactionType: v as Deal["transactionType"] });
            onDealUpdated();
          }}
        >
          <SelectTrigger className="w-[180px] border-purple-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEAL_TRANSACTION_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* 5. Imobilul pe care lucrezi / Imobile potrivite */}
      <section className="space-y-2 border-b border-border pb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Imobilul pe care lucrezi / Imobile potrivite</h3>
        <div className="flex flex-wrap gap-2">
          <Select
            value=""
            onValueChange={(id) => {
              if (id) handleAddMatchedProperty(id);
            }}
          >
            <SelectTrigger className="w-[240px] border-purple-200">
              <SelectValue placeholder="Adaugă din portofoliu" />
            </SelectTrigger>
            <SelectContent>
              {properties
                .filter((p) => !deal.matchedProperties.some((m) => m.propertyId === p.id))
                .map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title} – {formatPriceDisplay(p.price)} EUR
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 flex-wrap items-center">
            <Input
              placeholder="Titlu (manual)"
              value={newPropLabel}
              onChange={(e) => setNewPropLabel(e.target.value)}
              className="w-[160px] border-purple-200"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (newPropLabel.trim()) {
                  handleAddMatchedProperty(undefined, newPropLabel.trim());
                  setNewPropLabel("");
                }
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adaugă
            </Button>
          </div>
        </div>
        <div className="mt-2 max-h-[320px] overflow-y-auto space-y-2">
          {(deal.matchedProperties || []).map((m) => {
            const prop = m.propertyId ? getPropertyById(workspaceId, m.propertyId) : null;
            const coverImage = prop?.images?.length
              ? normalizePropertyImages(prop.images)[0]?.data
              : null;
            const ownerName = m.ownerName ?? prop?.ownerName ?? "";
            const ownerPhone = m.ownerPhone ?? prop?.ownerPhone ?? "";
            const isMain = deal.mainPropertyId === m.propertyId;
            return (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3 rounded-xl border p-3 text-sm",
                  isMain && "border-purple-400 bg-purple-50/80 ring-1 ring-purple-200"
                )}
              >
                {coverImage ? (
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <Home className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {m.propertyId ? (
                    <Link
                      href={`/properties?viewId=${m.propertyId}`}
                      className="font-medium text-purple-600 hover:underline truncate block"
                    >
                      {m.label}
                    </Link>
                  ) : (
                    <span className="font-medium">{m.label}</span>
                  )}
                  {(m.price ?? prop?.price) != null && (
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {formatPriceDisplay(m.price ?? prop?.price ?? 0)} EUR
                    </p>
                  )}
                  {(ownerName || ownerPhone) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">Proprietar: {ownerName || "—"}</span>
                      {ownerPhone && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => openCall(ownerPhone)}
                            title="Sună proprietar"
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => openWhatsApp(phoneForWhatsApp(ownerPhone))}
                            title="WhatsApp proprietar"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  {!prop && (ownerName || ownerPhone) === "" && (
                    <div className="flex gap-1 mt-1">
                      <Input
                        placeholder="Nume proprietar"
                        className="h-7 text-xs w-28 border-purple-200"
                        value={m.ownerName ?? ""}
                        onChange={(e) => handleUpdateMatchOwner(m.id, e.target.value || undefined, m.ownerPhone)}
                      />
                      <Input
                        placeholder="Telefon"
                        className="h-7 text-xs w-24 border-purple-200"
                        value={m.ownerPhone ?? ""}
                        onChange={(e) => handleUpdateMatchOwner(m.id, m.ownerName, e.target.value || undefined)}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {isMain ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-current" />
                      Imobilul pe care lucrezi
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSetMainProperty(m)}
                    >
                      Imobilul pe care lucrezi
                    </Button>
                  )}
                  <div className="flex items-center gap-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePropertyLike(m.id, "like")}
                      title="A plăcut"
                    >
                      <ThumbsUp className={cn("h-4 w-4", m.liked === "like" && "text-emerald-600")} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePropertyLike(m.id, "dislike")}
                      title="Nu a plăcut"
                    >
                      <ThumbsDown className={cn("h-4 w-4", m.liked === "dislike" && "text-red-600")} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Oferte + % negociere + Accept/Resping */}
      <section className="space-y-2 border-b border-border pb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Oferte client</h3>
        {mainPrice > 0 && (
          <p className="text-sm">
            Preț proprietate: <strong>{formatPriceDisplay(mainPrice)} EUR</strong>
          </p>
        )}
        {negotiationPercent != null && lastOffer && (
          <p className="text-sm text-muted-foreground">
            Ofertă {formatPriceDisplay(lastOffer.amount)} EUR → negociere {negotiationPercent}%
          </p>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Sumă ofertă (ex: 10.000)"
            inputMode="numeric"
            value={formatPriceDisplay(parsePriceInput(newOfferAmount)) || newOfferAmount}
            onChange={(e) => setNewOfferAmount(e.target.value.replace(/\D/g, ""))}
            className="w-[160px] border-purple-200"
          />
          <Button type="button" size="sm" variant="outline" onClick={handleAddOffer}>
            Adaugă ofertă
          </Button>
        </div>
        <ul className="space-y-2 mt-2">
          {deal.offers.map((o) => (
            <li key={o.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
              <span>
                {formatPriceDisplay(o.amount)} EUR
                <span className={cn(
                  "ml-2 text-xs",
                  o.status === "accepted" && "text-emerald-600",
                  o.status === "rejected" && "text-slate-500"
                )}>
                  {o.status === "accepted" ? "Acceptată" : o.status === "rejected" ? "Respinsă" : "În așteptare"}
                </span>
              </span>
              {o.status === "pending" && (
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => handleAcceptOffer(o.id)}>
                    Acceptă
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => handleRejectOffer(o.id)}>
                    Respinge
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Comision */}
      <section className="space-y-2 border-b border-border pb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Comision</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PriceInput
            label="Suma totală tranzacție (EUR)"
            value={commissionBase}
            onChange={(v) => {
              updateDeal(workspaceId, deal.id, { listingPrice: v || undefined });
              onDealUpdated();
            }}
            placeholder="ex: 100.000"
          />
          <div>
            <Label>Procent comision</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="%"
                value={deal.commissionPercent ?? ""}
                onChange={(e) => {
                  updateDeal(workspaceId, deal.id, {
                    commissionPercent:
                      e.target.value === "" ? undefined : parseInt(e.target.value, 10),
                  });
                  onDealUpdated();
                }}
                className="w-20 border-purple-200"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            {commissionFromPercent != null && commissionBase > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                = {formatPriceDisplay(commissionFromPercent)} EUR din suma de bază
              </p>
            )}
          </div>
          <div>
            <PriceInput
              label="Comision (EUR) calculat"
              value={commissionAmount ?? 0}
              onChange={() => undefined}
              placeholder="—"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Suma este calculată automat din procent și suma totală
            </p>
          </div>
        </div>
      </section>

      {/* 8. Evenimente (dată + titlu) */}
      <section className="space-y-2 border-b border-border pb-4">
        <Label>Data semnării / evenimente</Label>
        <div className="flex flex-wrap gap-2 items-end">
          <Input
            type="text"
            placeholder="Titlu (ex: Semnare contract)"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            className="w-[200px] border-purple-200"
          />
          <Input
            type="date"
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
            className="w-[160px] border-purple-200"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const dateStr = newEventDate || new Date().toISOString().slice(0, 10);
              handleAddEvent(new Date(dateStr), newEventTitle.trim() || "Eveniment");
              setNewEventTitle("");
              setNewEventDate("");
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adaugă
          </Button>
        </div>
        <ul className="space-y-1.5 mt-2">
          {events.map((ev) => (
            <li key={ev.id} className="flex items-center justify-between rounded-lg border border-purple-100 px-3 py-2 text-sm">
              <span>
                <strong>{new Date(ev.date).toLocaleDateString("ro-RO")}</strong>
                <span className="ml-2 text-muted-foreground">{ev.title}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => handleRemoveEvent(ev.id)}
                title="Șterge"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {/* 9. Note */}
      <section className="space-y-2 border-b border-border pb-4">
        <Label>Note</Label>
        <Textarea
          placeholder="Note despre tranzacție..."
          value={deal.notes ?? ""}
          onChange={(e) => updateDeal(workspaceId, deal.id, { notes: e.target.value || undefined })}
          className="min-h-[80px] border-purple-200"
        />
      </section>

      {/* 10. Documente */}
      <section className="space-y-2 border-b border-border pb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Documente</h3>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline">
            <FileText className="h-4 w-4 mr-1.5" />
            Atașează document
          </Button>
          <Button type="button" size="sm" variant="outline">
            Vezi documente atașate
          </Button>
        </div>
        {deal.documents && deal.documents.length > 0 && (
          <ul className="space-y-1 mt-2">
            {deal.documents.map((d) => (
              <li key={d.id} className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                    {d.name}
                  </a>
                ) : (
                  <span>{d.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 11. Checklist */}
      <section className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Checklist</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Adaugă task"
            value={newCheckItem}
            onChange={(e) => setNewCheckItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCheckItem()}
            className="border-purple-200"
          />
          <Button type="button" size="sm" variant="outline" onClick={handleAddCheckItem}>
            <Plus className="h-4 w-4 mr-1" />
            Adaugă
          </Button>
        </div>
        <ul className="space-y-1 mt-2">
          {deal.checklist.map((c) => (
            <li key={c.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={c.done}
                onChange={() => handleChecklistToggle(c.id)}
                className="rounded border-purple-200"
              />
              <span className={cn("text-sm flex-1", c.done && "line-through text-muted-foreground")}>
                {c.label}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700"
                onClick={() => handleRemoveCheckItem(c.id)}
                title="Șterge"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {/* Confirmare ștergere tranzacție */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-white border-purple-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge tranzacția?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Toate datele tranzacției vor fi șterse definitiv.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-purple-200 hover:bg-purple-50">
              Anulează
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDeal}
              className="bg-red-600 hover:bg-red-700"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal comision încasat la finalizare */}
      <Dialog open={showWonModal} onOpenChange={setShowWonModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tranzacție finalizată</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <PriceInput
              label="Comision încasat total (EUR)"
              value={parsePriceInput(commissionReceivedInput)}
              onChange={(v) => setCommissionReceivedInput(v > 0 ? String(v) : "")}
              placeholder="ex: 3.000"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWonModal(false)}>
              Anulează
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleConfirmWon}>
              Confirmă
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
