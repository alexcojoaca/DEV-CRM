"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Lead } from "@/features/leads/leadTypes";
import type { Client } from "@/features/clients/clientTypes";
import type { Deal } from "@/features/deals/dealTypes";
import {
  getNextBestActionForLead,
  getNextBestActionForClient,
  getNextBestActionForDeal,
} from "@/features/pipeline/nextBestActionRules";
import { Lightbulb } from "lucide-react";

type EntityType = "lead" | "client" | "deal";

interface NextBestActionCardProps {
  entityType: EntityType;
  entity: Lead | Client | Deal;
  onAction: (ctaId: string) => void;
  className?: string;
}

export function NextBestActionCard({
  entityType,
  entity,
  onAction,
  className,
}: NextBestActionCardProps) {
  const action =
    entityType === "lead"
      ? getNextBestActionForLead(entity as Lead)
      : entityType === "client"
        ? getNextBestActionForClient(entity as Client)
        : getNextBestActionForDeal(entity as Deal);

  return (
    <Card
      className={cn(
        "border-purple-200/60 bg-gradient-to-br from-amber-50/80 to-white shadow-sm",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{action.suggestion}</p>
        <Button
          size="sm"
          onClick={() => onAction(action.ctaId)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 sm:w-auto"
        >
          {action.ctaLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
