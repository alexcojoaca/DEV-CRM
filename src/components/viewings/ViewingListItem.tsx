"use client";

import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Viewing } from "@/features/viewings/viewingTypes";
import { VIEWING_STATUS_LABELS } from "@/features/viewings/viewingTypes";
import type { Property } from "@/features/properties/propertyTypes";
import type { Client } from "@/features/clients/clientTypes";
import { Calendar, MapPin, User } from "lucide-react";

const statusColors: Record<Viewing["status"], string> = {
  scheduled: "bg-purple-500/15 text-purple-700",
  completed: "bg-emerald-500/15 text-emerald-700",
  cancelled: "bg-slate-500/15 text-slate-600",
  no_show: "bg-amber-500/15 text-amber-700",
};

interface ViewingListItemProps {
  viewing: Viewing;
  property: Property | null;
  client: Client | null;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ViewingListItem({
  viewing,
  property,
  client,
  isActive,
  onClick,
  className,
}: ViewingListItemProps) {
  const scheduled = viewing.scheduledAt ? new Date(viewing.scheduledAt) : null;
  const propertyLabel = property?.title ?? viewing.propertyNameFree ?? "—";
  const clientLabel = client?.name ?? viewing.clientNameFree ?? "—";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-all",
        isActive
          ? "border-purple-400 bg-purple-50/80 shadow-sm"
          : "border-purple-100 bg-white hover:border-purple-200 hover:bg-purple-50/40",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
          <Calendar className="h-5 w-5 text-purple-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground truncate">
            {propertyLabel}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            {clientLabel}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-foreground">
              {scheduled ? format(scheduled, "d MMM yyyy, HH:mm", { locale: ro }) : "Fără dată"}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                statusColors[viewing.status]
              )}
            >
              {VIEWING_STATUS_LABELS[viewing.status]}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
