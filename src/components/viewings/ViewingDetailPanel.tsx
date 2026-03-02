"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ViewingForm } from "@/components/viewings/ViewingForm";
import type { Viewing, ViewingFormData } from "@/features/viewings/viewingTypes";
import { VIEWING_STATUS_LABELS, VIEWING_TYPE_LABELS } from "@/features/viewings/viewingTypes";
import type { Property } from "@/features/properties/propertyTypes";
import { getPropertyTipImobilLabel } from "@/features/properties/propertyTypes";
import type { Client } from "@/features/clients/clientTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { openCall, openWhatsApp } from "@/features/clients/clientContact";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Calendar, Edit, MapPin, ExternalLink, Trash2, FileText, CheckCircle2, CalendarClock, XCircle, Phone, MessageCircle, Copy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors: Record<Viewing["status"], string> = {
  scheduled: "bg-purple-500/15 text-purple-700",
  completed: "bg-emerald-500/15 text-emerald-700",
  cancelled: "bg-slate-500/15 text-slate-600",
  no_show: "bg-amber-500/15 text-amber-700",
};

interface ViewingDetailPanelProps {
  viewing: Viewing;
  property: Property | null;
  client: Client | null;
  properties: Property[];
  clients: Client[];
  onUpdate: (id: string, data: ViewingFormData) => void;
  onDelete?: (id: string) => void;
  onBack?: () => void;
  className?: string;
}

export function ViewingDetailPanel({
  viewing,
  property,
  client,
  properties,
  clients,
  onUpdate,
  onDelete,
  onBack,
  className,
}: ViewingDetailPanelProps) {
  const [editing, setEditing] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>(() => {
    const d = viewing.scheduledAt ? new Date(viewing.scheduledAt) : new Date();
    d.setDate(d.getDate() + 7);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [formData, setFormData] = useState<ViewingFormData>({
    propertyId: viewing.propertyId,
    clientId: viewing.clientId,
    propertyNameFree: viewing.propertyNameFree,
    clientNameFree: viewing.clientNameFree,
    clientPhoneFree: viewing.clientPhoneFree,
    viewingType: viewing.viewingType,
    address: viewing.address,
    ownerName: viewing.ownerName,
    ownerPhone: viewing.ownerPhone,
    scheduledAt: viewing.scheduledAt,
    status: viewing.status,
    notes: viewing.notes,
    agentId: viewing.agentId,
  });
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onUpdate(viewing.id, formData);
    setEditing(false);
  };

  const handleMarkCompleted = () => {
    onUpdate(viewing.id, { ...formData, status: "completed" });
    setFormData((prev) => ({ ...prev, status: "completed" }));
  };

  const handleMarkCancelled = () => {
    onUpdate(viewing.id, { ...formData, status: "cancelled" });
    setFormData((prev) => ({ ...prev, status: "cancelled" }));
  };

  const handleRescheduleSave = () => {
    const newDate = new Date(rescheduleDate);
    onUpdate(viewing.id, { ...formData, scheduledAt: newDate, status: "scheduled" });
    setFormData((prev) => ({ ...prev, scheduledAt: newDate, status: "scheduled" }));
    setRescheduleOpen(false);
  };

  const scheduled = viewing.scheduledAt ? new Date(viewing.scheduledAt) : null;
  const displayTitle =
    property?.title ?? viewing.propertyNameFree ?? "Vizionare";
  const clientEmail = client?.email ?? "";
  const mailtoDocument = clientEmail
    ? `mailto:${clientEmail}?subject=Documente vizionare&body=Bună ziua,%0D%0A%0D%0AVă trimit documentele solicitate pentru vizionare.`
    : "mailto:?subject=Documente vizionare";

  const displayAddress =
    viewing.address ||
    (property ? [property.street, property.number, property.zone, property.county].filter(Boolean).join(", ") : "");

  const ownerName = viewing.ownerName || property?.ownerName || "";
  const ownerPhone = viewing.ownerPhone || property?.ownerPhone || "";
  const clientName = client?.name ?? viewing.clientNameFree ?? "";
  const clientPhone = client?.phone ?? viewing.clientPhoneFree ?? "";

  const fisaQuery = (() => {
    const params = new URLSearchParams();
    if (viewing.scheduledAt) params.set("scheduledAt", new Date(viewing.scheduledAt).toISOString());
    if (property) params.set("tipImobil", getPropertyTipImobilLabel(property));
    const q = params.toString();
    return q ? `?${q}` : "";
  })();

  const confirmMessage =
    scheduled && displayAddress
      ? `Bună ziua, vă confirm vizionarea în data de ${format(scheduled, "d MMMM yyyy", { locale: ro })} la ora ${format(scheduled, "HH:mm", { locale: ro })}, la adresa ${displayAddress}. Vă aștept.`
      : "Bună ziua, vă confirm vizionarea. Vă aștept.";

  const copyText = [
    "Vizionare",
    scheduled ? `la data de ${format(scheduled, "d MMM yyyy", { locale: ro })}, ora ${format(scheduled, "HH:mm", { locale: ro })}` : "",
    displayAddress ? `la adresa ${displayAddress}` : "",
    (displayTitle && displayTitle !== "Vizionare") ? `Proprietate: ${displayTitle}` : "",
    ownerPhone ? `Tel proprietar: ${ownerPhone}` : "",
    clientName ? `Client: ${clientName}` : "",
    clientPhone ? `Tel client: ${clientPhone}` : "",
  ]
    .filter(Boolean)
    .join(". ");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex shrink-0 items-center gap-2 border-b border-purple-100 bg-white/80 px-3 py-2">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 lg:size-auto lg:px-3"
          >
            <ArrowLeft className="h-5 w-5 lg:mr-1.5" />
            <span className="hidden lg:inline">Înapoi la listă</span>
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-foreground">
            {displayTitle}
          </h2>
          <p className="text-xs text-muted-foreground">
            {scheduled ? format(scheduled, "d MMM yyyy, HH:mm", { locale: ro }) : "Fără dată"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {editing ? (
          <ViewingForm
            data={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            onCancel={() => setEditing(false)}
            submitLabel="Salvează modificările"
            properties={properties}
            clients={clients}
          />
        ) : (
          <div className="space-y-4">
            <Card className="border-purple-200/50 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Detalii
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="border-purple-200"
                    >
                      <Edit className="mr-1.5 h-4 w-4" />
                      Editează
                    </Button>
                    {onDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(viewing.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduled && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-purple-500 shrink-0" />
                    <span className="font-medium text-foreground">
                      {format(scheduled, "EEEE, d MMMM yyyy, HH:mm", { locale: ro })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      statusColors[viewing.status]
                    )}
                  >
                    {VIEWING_STATUS_LABELS[viewing.status]}
                  </span>
                  {viewing.viewingType && (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-slate-500/15 text-slate-700">
                      {VIEWING_TYPE_LABELS[viewing.viewingType]}
                    </span>
                  )}
                </div>

                {displayAddress && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                    <span className="text-foreground">{displayAddress}</span>
                  </div>
                )}

                {(property || viewing.propertyNameFree) && (
                  <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Proprietate</p>
                    <p className="font-medium text-foreground">
                      {property ? property.title : viewing.propertyNameFree}
                    </p>
                    {property?.zone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {property.zone}, {property.county}
                      </p>
                    )}
                    {property && (
                      <Link
                        href={`/properties?id=${property.id}`}
                        className="inline-flex items-center gap-1 mt-2 text-sm text-purple-600 hover:underline"
                      >
                        Vezi proprietatea
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                )}

                {(ownerName || ownerPhone) && (
                  <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Proprietar</p>
                    <p className="font-medium text-foreground">{ownerName || "—"}</p>
                    {ownerPhone && (
                      <p className="text-sm text-muted-foreground mt-0.5">Tel: {ownerPhone}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      {ownerPhone && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openCall(ownerPhone)}
                            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          >
                            <Phone className="mr-1.5 h-4 w-4" />
                            Sună
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openWhatsApp(ownerPhone, confirmMessage)}
                            className="border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
                          >
                            <MessageCircle className="mr-1.5 h-4 w-4" />
                            WhatsApp confirmare
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {(client || viewing.clientNameFree) && (
                  <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Client</p>
                    <p className="font-medium text-foreground">
                      {client ? client.name : viewing.clientNameFree}
                    </p>
                    {client?.phone && (
                      <p className="text-sm text-muted-foreground mt-0.5">Tel: {client.phone}</p>
                    )}
                    {client?.email && (
                      <p className="text-sm text-muted-foreground">Email: {client.email}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {client && (
                        <Link
                          href={`/clients?id=${client.id}`}
                          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline"
                        >
                          Vezi clientul
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      {clientPhone && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openCall(clientPhone)}
                          className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          <Phone className="mr-1.5 h-4 w-4" />
                          Sună
                        </Button>
                      )}
                      {clientPhone && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openWhatsApp(clientPhone, confirmMessage)}
                          className="border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
                        >
                          <MessageCircle className="mr-1.5 h-4 w-4" />
                          WhatsApp confirmare
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-purple-200"
                  >
                    <Copy className="mr-1.5 h-4 w-4" />
                    {copied ? "Copiat!" : "Copiază rezumat"}
                  </Button>
                </div>

                {/* Acțiuni rapide: Am făcut-o / Amânată / Anulată */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMarkCompleted}
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Am făcut-o
                  </Button>
                  {rescheduleOpen ? (
                    <div className="w-full rounded-lg border border-purple-200 bg-purple-50/30 p-3 space-y-2">
                      <Label className="text-xs">Nouă dată și oră</Label>
                      <Input
                        type="datetime-local"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="border-purple-200"
                      />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={handleRescheduleSave} className="bg-purple-600">
                          Salvează amânare
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setRescheduleOpen(false)}>
                          Anulează
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRescheduleOpen(true)}
                      className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    >
                      <CalendarClock className="mr-1.5 h-4 w-4" />
                      Amânată
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMarkCancelled}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Anulată
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {viewing.viewingType === "sale" ? (
                    <Button variant="outline" size="sm" className="border-purple-200" asChild>
                      <Link href={`/documents/fisa-vizionare-vanzare${fisaQuery}`}>
                        <FileText className="mr-1.5 h-4 w-4" />
                        Trimite document (vânzare)
                      </Link>
                    </Button>
                  ) : viewing.viewingType === "rent" ? (
                    <Button variant="outline" size="sm" className="border-purple-200" asChild>
                      <Link href={`/documents/fisa-vizionare-inchiriere${fisaQuery}`}>
                        <FileText className="mr-1.5 h-4 w-4" />
                        Trimite document (închiriere)
                      </Link>
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-purple-200">
                          <FileText className="mr-1.5 h-4 w-4" />
                          Trimite document
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <Link href={`/documents/fisa-vizionare-vanzare${fisaQuery}`}>
                            Fișă vizionare vânzare
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/documents/fisa-vizionare-inchiriere${fisaQuery}`}>
                            Fișă vizionare închiriere
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {viewing.notes && (
                  <div className="rounded-lg border border-purple-100 bg-purple-50/30 p-3">
                    <p className="text-sm font-medium text-foreground">Note</p>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                      {viewing.notes}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground pt-2">
                  Actualizat: {format(new Date(viewing.updatedAt), "d MMM yyyy, HH:mm", { locale: ro })}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
