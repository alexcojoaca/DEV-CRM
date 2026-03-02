"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  type ProgressPyramidLevel,
  STAGE_GUIDANCE,
} from "./progressPyramidContent";
import { ChevronRight, Info } from "lucide-react";

const LEVEL_ORDER: ProgressPyramidLevel[] = ["deal", "client", "lead"];

const LEVEL_LABELS: Record<ProgressPyramidLevel, string> = {
  lead: "Lead",
  client: "Client",
  deal: "Tranzacție",
};

const LEVEL_STYLES: Record<
  ProgressPyramidLevel,
  { gradient: string; glow: string; ring: string }
> = {
  lead: {
    gradient: "from-sky-500 to-cyan-500",
    glow: "shadow-sky-500/35",
    ring: "ring-sky-400/50",
  },
  client: {
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-purple-500/35",
    ring: "ring-purple-400/50",
  },
  deal: {
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/35",
    ring: "ring-emerald-400/50",
  },
};

export interface ProgressPyramidProps {
  /** Nivelul curent al entității (lead / client / deal). */
  activeLevel: ProgressPyramidLevel;
  /** Procent progres către următoarea etapă (0–100). Opțional, afișat sub piramidă. */
  progressToNext?: number;
  /** Dacă entitatea a avansat deja la acest nivel (ex: lead transformat în client). Afișează nivelul ca atins și mesaj în popover. */
  advancedToLevel?: ProgressPyramidLevel;
  /** ID client creat la transformare (pentru link "Vezi clientul"). */
  convertedClientId?: string;
  className?: string;
}

/**
 * Progress Pyramid: 3 niveluri (Lead jos, Client mijloc, Deal sus).
 * Evidențiază nivelul curent, oferă ghidaj la hover/click.
 */
export function ProgressPyramid({
  activeLevel,
  progressToNext,
  advancedToLevel,
  convertedClientId,
  className,
}: ProgressPyramidProps) {
  const [openPopover, setOpenPopover] = useState<ProgressPyramidLevel | null>(
    null
  );

  const levelReached = (level: ProgressPyramidLevel) => level === advancedToLevel;

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col rounded-2xl border border-purple-200/50 bg-gradient-to-b from-white to-purple-50/20 p-4 shadow-sm",
        className
      )}
    >
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Progres în pipeline
      </p>

      <div className="flex flex-col items-center gap-0">
        {LEVEL_ORDER.map((level, index) => {
          const isActive = level === activeLevel;
          const isReached = levelReached(level);
          const isConvertedStage = level === "client" && advancedToLevel === "client" && convertedClientId;
          const styles = LEVEL_STYLES[level];
          const widthPercent = index === 0 ? 44 : index === 1 ? 72 : 100;
          const guidance = STAGE_GUIDANCE[level];

          return (
            <Popover
              key={level}
              open={openPopover === level}
              onOpenChange={(open) => setOpenPopover(open ? level : null)}
            >
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "flex w-full cursor-pointer justify-center transition-all duration-300 ease-out",
                    "hover:opacity-95",
                    !isActive && !isReached && "opacity-50 hover:opacity-70",
                    isReached && !isActive && "opacity-90"
                  )}
                  style={{ minHeight: "52px" }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-3 text-sm font-bold text-white transition-all duration-300",
                      `bg-gradient-to-r ${styles.gradient}`,
                      isActive && `shadow-lg ${styles.glow} ring-2 ${styles.ring}`,
                      index === 0 && "rounded-t-xl",
                      index === 1 && "rounded-none",
                      index === 2 && "rounded-b-xl"
                    )}
                    style={{ width: `${widthPercent}%`, minHeight: "52px" }}
                  >
                    {LEVEL_LABELS[level]}
                    {(isActive || isReached) && (
                      <span className="inline-block size-2 rounded-full bg-white/90" />
                    )}
                    <Info className="ml-1 h-3.5 w-3.5 opacity-90" />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent
                side="left"
                align="center"
                sideOffset={8}
                className="w-80 border-purple-200/60 bg-white p-0 shadow-xl"
              >
                {isConvertedStage ? (
                  <>
                    <div className="border-b border-purple-100 bg-gradient-to-r from-emerald-50 to-green-50/50 px-4 py-3">
                      <h4 className="font-semibold text-foreground">
                        Acest lead este la stadiul de Client
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Lead-ul a fost transformat în client. Poți deschide cardul clientului pentru vizionări și tranzacții.
                      </p>
                    </div>
                    <div className="p-4">
                      <Link
                        href={`/clients?id=${convertedClientId}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
                      >
                        Vezi clientul în Clienți
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50/50 px-4 py-3">
                      <h4 className="font-semibold text-foreground">
                        {guidance.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {guidance.description}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Acțiuni pentru avansare
                      </p>
                      <ul className="space-y-1.5">
                        {guidance.actions.map((action, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-foreground"
                          >
                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 rounded-lg border border-purple-100 bg-purple-50/50 px-3 py-2 text-xs text-purple-800">
                        {guidance.nextStageHint}
                      </p>
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {progressToNext != null && (
        <div className="mt-4 space-y-1.5">
          <p className="text-center text-xs font-medium text-muted-foreground">
            Progres către următoarea etapă
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progressToNext))}%` }}
            />
          </div>
          <p className="text-center text-xs font-semibold text-foreground">
            {Math.round(progressToNext)}%
          </p>
        </div>
      )}
    </div>
  );
}
