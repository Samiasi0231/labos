import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Copy,
  Check,
  Inbox,
  Loader2,
} from "lucide-react";
import { useActivityList } from "@/hooks/use-activity";
import type { Activity, ActivityListQuery } from "@/api/types/activity";

// ── Constants ─────────────────────────────────────────────────────────────────

const RESOURCE_OPTIONS = ["Patient", "Result", "Inventory", "TestOrder", "Staff"];
const ACTION_OPTIONS = [
  "Created", "Updated", "Deleted", "Approved", "Released",
  "Returned", "Assigned", "Restocked", "Viewed", "Exported", "Cancelled",
];

const VERB_CATEGORY: Record<string, "success" | "info" | "destructive" | "muted"> = {
  created: "success",
  approved: "success",
  released: "success",
  updated: "info",
  assigned: "info",
  restocked: "info",
  deleted: "destructive",
  returned: "destructive",
  cancelled: "destructive",
  viewed: "muted",
  exported: "muted",
};

const BADGE_CLS: Record<"success" | "info" | "destructive" | "muted", string> = {
  success: "bg-success/15 text-success border-success/30 border",
  info: "bg-info/15 text-info border-info/30 border",
  destructive: "bg-destructive/15 text-destructive border-destructive/30 border",
  muted: "bg-muted text-muted-foreground border",
};

const META_LABELS: Record<string, string> = {
  patientName: "Patient",
  quantity: "Qty",
  testName: "Test",
  previousStatus: "From",
  newStatus: "To",
  product: "Item",
  role: "Role",
  scientist: "Assigned To",
  reorderLevel: "Reorder At",
  phone: "Phone",
  branch: "Branch",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function actorName(actor: Activity["actor"]): string {
  if (typeof actor === "string") return actor;
  return (
    [actor.firstName, actor.lastName].filter(Boolean).join(" ") ||
    actor.email ||
    "Unknown"
  );
}

function actorInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function verbOf(action: string): string {
  return action.split(".")[1] ?? action;
}

function actionLabel(action: string): string {
  const [res, verb] = action.split(".");
  const titleCase = (s: string) =>
    s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  return [res, verb].filter(Boolean).map(titleCase).join(" ");
}

function verbCategory(action: string): "success" | "info" | "destructive" | "muted" {
  return VERB_CATEGORY[verbOf(action)] ?? "muted";
}

function metaLabel(key: string): string {
  return META_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function metaInline(meta: Record<string, unknown> | undefined, max = 2): string {
  if (!meta) return "—";
  const entries = Object.entries(meta).slice(0, max);
  if (entries.length === 0) return "—";
  return entries.map(([k, v]) => `${metaLabel(k)}: ${v}`).join(" · ");
}

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

function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-NG", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActorAvatar({ name, size = 30 }: { name: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
    >
      <span
        style={{ fontSize: size * 0.37 }}
        className="font-bold text-primary leading-none"
      >
        {actorInitials(name)}
      </span>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const cat = verbCategory(action);
  return (
    <Badge className={`text-xs whitespace-nowrap ${BADGE_CLS[cat]}`}>
      {actionLabel(action)}
    </Badge>
  );
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

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function ActivityDrawer({
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
                            {metaInline(a.metadata)}
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
