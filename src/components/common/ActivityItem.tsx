import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ActivityItem as ActivityItemType } from "@/features/dashboard/dashboardTypes";

interface ActivityItemProps {
  activity: ActivityItemType;
  className?: string;
}

const activityTypeConfig = {
  lead: {
    color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
    label: "Lead",
  },
  deal: {
    color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    label: "Tranzacție",
  },
  viewing: {
    color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    label: "Vizionare",
  },
  task: {
    color: "bg-gradient-to-r from-orange-500 to-amber-500 text-white",
    label: "Sarcină",
  },
  document: {
    color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
    label: "Document",
  },
};

export function ActivityItem({ activity, className }: ActivityItemProps) {
  const config = activityTypeConfig[activity.type];
  const initials = activity.user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className={cn("flex gap-3 rounded-xl border border-purple-100/50 bg-gradient-to-r from-white to-purple-50/20 p-3 transition-all hover:shadow-md hover:shadow-purple-500/10", className)}>
      <Avatar className="h-10 w-10 ring-2 ring-purple-200">
        <AvatarImage src={activity.user?.avatar} />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-semibold text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm", config.color)}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: ro })}
          </span>
        </div>
        <p className="text-sm font-semibold text-foreground">{activity.title}</p>
        <p className="text-sm text-muted-foreground">{activity.description}</p>
      </div>
    </div>
  );
}
