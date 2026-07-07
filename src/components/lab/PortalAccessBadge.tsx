import { Badge } from "@/components/ui/badge";
import type { PortalAccess } from "@/data/mockData";

export function PortalAccessBadge({ access }: { access: PortalAccess }) {
  if (access === "active")
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-success/40 text-success bg-success/5 font-medium whitespace-nowrap">
        Active
      </Badge>
    );
  if (access === "invite_sent")
    return (
      <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-warning/40 text-warning bg-warning/5 font-medium whitespace-nowrap">
        Invite Sent
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-[10px] px-1.5 h-5 text-muted-foreground font-medium whitespace-nowrap">
      No Access
    </Badge>
  );
}
