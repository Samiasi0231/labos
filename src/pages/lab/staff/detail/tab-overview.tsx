import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { ActivityListResponse, Activity } from "@/api/types/activity";

interface AssignmentsResponse {
  docs: unknown[];
  totalDocs: number;
}

interface Props {
  membershipId: string;
  onViewAllActivity: () => void;
}

function verbCategory(action: string): "success" | "info" | "warn" | "muted" {
  const verb = action.split(".")[1] ?? action;
  const MAP: Record<string, "success" | "info" | "warn" | "muted"> = {
    created: "success", approved: "success", released: "success", activated: "success",
    updated: "info", assigned: "info", invited: "info",
    cancelled: "warn", returned: "warn", deactivated: "warn", deleted: "warn", removed: "warn",
  };
  return MAP[verb] ?? "muted";
}

const BADGE: Record<"success" | "info" | "warn" | "muted", string> = {
  success: "bg-success/15 text-success border border-success/30",
  info:    "bg-info/15 text-info border border-info/30",
  warn:    "bg-warning/15 text-warning border border-warning/30",
  muted:   "bg-muted text-muted-foreground border border-border",
};

function actionLabel(action: string): string {
  return action
    .split(".")
    .map((s) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()))
    .join(" · ");
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function TabOverview({ membershipId, onViewAllActivity }: Props) {
  const activityUrl = useMemo(
    () => `${endpoint.lab.activity.list}?actor=${membershipId}&limit=6`,
    [membershipId],
  );
  const assignUrl = useMemo(() => `${endpoint.lab.testOrders.assignments}?limit=1`, []);
  const submittedUrl = useMemo(
    () => `${endpoint.lab.activity.list}?actor=${membershipId}&resource=Result&limit=1`,
    [membershipId],
  );

  const { data: actData, isLoading: actLoading } = useApi<ActivityListResponse>(activityUrl);
  const { data: assignData } = useApi<AssignmentsResponse>(assignUrl);
  const { data: submittedData } = useApi<ActivityListResponse>(submittedUrl);

  const recentActivity = actData?.data?.docs ?? [];
  const totalActions   = actData?.data?.totalDocs ?? 0;
  const totalAssigned  = assignData?.data?.totalDocs ?? 0;
  const totalSubmitted = submittedData?.data?.totalDocs ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Metrics ── */}
      <div className="grid grid-cols-3 gap-3.5">
        {[
          { label: "Total Actions Logged", value: totalActions },
          { label: "Tests Assigned",        value: totalAssigned },
          { label: "Results Submitted",     value: totalSubmitted },
        ].map((m) => (
          <Card key={m.label} className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1.5">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <Card className="shadow-card overflow-hidden p-0">
        <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-border">
          <p className="text-sm font-semibold">Recent Activity</p>
          <button
            className="text-[12.5px] font-semibold text-primary bg-transparent border-none cursor-pointer hover:underline"
            onClick={onViewAllActivity}
          >
            View all activity →
          </button>
        </div>

        <div className="flex flex-col">
          {actLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-[18px] py-3 border-b border-border last:border-0">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-4 w-14 rounded" />
              </div>
            ))
          ) : recentActivity.length === 0 ? (
            <p className="px-[18px] py-8 text-sm text-muted-foreground text-center">
              No activity recorded yet.
            </p>
          ) : (
            recentActivity.map((log: Activity) => {
              const cat = verbCategory(log.action);
              return (
                <div
                  key={log._id}
                  className="flex items-baseline gap-2.5 px-[18px] py-[11px] border-b border-border last:border-0"
                >
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap flex-shrink-0 ${BADGE[cat]}`}
                  >
                    {actionLabel(log.action)}
                  </span>
                  <span className="flex-1 text-[12.5px] text-muted-foreground truncate">
                    {log.details ?? log.resource}
                  </span>
                  <span className="text-[11.5px] text-muted-foreground flex-shrink-0">
                    {relativeTime(log.createdAt)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
