"use client";

import { cn } from "@/lib/utils";

export type PyramidTier = "lead" | "client" | "transaction";

const TIERS: { id: PyramidTier; label: string }[] = [
  { id: "lead", label: "Lead" },
  { id: "client", label: "Client" },
  { id: "transaction", label: "Tranzacție" },
];

const TIER_STYLES: Record<
  PyramidTier,
  { gradient: string; active: string; muted: string }
> = {
  lead: {
    gradient: "from-sky-500 to-cyan-500",
    active: "shadow-lg shadow-sky-500/40 ring-2 ring-sky-400/60",
    muted: "opacity-55",
  },
  client: {
    gradient: "from-purple-500 to-pink-500",
    active: "shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/60",
    muted: "opacity-55",
  },
  transaction: {
    gradient: "from-emerald-500 to-teal-500",
    active: "shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-400/60",
    muted: "opacity-55",
  },
};

interface PipelinePyramidProps {
  /** Nivelul activ: unde se află utilizatorul (pagina de lead / client / tranzacție) */
  activeTier: PyramidTier;
  className?: string;
}

/**
 * Piramidă din 3 bucăți colorate: Lead (sus) → Client (mijloc) → Tranzacție (jos).
 * Evidențiază nivelul curent cu gradient, umbră și inel.
 */
export function PipelinePyramid({ activeTier, className }: PipelinePyramidProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-purple-200/50 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-sm",
        className
      )}
    >
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Poziția în piramidă
      </p>
      <div className="flex flex-col items-center gap-0">
        {TIERS.map((tier, index) => {
          const isActive = tier.id === activeTier;
          const styles = TIER_STYLES[tier.id];
          const widthPercent = index === 0 ? 100 : index === 1 ? 72 : 44;
          return (
            <div
              key={tier.id}
              className="flex w-full justify-center"
              style={{ minHeight: "48px" }}
            >
              <div
                className={cn(
                  "flex items-center justify-center py-3 text-sm font-bold text-white transition-all duration-300",
                  `bg-gradient-to-r ${styles.gradient}`,
                  isActive ? styles.active : styles.muted,
                  index === 0 && "rounded-t-xl",
                  index === 1 && "rounded-none",
                  index === 2 && "rounded-b-xl"
                )}
                style={{ width: `${widthPercent}%`, minHeight: "48px" }}
              >
                {tier.label}
                {isActive && (
                  <span className="ml-2 inline-block size-2 rounded-full bg-white/90" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
