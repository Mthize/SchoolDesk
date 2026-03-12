import { FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildEmptyStateMessage } from "@/lib/reporting";

interface ReportCardEmptyStateProps {
  onRefresh: () => void;
  contextLabel?: string;
}

export const ReportCardEmptyState = ({
  onRefresh,
  contextLabel,
}: ReportCardEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
    <FileWarning className="h-8 w-8 text-muted-foreground" />
    <div>
      <p className="text-sm font-medium">No report card available yet</p>
      <p className="text-xs text-muted-foreground">
        {buildEmptyStateMessage(contextLabel)}
      </p>
    </div>
    <Button variant="outline" size="sm" onClick={onRefresh}>
      Refresh
    </Button>
  </div>
);
