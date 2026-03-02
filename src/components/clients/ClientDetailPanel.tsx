"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Bell, CheckCircle, Trash2, Copy } from "lucide-react";
import type { Client, ClientPropertyType } from "@/features/clients/clientTypes";
import {
  TRANSACTION_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
  STATUS_LABELS,
  SOURCE_LABELS,
  FOLLOW_UP_DAYS,
} from "@/features/clients/clientTypes";
import { formatPriceDisplay } from "@/components/properties/PriceInput";
import { phoneForWhatsApp } from "@/components/clients/ClientListItem";
import { cn } from "@/lib/utils";

const FOLLOW_UP_BASE =
  "Revin cu un mesaj scurt să verific dacă mai prezintă interes";

const DAY_MS = 24 * 60 * 60 * 1000;

function propertyNounByType(t: ClientPropertyType): string {
  if (t === "house") return "casa";
  if (t === "land") return "terenul";
  if (t === "office") return "biroul";
  if (t === "commercial") return "spațiul comercial";
  if (t === "industrial") return "spațiul industrial";
  return "apartamentul";
}

/** Salut în funcție de oră: până 10 Bună dimineața, 10–18 Bună ziua, 18–00 Bună seara */
function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 10) return "Bună dimineața,";
  if (h < 18) return "Bună ziua,";
  return "Bună seara,";
}

function buildFollowUpMessage(client: Client, customText?: string): string {
  if (customText?.trim()) return customText.trim();
  const greeting = greetingByHour();
  const prop = propertyNounByType(client.propertyType);
  return `${greeting}\n${FOLLOW_UP_BASE} ${prop}.\nMulțumesc!`;
}

function getWhatsAppUrl(phone: string, text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${phone.replace(/^\+/, "").replace(/\D/g, "")}?text=${encoded}`;
}

function buildRequestSummary(client: Client): string {
  const parts: string[] = [];

  const tranzactie = TRANSACTION_TYPE_LABELS[client.transactionType];
  const tipImobil = PROPERTY_TYPE_LABELS[client.propertyType];
  let headline = `Cerere ${tranzactie.toLowerCase()} ${tipImobil.toLowerCase()}`;

  if (
    client.propertyType === "land" ||
    client.propertyType === "commercial" ||
    client.propertyType === "industrial"
  ) {
    if (client.surfaceMin != null && client.surfaceMax != null) {
      headline += `, suprafață ${client.surfaceMin}-${client.surfaceMax} mp`;
    } else if (client.surfaceMin != null) {
      headline += `, suprafață minimă ${client.surfaceMin} mp`;
    } else if (client.surfaceMax != null) {
      headline += `, suprafață maximă ${client.surfaceMax} mp`;
    }
  } else if (client.roomsMin != null || client.roomsMax != null) {
    if (client.roomsMin != null && client.roomsMax != null) {
      if (client.roomsMin === client.roomsMax) {
        headline += `, ${client.roomsMin} camere`;
      } else {
        headline += `, ${client.roomsMin}-${client.roomsMax} camere`;
      }
    } else if (client.roomsMin != null) {
      headline += `, minim ${client.roomsMin} camere`;
    } else if (client.roomsMax != null) {
      headline += `, maxim ${client.roomsMax} camere`;
    }
  }
  parts.push(headline);

  const locBits = [client.zone, client.county].filter(Boolean);
  if (locBits.length) {
    parts.push(`Zona: ${locBits.join(", ")}`);
  }

  if (
    (client.budgetMin != null && client.budgetMin > 0) ||
    (client.budgetMax != null && client.budgetMax > 0)
  ) {
    let buget = "Buget: ";
    if (
      client.budgetMin != null &&
      client.budgetMin > 0 &&
      client.budgetMax != null &&
      client.budgetMax > 0
    ) {
      buget += `${formatPriceDisplay(client.budgetMin)} - ${formatPriceDisplay(
        client.budgetMax
      )} EUR`;
    } else if (client.budgetMin != null && client.budgetMin > 0) {
      buget += `minim ${formatPriceDisplay(client.budgetMin)} EUR`;
    } else if (client.budgetMax != null && client.budgetMax > 0) {
      buget += `maxim ${formatPriceDisplay(client.budgetMax)} EUR`;
    }
    parts.push(buget);
  }

  if (client.constructionYearMin != null) {
    parts.push(`An minim construcție: ${client.constructionYearMin}`);
  }

  return parts.join("\n");
}

interface ClientDetailPanelProps {
  client: Client;
  /** Dacă ultima contactare e de >= 3 zile, afișăm notificare follow-up */
  showFollowUpNotification?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onContactedNow: () => void;
  onCall: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
  className?: string;
}

export function ClientDetailPanel({
  client,
  showFollowUpNotification,
  onEdit,
  onDelete,
  onContactedNow,
  onCall,
  onWhatsApp,
  className,
}: ClientDetailPanelProps) {
  const wappPhone = phoneForWhatsApp(client.phone);
  const isDisqualified = client.status === "disqualified";
  const showFollowUp = !isDisqualified;
  const hasLastContact = !!client.lastContactedAt;
  const lastContactDate = client.lastContactedAt ? new Date(client.lastContactedAt) : null;
  const nextFollowUpAt =
    lastContactDate != null
      ? new Date(lastContactDate.getTime() + FOLLOW_UP_DAYS * DAY_MS)
      : null;
  const remainingMs =
    nextFollowUpAt != null ? nextFollowUpAt.getTime() - Date.now() : null;
  const remainingDays =
    remainingMs != null ? Math.ceil(remainingMs / DAY_MS) : null;
  const followUpStatusLabel =
    hasLastContact && remainingDays != null
      ? remainingDays > 0
        ? `Follow-up în ${remainingDays} zile`
        : remainingDays === 0
          ? "Fă follow-up azi"
          : `Follow-up întârziat cu ${Math.abs(remainingDays)} zile`
      : null;

  const handleCopyRequest = () => {
    const text = buildRequestSummary(client);
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  const handleFollowUp = (customText?: string) => {
    const message = buildFollowUpMessage(client, customText);
    window.open(getWhatsAppUrl(wappPhone, message), "_blank", "noopener,noreferrer");
    onContactedNow();
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground break-words">
              {client.name}
            </h2>
            <p className="text-sm text-muted-foreground break-words">
              {client.phone}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onCall(client.phone)}
              className="h-9 w-9 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              title="Sună"
            >
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onWhatsApp(wappPhone)}
              className="h-9 w-9 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20"
              title="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyRequest}
            className="w-full sm:w-auto justify-center"
          >
            <Copy className="h-4 w-4 mr-1.5" />
            Copiază cererea
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="w-full sm:w-auto justify-center"
          >
            Editează
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="w-full sm:w-auto justify-center"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Șterge
          </Button>
        </div>
      </div>

      {showFollowUp && (
        <div className="space-y-3 pt-2 md:rounded-xl md:border md:border-purple-200 md:bg-purple-50/50 md:p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Follow-up</p>
            {followUpStatusLabel && (
              <p className="text-xs text-muted-foreground">
                {followUpStatusLabel}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto justify-center"
              onClick={() => handleFollowUp()}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Mesaj prestabilit WhatsApp
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onContactedNow}
              className="w-full sm:w-auto justify-center"
            >
              <CheckCircle className="h-4 w-4 mr-1.5" />
              L-am contactat acum
            </Button>
          </div>
        </div>
      )}

      {showFollowUp && showFollowUpNotification && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm font-medium text-amber-800">
            Follow-up întârziat – au trecut cel puțin {FOLLOW_UP_DAYS} zile de la ultima contactare.
          </p>
        </div>
      )}

      <dl className="grid gap-3 text-sm">
        <div className="border-b border-border pb-2 last:border-b-0">
          <dt className="text-muted-foreground">Tip tranzacție</dt>
          <dd className="font-medium">{TRANSACTION_TYPE_LABELS[client.transactionType]}</dd>
        </div>
        <div className="border-b border-border pb-2 last:border-b-0">
          <dt className="text-muted-foreground">Tip imobil</dt>
          <dd className="font-medium">{PROPERTY_TYPE_LABELS[client.propertyType]}</dd>
        </div>
        {(client.county || client.zone) && (
          <div className="border-b border-border pb-2 last:border-b-0">
            <dt className="text-muted-foreground">Locație dorită</dt>
            <dd className="font-medium">
              {[client.zone, client.county].filter(Boolean).join(", ")}
            </dd>
          </div>
        )}
        {client.propertyType === "land" || client.propertyType === "industrial"
          ? (client.surfaceMin != null || client.surfaceMax != null) && (
              <div className="border-b border-border pb-2 last:border-b-0">
                <dt className="text-muted-foreground">Suprafață (mp)</dt>
                <dd className="font-medium">
                  {client.surfaceMin != null && client.surfaceMax != null
                    ? `${client.surfaceMin} – ${client.surfaceMax}`
                    : client.surfaceMin != null
                      ? `min ${client.surfaceMin}`
                      : `max ${client.surfaceMax}`}
                </dd>
              </div>
            )
          : (client.roomsMin != null || client.roomsMax != null) && (
              <div className="border-b border-border pb-2 last:border-b-0">
                <dt className="text-muted-foreground">Nr. camere</dt>
                <dd className="font-medium">
                  {client.roomsMin != null && client.roomsMax != null
                    ? `${client.roomsMin} – ${client.roomsMax}`
                    : client.roomsMin != null
                      ? `min ${client.roomsMin}`
                      : `max ${client.roomsMax}`}
                </dd>
              </div>
            )}
        {(client.budgetMin != null && client.budgetMin > 0) ||
        (client.budgetMax != null && client.budgetMax > 0) ? (
          <div className="border-b border-border pb-2 last:border-b-0">
            <dt className="text-muted-foreground">Buget (EUR)</dt>
            <dd className="font-medium">
              {client.budgetMin != null &&
              client.budgetMin > 0 &&
              client.budgetMax != null &&
              client.budgetMax > 0
                ? `${formatPriceDisplay(client.budgetMin)} – ${formatPriceDisplay(client.budgetMax)}`
                : client.budgetMin != null && client.budgetMin > 0
                  ? `min ${formatPriceDisplay(client.budgetMin)}`
                  : `max ${formatPriceDisplay(client.budgetMax!)}`}
            </dd>
          </div>
        ) : null}
        {client.constructionYearMin != null && (
          <div className="border-b border-border pb-2 last:border-b-0">
            <dt className="text-muted-foreground">An minim construcție</dt>
            <dd className="font-medium">{client.constructionYearMin}</dd>
          </div>
        )}
        <div className="border-b border-border pb-2 last:border-b-0">
          <dt className="text-muted-foreground">Stare</dt>
          <dd className="font-medium">{STATUS_LABELS[client.status]}</dd>
        </div>
        <div className="border-b border-border pb-2 last:border-b-0">
          <dt className="text-muted-foreground">Sursă</dt>
          <dd className="font-medium">{SOURCE_LABELS[client.source]}</dd>
        </div>
        {client.notes && (
          <div className="border-b border-border pb-2 last:border-b-0">
            <dt className="text-muted-foreground">Note</dt>
            <dd className="font-medium whitespace-pre-wrap">{client.notes}</dd>
          </div>
        )}
        <div className="border-b border-border pb-2 last:border-b-0">
          <dt className="text-muted-foreground">Adăugat</dt>
          <dd className="font-medium">
            {new Date(client.createdAt).toLocaleString("ro-RO")}
          </dd>
        </div>
        {client.lastContactedAt && (
          <div className="border-b border-border pb-2 last:border-b-0">
            <dt className="text-muted-foreground">Ultima contactare</dt>
            <dd className="font-medium">
              {new Date(client.lastContactedAt).toLocaleString("ro-RO")}
            </dd>
          </div>
        )}
        {hasLastContact && remainingDays != null && (
          <div className="border-b border-border pb-2 last:border-b-0">
            <dt className="text-muted-foreground">Follow-up</dt>
            <dd className="font-medium">
              {followUpStatusLabel}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
