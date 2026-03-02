import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface QuickActionTileProps {
  label: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function QuickActionTile({
  label,
  href,
  icon,
  variant = "outline",
  className,
}: QuickActionTileProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "h-auto flex-col gap-3 p-5 border-2 border-purple-200/50 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 hover:from-purple-100/50 hover:to-pink-100/50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300",
        className
      )}
      asChild
    >
      <Link href={href}>
        {icon && <div className="text-purple-600">{icon}</div>}
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </Link>
    </Button>
  );
}
