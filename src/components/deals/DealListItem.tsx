"use client";

import { cn } from "@/lib/utils";
import type { Deal } from "@/features/deals/dealTypes";
import { DEAL_STATUS_LABELS, DEAL_TRANSACTION_TYPE_LABELS } from "@/features/deals/dealTypes";

const statusColors: Record<Deal["status"], string> = {
  in_progress: "bg-blue-500/15 text-blue-700",
  negotiation: "bg-amber-500/15 text-amber-700",
  won: "bg-emerald-500/15 text-emerald-700",
  lost: "bg-slate-500/15 text-slate-600",
};

interface DealListItemProps {
  deal: Deal;
  clientName?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function DealListItem({
  deal,
  clientName,
  isActive,
  onClick,
  className,
}: DealListItemProps) {
  const displayName = clientName || deal.clientNameFree || deal.title || "Tranzacție";

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
          <p className="font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {DEAL_TRANSACTION_TYPE_LABELS[deal.transactionType]}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                statusColors[deal.status]
              )}
            >
              {DEAL_STATUS_LABELS[deal.status]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
