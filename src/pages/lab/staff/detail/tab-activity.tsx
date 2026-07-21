import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { Activity, ActivityListResponse } from "@/api/types/activity";

interface Props {
  membershipId: string;
}

const RESOURCE_OPTIONS = ["all", "Patient", "TestOrder", "Result"];
const ACTION_OPTIONS   = ["all", "Created", "Updated", "Approved", "Assigned"];

function verbCategory(action: string): "success" | "info" | "warn" | "muted" {
  const verb = action.split(".")[1] ?? action;
  const MAP: Record<string, "success" | "info" | "warn" | "muted"> = {
    created: "success", approved: "success", released: "success", activated: "success",
    updated: "info",    assigned: "info",    invited: "info",
    cancelled: "warn",  returned: "warn",    deactivated: "warn", deleted: "warn", removed: "warn",
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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function TabActivity({ membershipId }: Props) {
  const [resource, setResource] = useState("all");
  const [action, setAction]     = useState("all");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");
  const [page, setPage]         = useState(1);

  const url = useMemo(() => {
    const p = new URLSearchParams({ actor: membershipId, page: String(page), limit: "8" });
    if (resource !== "all") p.set("resource", resource);
    if (action !== "all")   p.set("action", action);
    if (from)               p.set("start_date", from);
    if (to)                 p.set("end_date", to);
    return `${endpoint.lab.activity.list}?${p.toString()}`;
  }, [membershipId, resource, action, from, to, page]);

  const { data, isLoading } = useApi<ActivityListResponse>(url);
  const logs       = data?.data?.docs ?? [];
  const totalDocs  = data?.data?.totalDocs ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;
  const pagingFrom = totalDocs === 0 ? 0 : (page - 1) * 8 + 1;
  const pagingTo   = Math.min(page * 8, totalDocs);

  const resetPage = () => setPage(1);

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Filters ── */}
      <div className="flex gap-2.5 flex-wrap">
        <div className="relative">
          <select
            value={resource}
            onChange={(e) => { setResource(e.target.value); resetPage(); }}
            className="appearance-none text-sm bg-card border border-border rounded-[var(--radius)] px-3 pr-7 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {RESOURCE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r === "all" ? "All Resources" : r}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); resetPage(); }}
            className="appearance-none text-sm bg-card border border-border rounded-[var(--radius)] px-3 pr-7 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>{a === "all" ? "All Actions" : a}</option>
            ))}
          </select>
        </div>
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); resetPage(); }}
          className="text-sm bg-card border border-border rounded-[var(--radius)] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); resetPage(); }}
          className="text-sm bg-card border border-border rounded-[var(--radius)] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* ── Table ── */}
      <Card className="shadow-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-[18px] py-3">
                Action
              </th>
              <th className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">
                Resource
              </th>
              <th className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">
                Details
              </th>
              <th className="text-right text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-[18px] py-3">
                Date/Time
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-[18px] py-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-40 rounded" /></td>
                  <td className="px-[18px] py-3"><Skeleton className="h-4 w-28 rounded ml-auto" /></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Inbox className="w-8 h-8 opacity-40" />
                    <p className="text-sm">No activity found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log: Activity) => {
                const cat = verbCategory(log.action);
                return (
                  <tr key={log._id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-[18px] py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${BADGE[cat]}`}>
                        {actionLabel(log.action)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12.5px] text-muted-foreground">
                      {log.resource ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-[12.5px] text-muted-foreground max-w-[220px] truncate">
                      {log.details ?? "—"}
                    </td>
                    <td className="px-[18px] py-3 text-right text-[12.5px] text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {totalDocs === 0
            ? "No entries"
            : `Showing ${pagingFrom}–${pagingTo} of ${totalDocs} entries`}
        </p>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
