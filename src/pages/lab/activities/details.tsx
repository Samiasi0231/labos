import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import {
  Copy,
  Check,
} from "lucide-react";
import type { Activity } from "@/api/types/activity";
import { ActionBadge, ActorAvatar, actorName, fullDate, metaLabel } from "./components";
import { Button } from "@/components/ui/button";

export default function ActivityDrawer({
  activity,
  open,
  onClose,
}: {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (!activity?.resourceId) return;
    navigator.clipboard.writeText(activity.resourceId).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!activity) return null;

  const name = actorName(activity.actor);
  const meta = activity.metadata ? Object.entries(activity.metadata) : [];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[460px] sm:w-[460px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Activity Detail</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5 mt-4">
          {/* Actor */}
          <div className="flex items-center gap-3">
            <ActorAvatar name={name} size={40} />
            <div>
              <p className="font-bold text-[15px]">{name}</p>
              <p className="text-xs text-muted-foreground">Actor</p>
            </div>
          </div>

          {/* Action */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Action
            </p>
            <ActionBadge action={activity.action} />
            <p className="mt-2 text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
              {activity.action}
            </p>
          </div>

          {/* Resource */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              Resource
            </p>
            <div className="flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2.5">
              <div>
                <p className="text-sm font-semibold">{activity.resource}</p>
                {activity.resourceId && (
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {activity.resourceId}
                  </p>
                )}
              </div>
              {activity.resourceId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={copyId}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Metadata */}
          {meta.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Metadata
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {meta.map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[11px] text-muted-foreground">{metaLabel(k)}</p>
                    <p className="text-sm font-medium break-all">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request info */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Request Info
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-mono text-xs">{activity.ip ?? "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">User Agent</span>
                <p className="mt-1 text-xs break-all text-foreground/80">
                  {activity.userAgent ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="border-t border-border pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Timestamp
            </p>
            <p className="mt-1 text-sm font-medium">{fullDate(activity.createdAt)}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}