import { cn } from "@/lib/utils";

export interface SkeletonBlockProps {
  className?: string;
  height?: string;
  width?: string;
}

export function SkeletonBlock({ className, height = "h-4", width = "w-full" }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        height,
        width,
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        <SkeletonBlock height="h-4" width="w-1/3" />
        <SkeletonBlock height="h-8" width="w-1/2" />
        <SkeletonBlock height="h-3" width="w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonKpiCard() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <SkeletonBlock height="h-4" width="w-1/2" />
            <SkeletonBlock height="h-8" width="w-1/3" />
          </div>
          <SkeletonBlock height="h-6" width="w-6" className="rounded-full" />
        </div>
        <SkeletonBlock height="h-8" width="w-full" className="rounded" />
      </div>
    </div>
  );
}

export function SkeletonTaskItem() {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <SkeletonBlock height="h-4" width="w-4" className="rounded-sm" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock height="h-4" width="w-3/4" />
        <SkeletonBlock height="h-3" width="w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonActivityItem() {
  return (
    <div className="flex gap-2 py-2">
      <SkeletonBlock height="h-8" width="w-8" className="rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock height="h-4" width="w-1/3" />
        <SkeletonBlock height="h-4" width="w-2/3" />
        <SkeletonBlock height="h-3" width="w-1/2" />
      </div>
    </div>
  );
}
