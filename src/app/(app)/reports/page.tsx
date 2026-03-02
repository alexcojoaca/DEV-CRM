import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="View analytics and insights about your business"
      />
      <EmptyState
        title="Reports coming soon"
        description="Analytics and reporting features will be available here."
        icon={<BarChart3 className="h-12 w-12" />}
      />
    </div>
  );
}
