export interface KpiData {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export interface ActivityItem {
  id: string;
  type: "lead" | "deal" | "viewing" | "task" | "document";
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  priority: "low" | "medium" | "high";
  relatedTo?: {
    type: "lead" | "deal" | "property";
    id: string;
    name: string;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href: string;
  variant?: "default" | "secondary" | "outline";
}

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  color: string;
  percentage: number;
}
