import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/features/dashboard/dashboardTypes";

export interface PipelineSnapshotProps {
  stages: PipelineStage[];
  className?: string;
}

export function PipelineSnapshot({ stages, className }: PipelineSnapshotProps) {
  return (
    <div className={cn("space-y-5", className)}>
      {stages.map((stage) => (
        <div key={stage.id} className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className={cn("h-3 w-3 rounded-full shadow-sm", stage.color)} />
              <span className="font-semibold text-foreground">{stage.name}</span>
            </div>
            <span className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 text-sm font-bold text-purple-700">
              {stage.count}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-purple-100/50 to-pink-100/50 shadow-inner">
            <div
              className={cn("h-full transition-all duration-500 shadow-sm", stage.color)}
              style={{ width: `${stage.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
