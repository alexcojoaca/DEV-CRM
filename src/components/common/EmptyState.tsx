import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, icon, className }: EmptyStateProps) {
  return (
    <Card className={cn("border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50/30 to-pink-50/20", className)}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        {icon && <div className="mb-4 text-purple-500">{icon}</div>}
        <h3 className="mb-2 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{title}</h3>
        {description && <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>}
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
