import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ShieldCheck, Check } from "lucide-react";
import { useMyPermissions } from "@/hooks/use-api";
import { groupPermissions } from "./shared";
import { cn } from "@/lib/utils";

/**
 * My Permissions card (collapsible).
 *
 * Data comes entirely from the store via useMyPermissions()
 * which is already populated by GET /staff/me/permissions
 * (called once in the app shell, not re-fetched here).
 *
 * - isAdmin / full role="manager" → shows Full Access badge
 * - granular permissions         → grouped by resource, one chip per action
 */
export function PermissionsCard() {
  const { isAdmin, permissions } = useMyPermissions();
  const [open, setOpen] = useState(false);
  const groups = groupPermissions(permissions);

  return (
    <Card className="shadow-card overflow-hidden">
      <button
        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-accent/50 transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="text-sm font-semibold">My Permissions</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
        }
      </button>

      {open && (
        <div className="px-5 pb-5">
          {isAdmin ? (
            <Badge variant="default" className="gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Full Access
            </Badge>
          ) : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No specific permissions assigned.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {groups.map((g) => (
                <div key={g.key}>
                  <p className="text-[12.5px] font-bold mb-2">{g.resource}</p>
                  <div className="flex flex-wrap gap-2">
                    {g.actions.map((a) => (
                      <span
                        key={a.label}
                        className={cn(
                          "inline-flex items-center gap-1 text-[11.5px] font-semibold",
                          "px-2.5 py-1 rounded-full bg-green-500/10 text-green-600",
                        )}
                      >
                        <Check className="w-2.5 h-2.5" />
                        {a.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
