import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
import { Eye, ClipboardList, Zap, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { GlobalSearchSelect } from "@/components/lab/GlobalSearchSelect";
import endpoint from "@/api/endpoints";
import type { TestOrder, TestOrderStatus, TestOrderPriority, TestOrderListResponse } from "@/api/types/test-order";
import type { SearchHit } from "@/api/types/search";

// ── Constants ──────────────────────────────────────────────────────────────────

const PRIORITIES: TestOrderPriority[] = ["routine", "urgent", "stat"];
const PRIORITY_LABEL: Record<TestOrderPriority, string> = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "STAT",
};

const STATUS_OPTIONS: { value: TestOrderStatus | "All"; label: string }[] = [
  { value: "All", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "sample_collected", label: "Sample Collected" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const ORDER_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-muted/80 text-muted-foreground border" },
  sample_collected: { label: "Sample Collected", cls: "bg-info/15 text-info border-info/30 border" },
  in_progress: { label: "In Progress", cls: "bg-warning/15 text-warning border-warning/30 border" },
  completed: { label: "Completed", cls: "bg-success/15 text-success border-success/30 border" },
  cancelled: { label: "Cancelled", cls: "bg-muted/50 text-muted-foreground border" },
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
  const cfg = ORDER_STATUS_CONFIG[status] ?? { label: status, cls: "bg-muted/50 text-muted-foreground border" };
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
  const p = order.patient as { firstName?: string; lastName?: string; name?: string };
  if (p.name) return p.name;
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "Unknown";
}

function getPatientCode(order: TestOrder): string {
  if (typeof order.patient === "string") return "";
  const p = order.patient as { code?: string };
  return p.code ?? "";
}

// ── Props ──────────────────────────────────────────────────────────────────────

export interface OrderTableProps {
  /** Pre-set filters when embedded in patient profile */
  filters?: {
    patient?: string;
    start_date?: string;
    end_date?: string;
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function OrderTable({ filters }: OrderTableProps) {
  const navigate = useNavigate();

  const [selectedPatient, setSelectedPatient] = useState<SearchHit | null>(null);
  const [statusFilter, setStatusFilter] = useState<TestOrderStatus | "All">("All");
  const [priority, setPriority] = useState<"All" | TestOrderPriority>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const isPatientView = Boolean(filters?.patient);

  useEffect(() => {
    setPage(1);
  }, [selectedPatient, statusFilter, priority, dateFrom, dateTo, filters?.patient]);

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    const patientId = filters?.patient ?? selectedPatient?.id;
    if (patientId) params.set("patient", patientId);
    if (statusFilter !== "All") params.set("status", statusFilter);
    if (priority !== "All") params.set("priority", priority);
    const from = filters?.start_date ?? dateFrom;
    const to = filters?.end_date ?? dateTo;
    if (from) params.set("start_date", from);
    if (to) params.set("end_date", to);
    return `${endpoint.lab.testOrders.list}?${params}`;
  }, [filters?.patient, filters?.start_date, filters?.end_date, selectedPatient, statusFilter, priority, dateFrom, dateTo, page]);

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

  return (
    <Card className="shadow-card">
      <CardContent className="p-0">
        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 pt-4 pb-4">
          {/* Patient search — hidden in patient-profile embed */}
          {!isPatientView && (
            <GlobalSearchSelect
              types={["patients"]}
              placeholder="Search patient…"
              emptyMessage="No patients found"
              value={selectedPatient}
              onSelect={(h) => { setSelectedPatient(h); setPage(1); }}
              onClear={() => { setSelectedPatient(null); setPage(1); }}
              className="w-52"
            />
          )}

          {/* Status dropdown */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TestOrderStatus | "All")}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority dropdown */}
          <Select value={priority} onValueChange={(v) => setPriority(v as "All" | TestOrderPriority)}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priorities</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range — hidden in patient-profile embed (parent controls dates) */}
          {!isPatientView && (
            <>
              <Input
                type="date"
                className="w-36 h-9 text-sm"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                className="w-36 h-9 text-sm"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              />
            </>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6">Patient</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden sm:table-cell">Tests</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Total</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    Loading orders…
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
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
                orders.map((order) => {
                  const patientName = getPatientName(order);
                  const patientCode = getPatientCode(order);

                  return (
                    <TableRow
                      key={order._id}
                      className={`hover:bg-muted/20 transition-colors cursor-pointer ${
                        order.priority === "stat"
                          ? "border-l-2 border-l-destructive"
                          : order.priority === "urgent"
                          ? "border-l-2 border-l-warning"
                          : ""
                      }`}
                      onClick={() => navigate(`/lab/tests/${order._id}`)}
                    >
                      <TableCell className="pl-6">
                        <p className="text-sm font-semibold leading-tight">{patientName}</p>
                        {patientCode && (
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">{patientCode}</p>
                        )}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{order._id.slice(-8).toUpperCase()}
                      </TableCell>

                      <TableCell>
                        <PriorityBadge priority={order.priority} />
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {order.items.length}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-sm font-bold">
                        ₦{(order.totalPrice ?? 0).toLocaleString()}
                      </TableCell>

                      <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => navigate(`/lab/tests/${order._id}`)}
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
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
              Page {pagination.page} of {pagination.totalPages} · {pagination.totalDocs} order
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
