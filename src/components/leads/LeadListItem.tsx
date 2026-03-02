"use client";

import { cn } from "@/lib/utils";
import type { Lead } from "@/features/leads/leadTypes";

interface LeadListItemProps {
  lead: Lead;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function LeadListItem({ lead, isActive, onClick, className }: LeadListItemProps) {
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
      <div className="min-w-0">
        <p className="font-semibold text-foreground truncate">{lead.name || "Lead fără nume"}</p>
        {lead.phone && (
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{lead.phone}</p>
        )}
        {lead.location && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{lead.location}</p>
        )}
      </div>
    </div>
  );
}

