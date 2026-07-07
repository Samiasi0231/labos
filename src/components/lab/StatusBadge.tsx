import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TestStatus, ResultStatus } from "@/data/mockData";

type Status = TestStatus | ResultStatus | 'Active' | 'Inactive' | 'On Leave';

const statusConfig: Record<Status, { label: string; className: string }> = {
  'Pending': { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/30' },
  'In Progress': { label: 'In Progress', className: 'bg-info/15 text-info border-info/30' },
  'Completed': { label: 'Completed', className: 'bg-primary/15 text-primary border-primary/30' },
  'Approved': { label: 'Approved', className: 'bg-success/15 text-success border-success/30' },
  'Submitted': { label: 'Submitted', className: 'bg-info/15 text-info border-info/30' },
  'Returned': { label: 'Returned', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  'Released': { label: 'Released', className: 'bg-success/15 text-success border-success/30' },
  'Active': { label: 'Active', className: 'bg-success/15 text-success border-success/30' },
  'Inactive': { label: 'Inactive', className: 'bg-muted text-muted-foreground border-border' },
  'On Leave': { label: 'On Leave', className: 'bg-warning/15 text-warning border-warning/30' },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium border', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
