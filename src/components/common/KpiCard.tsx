import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface KpiCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({ label, value, change, icon, className }: KpiCardProps) {
  return (
    <Card className={cn("border-purple-200/50 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300", className)}>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{value}</p>
            </div>
            {icon && <div className="text-purple-500">{icon}</div>}
          </div>

          {change && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {change.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 text-xs font-semibold",
                    change.isPositive
                      ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-sm"
                      : "border-red-300 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 shadow-sm"
                  )}
                >
                  {change.isPositive ? "+" : ""}
                  {change.value}%
                </Badge>
                <span className="text-xs text-muted-foreground">vs luna trecută</span>
              </div>
            </div>
          )}

          {/* Sparkline placeholder - Modern gradient */}
          <div className="h-10 w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-100/50 to-pink-100/50 p-1">
            <div className="h-full w-full rounded bg-gradient-to-r from-purple-500/20 via-pink-500/30 to-purple-500/20 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
