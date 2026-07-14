import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Zap,
  Flame,
  Eye,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { TestOrder, TestOrderStatus, TestOrderPriority, TestOrderListResponse } from "@/api/types/test-order";

// ── Constants ──────────────────────────────────────────────────────────────────

const PRIORITIES: TestOrderPriority[] = ["routine", "urgent", "stat"];
const PRIORITY_LABEL: Record<TestOrderPriority, string> = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "STAT",
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-muted/80 text-muted-foreground border" },
  sample_collected: { label: "Sample Collected", cls: "bg-info/15 text-info border-info/30 border" },
  in_progress: { label: "In Progress", cls: "bg-warning/15 text-warning border-warning/30 border" },
  completed: { label: "Completed", cls: "bg-success/15 text-success border-success/30 border" },
  cancelled: { label: "Cancelled", cls: "bg-muted/50 text-muted-foreground border line-through" },
};

const STATUS_TABS = ["All", "sample_collected", "in_progress", "completed", "cancelled"] as const;
const TAB_LABEL: Record<string, string> = {
  All: "All",
  sample_collected: "Sample Collected",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: TestOrderPriority }) {
  if (priority === "stat")
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
        <Flame className="w-3 h-3" />
        STAT
      </Badge>
    );
  if (priority === "urgent")
    return (
      <Badge className="bg-warning/15 text-warning border-warning/30 border text-xs gap-1">
        <Zap className="w-3 h-3" />
        Urgent
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      Routine
    </Badge>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUS_CONFIG[status] ?? {
    label: status,
    cls: "bg-muted/50 text-muted-foreground border",
  };
  return (
    <Badge variant="outline" className={`text-xs ${cfg.cls}`}>
      {cfg.label}
    </Badge>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getPatientName(order: TestOrder): string {
  if (typeof order.patient === "string") return order.patient;
  if (!order.patient) return "Unknown";
  const { firstName, lastName } = order.patient as {
    firstName?: string;
    lastName?: string;
  };
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown";
}

function getAssignedNames(order: TestOrder): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const item of order.items) {
    if (!item.assignedTo) continue;
    const u = item.assignedTo.user;
    const id = typeof u === "string" ? u : u._id;
    if (seen.has(id)) continue;
    seen.add(id);
    names.push(typeof u === "string" ? "—" : u.firstName);
  }
  return names;
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface OrderTableProps {
  filters?: {
    patient?: string;
    start_date?: string;
    end_date?: string;
  };
  /** Hide the status tab bar */
  hideTabs?: boolean;
  /** Element rendered in the filter row's right slot */
  action?: React.ReactNode;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function OrderTable({ filters, hideTabs, action }: OrderTableProps) {
  const navigate = useNavigate();

  const [tab, setTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<"All" | TestOrderPriority>("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [tab, search, priority, filters?.patient]);

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filters?.patient) params.set("patient", filters.patient);
    if (tab !== "All") params.set("status", tab);
    if (priority !== "All") params.set("priority", priority);
    if (filters?.start_date) params.set("start_date", filters.start_date);
    if (filters?.end_date) params.set("end_date", filters.end_date);
    return `${endpoint.lab.testOrders.list}?${params}`;
  }, [filters?.patient, filters?.start_date, filters?.end_date, tab, priority, page]);

  const { data, isLoading } = useApi<TestOrderListResponse>(listUrl);
  const orders = data?.data?.docs ?? [];
  const pagination = data?.data
    ? {
        totalDocs: data.data.totalDocs,
        page: data.data.page,
        totalPages: data.data.totalPages,
        hasNextPage: data.data.hasNextPage,
        hasPrevPage: data.data.hasPrevPage,
      }
    : null;

  const isPatientView = Boolean(filters?.patient);

  const filtered = useMemo(
    () =>
      search.trim()
        ? orders.filter((o) =>
          getPatientName(o).toLowerCase().includes(search.toLowerCase()),
        )
        : orders,
    [orders, search],
  );

  const tabCounts = STATUS_TABS.map((t) => ({
    t,
    count:
      t === "All"
        ? (pagination?.totalDocs ?? orders.length)
        : orders.filter((o) => o.status === t).length,
  }));

  return (
    <Card className="shadow-card">
      {/* Status tabs */}
      {!hideTabs && (
        <CardHeader className="pb-2 pt-4 px-4 sm:px-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex-wrap h-auto gap-1">
              {tabCounts.map(({ t, count }) => (
                <TabsTrigger key={t} value={t} className="gap-1.5 text-xs">
                  {TAB_LABEL[t]}
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5 min-w-[20px]"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Filter row */}
        <div
          className={`flex flex-col sm:flex-row gap-3 px-4 sm:px-6 ${!hideTabs ? "py-3 border-t border-border" : "pt-4 pb-3"
            }`}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={isPatientView ? "Search orders…" : "Search patient name…"}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as "All" | TestOrderPriority)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                {isPatientView ? (
                  <TableHead className="pl-6">Order ID</TableHead>
                ) : (
                  <TableHead className="pl-6">Patient</TableHead>
                )}
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Tests</TableHead>
                <TableHead className="hidden md:table-cell">Assigned</TableHead>
                <TableHead className="hidden md:table-cell">Total</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    Loading orders…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-14">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">No orders found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => {
                  const patientName = getPatientName(order);
                  const assignedNames = getAssignedNames(order);
                  const shownNames = assignedNames.slice(0, 2);
                  const overflow = assignedNames.length - 2;

                  return (
                    <TableRow
                      key={order._id}
                      className={`hover:bg-muted/20 transition-colors cursor-pointer ${order.priority === "stat"
                          ? "border-l-2 border-l-destructive"
                          : order.priority === "urgent"
                            ? "border-l-2 border-l-warning"
                            : ""
                        }`}
                      onClick={() => navigate(`/lab/tests/${order._id}`)}
                    >
                      {isPatientView ? (
                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                          #{order._id.slice(-8)}
                        </TableCell>
                      ) : (
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{patientName}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {order._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      )}

                      <TableCell>
                        <PriorityBadge priority={order.priority} />
                      </TableCell>

                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {order.items.length} test
                        {order.items.length !== 1 ? "s" : ""}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {assignedNames.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {shownNames.map((name) => (
                              <Badge
                                key={name}
                                variant="secondary"
                                className="text-[11px] px-2 font-normal"
                              >
                                {name}
                              </Badge>
                            ))}
                            {overflow > 0 && (
                              <Badge
                                variant="outline"
                                className="text-[11px] px-2 text-muted-foreground"
                              >
                                +{overflow}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-sm font-semibold">
                        ₦{(order.totalPrice ?? 0).toLocaleString()}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="link"
                          className="h-auto py-0 px-1 text-[12px] gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/lab/tests/${order._id}`);
                          }}
                        >
                          View
                        </Button>
                        {/* <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/lab/tests/${order._id}`);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button> */}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ·{" "}
              {pagination.totalDocs} order
              {pagination.totalDocs !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
