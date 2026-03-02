"use client";

import { cn } from "@/lib/utils";
import type { Client } from "@/features/clients/clientTypes";
import { STATUS_LABELS, FOLLOW_UP_DAYS, MAX_FOLLOW_UPS } from "@/features/clients/clientTypes";
import { MessageCircle, Phone, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Formatează telefon pentru WhatsApp: prefix +40 pentru România dacă lipsește */
export function phoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("40") && digits.length >= 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length >= 10) return "+4" + digits;
  if (digits.length >= 9) return "+40" + digits.replace(/^0/, "");
  return "+40" + digits;
}

const statusColors: Record<Client["status"], string> = {
  qualified: "bg-emerald-500/15 text-emerald-700",
  potential: "bg-amber-500/15 text-amber-700",
  disqualified: "bg-slate-500/15 text-slate-600",
};

const FOLLOW_UP_MS = FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000;

interface ClientListItemProps {
  client: Client;
  isActive?: boolean;
  onClick?: () => void;
  onCall?: (phone: string, clientId: string) => void;
  onWhatsApp?: (phone: string, clientId: string) => void;
  className?: string;
}

export function ClientListItem({
  client,
  isActive,
  onClick,
  onCall,
  onWhatsApp,
  className,
}: ClientListItemProps) {
  const wappPhone = phoneForWhatsApp(client.phone);
  const needsFollowUp =
    client.lastContactedAt &&
    client.status !== "disqualified" &&
    (client.followUpCount ?? 0) < MAX_FOLLOW_UPS &&
    Date.now() - new Date(client.lastContactedAt).getTime() >= FOLLOW_UP_MS;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick?.()}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-all",
        isActive
          ? "border-purple-400 bg-purple-50/80 shadow-sm"
          : "border-purple-100 bg-white hover:border-purple-200 hover:bg-purple-50/40",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">{client.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {client.phone}
          </p>
          {client.zone && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {client.county ? `${client.zone}, ${client.county}` : client.zone}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                statusColors[client.status]
              )}
            >
              {STATUS_LABELS[client.status]}
            </span>
            {needsFollowUp && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                <Bell className="h-3 w-3" />
                Follow-up
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {onCall && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onCall(client.phone, client.id);
              }}
              title="Sună"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}
          {onWhatsApp && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onWhatsApp(wappPhone, client.id);
              }}
              title="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
