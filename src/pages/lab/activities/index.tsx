import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw,
  Search,
  X,
  Inbox,
  Loader2,
} from "lucide-react";
import { useActivityList } from "@/hooks/use-activity";
import type { Activity, ActivityListQuery } from "@/api/types/activity";
import { ActionBadge, ActorAvatar, actorName, fullDate, metaLabel } from "./components";
import ActivityDrawer from "./details";

// ── Constants ─────────────────────────────────────────────────────────────────

const RESOURCE_OPTIONS = ["Patient", "Result", "Inventory", "TestOrder", "Staff"];
const ACTION_OPTIONS = [
  "Created", "Updated", "Deleted", "Approved", "Released",
  "Returned", "Assigned", "Restocked", "Viewed", "Exported", "Cancelled",
];

function metaExtraCount(meta: Record<string, unknown> | undefined): number {
  if (!meta) return 0;
  return Math.max(0, Object.keys(meta).length - 2);
}

function metaExtraTitle(meta: Record<string, unknown> | undefined): string {
  if (!meta) return "";
  return Object.entries(meta)
    .slice(2)
    .map(([k, v]) => `${metaLabel(k)}: ${v}`)
    .join(", ");
}

function browserName(ua: string | undefined): string {
  if (!ua) return "—";
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Mobile/.test(ua) && /Chrome/.test(ua)) return "Chrome Mobile";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Version\/.*Safari/.test(ua)) return "Safari";
  return "Unknown";
}

function relTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function PageButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  if (label === "…") {
    return (
      <span className="flex items-center justify-center w-8 text-sm text-muted-foreground select-none">
        …
      </span>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-8 min-w-[32px] px-2 rounded-md border text-sm font-semibold transition-colors ${active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card text-foreground border-border hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed"
        }`}
    >
      {label}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ActivityLog() {
  // q is client-side only — the backend has no free-text search param
  const [q, setQ] = useState("");
  const [resource, setResource] = useState("All");
  const [action, setAction] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Activity | null>(null);

  const query: ActivityListQuery = {
    ...(resource !== "All" && { resource }),
    ...(action !== "All" && { action: action.toLowerCase() }),
    ...(dateFrom && { start_date: dateFrom }),
    ...(dateTo && { end_date: dateTo }),
    page,
    limit: 10,
  };

  const { activities: rawActivities, pagination, isLoading, isValidating, refetch } =
    useActivityList(query);

  // Apply client-side keyword filter across actor name and action string
  const qLower = q.trim().toLowerCase();
  const activities = qLower
    ? rawActivities.filter((a) => {
      const name = actorName(a.actor).toLowerCase();
      return name.includes(qLower) || a.action.toLowerCase().includes(qLower);
    })
    : rawActivities;

  const clearFilters = () => {
    setQ("");
    setResource("All");
    setAction("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const goPage = (p: number) => setPage(p);

  // Build page buttons with ellipsis
  const buildPageButtons = () => {
    const total = pagination?.totalPages ?? 1;
    const cur = pagination?.page ?? 1;
    const buttons: { label: string; page: number }[] = [];
    for (let p = 1; p <= total; p++) {
      if (
        total > 7 &&
        p !== 1 &&
        p !== total &&
        Math.abs(p - cur) > 1
      ) {
        if (p === 2 || p === total - 1) buttons.push({ label: "…", page: -1 });
        continue;
      }
      buttons.push({ label: String(p), page: p });
    }
    return buttons;
  };

  const totalDocs = pagination?.totalDocs ?? 0;
  const curPage = pagination?.page ?? 1;
  const limit = 10;
  const fromEntry = totalDocs ? (curPage - 1) * limit + 1 : 0;
  const toEntry = Math.min(curPage * limit, totalDocs);

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Activity Log</h2>
            <p className="text-sm text-muted-foreground">
              Audit trail of all lab actions
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => refetch()}
            disabled={isLoading || isValidating}
          >
            {isValidating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refresh
          </Button>
        </div>

        {/* Filter bar */}
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-wrap gap-3 items-end">
              {/* Search */}
              <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-9 text-sm"
                    placeholder="Actor name or action keyword…"
                    value={q}
                    onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              {/* Resource */}
              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Resource
                </label>
                <Select value={resource} onValueChange={(v) => { setResource(v); setPage(1); }}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Resources</SelectItem>
                    {RESOURCE_OPTIONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action */}
              <div className="flex flex-col gap-1 min-w-[150px]">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Action
                </label>
                <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Actions</SelectItem>
                    {ACTION_OPTIONS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* From */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  From
                </label>
                <Input
                  type="date"
                  className="h-9 text-sm w-[148px]"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                />
              </div>

              {/* To */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  To
                </label>
                <Input
                  type="date"
                  className="h-9 text-sm w-[148px]"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-9 self-end"
                onClick={clearFilters}
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </Button>

              {!isLoading && (
                <span className="ml-auto self-end text-sm text-muted-foreground whitespace-nowrap">
                  {totalDocs} {totalDocs === 1 ? "entry" : "entries"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {isLoading ? (
          <Card className="shadow-card">
            <CardContent className="pt-5 pb-5 flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" style={{ opacity: 1 - i * 0.12 }} />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="hidden lg:table-cell">IP / Device</TableHead>
                  <TableHead className="pr-6">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                          <Inbox className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold">No activity found</p>
                        <p className="text-sm text-muted-foreground">
                          Try a different search term or clear the filters.
                        </p>
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((a) => {
                    const name = actorName(a.actor);
                    const extraCount = metaExtraCount(a.metadata);
                    const extraTitle = metaExtraTitle(a.metadata);

                    return (
                      <TableRow
                        key={a._id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelected(a)}
                      >
                        {/* Actor */}
                        <TableCell className="pl-6 min-w-[160px]">
                          <div className="flex items-center gap-2.5">
                            <ActorAvatar name={name} size={30} />
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                        </TableCell>

                        {/* Action */}
                        <TableCell>
                          <ActionBadge action={a.action} />
                        </TableCell>

                        {/* Resource */}
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm">{a.resource}</p>
                          {a.resourceId && (
                            <p className="hidden sm:block text-[11px] font-mono text-muted-foreground mt-0.5">
                              {a.resourceId}
                            </p>
                          )}
                        </TableCell>

                        {/* Details */}
                        <TableCell className="min-w-[200px] max-w-[280px]">
                          <span className="text-sm">
                            {a?.details}
                          </span>
                          {extraCount > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-1.5 text-[11px] font-semibold text-primary cursor-default whitespace-nowrap">
                                  +{extraCount} more
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs">
                                {extraTitle}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>

                        {/* IP / Device */}
                        <TableCell className="hidden lg:table-cell whitespace-nowrap">
                          <p className="text-xs">{a.ip ?? "—"}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {browserName(a.userAgent)}
                          </p>
                        </TableCell>

                        {/* Time */}
                        <TableCell className="pr-6 whitespace-nowrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm text-muted-foreground cursor-default">
                                {relTime(a.createdAt)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">
                              {fullDate(a.createdAt)}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && activities.length > 0 && (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">
              Showing {fromEntry}–{toEntry} of {totalDocs} entries
            </span>
            <div className="flex items-center gap-1.5">
              <PageButton
                label="Prev"
                disabled={!pagination?.hasPrevPage}
                onClick={() => goPage(curPage - 1)}
              />
              {buildPageButtons().map((btn, i) => (
                <PageButton
                  key={`${btn.label}-${i}`}
                  label={btn.label}
                  active={btn.page === curPage}
                  disabled={btn.page === -1}
                  onClick={() => btn.page > 0 && goPage(btn.page)}
                />
              ))}
              <PageButton
                label="Next"
                disabled={!pagination?.hasNextPage}
                onClick={() => goPage(curPage + 1)}
              />
            </div>
          </div>
        )}

        {/* Detail drawer */}
        <ActivityDrawer
          activity={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      </div>
    </TooltipProvider>
  );
}
