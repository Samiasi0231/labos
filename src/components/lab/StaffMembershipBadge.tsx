import { Badge } from "@/components/ui/badge";
import type { StaffStatus } from "@/api/types/enums";

export function StaffMembershipBadge({ status }: { status: StaffStatus }) {
  if (status === "active")
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 h-5 border-success/40 text-success bg-success/5 font-medium"
      >
        Active
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge
        variant="outline"
        className="text-[10px] px-1.5 h-5 border-warning/40 text-warning bg-warning/5 font-medium"
      >
        Pending
      </Badge>
    );
  // inactive
  return (
    <Badge
      variant="outline"
      className="text-[10px] px-1.5 h-5 text-muted-foreground font-medium"
    >
      Inactive
    </Badge>
  );
}
