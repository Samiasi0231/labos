import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  User,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Download,
  Play,
  Flame,
  Zap,
  Search,
  ClipboardList,
  FlaskConical,
} from "lucide-react";

import { useApi } from "@/hooks/use-api";
import { useTestOrder } from "@/hooks/use-testorder";
import {
  useCancelTestOrder,
  useAssignTestOrderItem,
  useStartTest,
  useUpdateTestOrderItemStatus,
} from "@/hooks/use-testorder";
import { useStaffSearch } from "@/hooks/use-staff";
import { useMyPermissions } from "@/hooks/use-permissions";
import endpoint from "@/api/endpoints";
import { downloadPDF } from "@/lib/download-pdf";
import type { TestOrderItem, TestOrderPriority } from "@/api/types/test-order";
import type { TestCatalogEntry } from "@/api/types/test-catalog";
import { useToast } from "@/hooks/use-toast";

// ── Badge components ──────────────────────────────────────────────────────────

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

const ORDER_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-muted/80 text-muted-foreground border" },
  sample_collected: { label: "Sample Collected", cls: "bg-info/15 text-info border-info/30 border" },
  in_progress: { label: "In Progress", cls: "bg-warning/15 text-warning border-warning/30 border" },
  completed: { label: "Completed", cls: "bg-success/15 text-success border-success/30 border" },
  cancelled: { label: "Cancelled", cls: "bg-muted/50 text-muted-foreground border line-through" },
};

function OrderStatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUS_CONFIG[status] ?? { label: status, cls: "bg-muted/50 text-muted-foreground border" };
  return (
    <Badge variant="outline" className={`text-xs ${cfg.cls}`}>
      {cfg.label}
    </Badge>
  );
}

const ITEM_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-muted/80 text-muted-foreground border" },
  assigned: { label: "Assigned", cls: "bg-info/15 text-info border-info/30 border" },
  in_progress: { label: "In Progress", cls: "bg-warning/15 text-warning border-warning/30 border" },
  completed: { label: "Completed", cls: "bg-success/15 text-success border-success/30 border" },
};

function ItemStatusBadge({ status }: { status: string }) {
  const cfg = ITEM_STATUS_CONFIG[status] ?? { label: status, cls: "bg-muted/50 text-muted-foreground border" };
  return (
    <Badge variant="outline" className={`text-xs ${cfg.cls}`}>
      {cfg.label}
    </Badge>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPatientName(patient: unknown): string {
  if (!patient) return "Unknown";
  if (typeof patient === "string") return patient;
  const p = patient as { firstName?: string; lastName?: string };
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "Unknown";
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TestOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { can } = useMyPermissions();

  const {
    order,
    isLoading,
    refetch,
  } = useTestOrder(orderId ?? null);

  const { cancelTestOrder, isLoading: isCancelling } = useCancelTestOrder([
    endpoint.lab.testOrders.list,
    ...(orderId ? [endpoint.lab.testOrders.get(orderId)] : []),
  ]);
  const { assignTestOrderItem, isLoading: isAssigning } = useAssignTestOrderItem([
    endpoint.lab.testOrders.list,
    ...(orderId ? [endpoint.lab.testOrders.get(orderId)] : []),
  ]);
  const { startTest, isLoading: isStarting } = useStartTest([
    endpoint.lab.testOrders.list,
    ...(orderId ? [endpoint.lab.testOrders.get(orderId)] : []),
  ]);
  const { updateTestOrderItemStatus, isLoading: isMarkingComplete } =
    useUpdateTestOrderItemStatus([
      endpoint.lab.testOrders.list,
      ...(orderId ? [endpoint.lab.testOrders.get(orderId)] : []),
    ]);

  // ── Assign dialog ──────────────────────────────────────────────────────────
  const [assignItem, setAssignItem] = useState<TestOrderItem | null>(null);
  const [assignScientist, setAssignScientist] = useState("");
  const [assignSearch, setAssignSearch] = useState("");

  const { staff: scientists, isLoading: isLoadingStaff } = useStaffSearch(assignSearch);

  // ── Start Test dialog ──────────────────────────────────────────────────────
  const [startTestItem, setStartTestItem] = useState<TestOrderItem | null>(null);
  const [materialQtys, setMaterialQtys] = useState<Record<string, string>>({});

  // Fetch test catalog when start-test dialog opens (to get analysis materials)
  const { data: catalogData, isLoading: isLoadingCatalog } = useApi<TestCatalogEntry>(
    startTestItem ? endpoint.lab.testCatalog.get(startTestItem.testCatalog) : null,
  );
  const analysisMaterials = (catalogData?.data?.materials ?? []).filter(
    (m) => m.phase === "analysis",
  );

  // ── Mark Complete dialog ───────────────────────────────────────────────────
  const [completeItem, setCompleteItem] = useState<TestOrderItem | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAssign = async () => {
    if (!order || !assignItem || !assignScientist) return;
    try {
      await assignTestOrderItem(order._id, assignItem._id, { assignedTo: assignScientist });
      await refetch();
      const sci = scientists.find((s) => s._id === assignScientist);
      setAssignItem(null);
      setAssignScientist("");
      setAssignSearch("");
      toast({
        title: "Item assigned",
        description: sci ? `${sci.user.firstName} ${sci.user.lastName} assigned.` : undefined,
      });
    } catch {
      toast({ title: "Failed to assign", variant: "destructive" });
    }
  };

  const handleStartTest = async () => {
    if (!order || !startTestItem) return;
    const materials = analysisMaterials
      .map((m) => ({
        catalogMaterialId: m._id,
        quantity: parseFloat(materialQtys[m._id] ?? "0"),
      }))
      .filter((m) => m.quantity > 0);
    try {
      await startTest(order._id, startTestItem._id, { materials });
      await refetch();
      setStartTestItem(null);
      setMaterialQtys({});
      toast({ title: "Test started" });
    } catch {
      toast({ title: "Failed to start test", variant: "destructive" });
    }
  };

  const handleMarkComplete = async () => {
    if (!order || !completeItem) return;
    try {
      await updateTestOrderItemStatus(order._id, completeItem._id, { status: "completed" });
      await refetch();
      setCompleteItem(null);
      toast({ title: "Item marked complete" });
    } catch {
      toast({ title: "Failed to mark complete", variant: "destructive" });
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      await cancelTestOrder(order._id);
      navigate("/lab/tests");
      toast({ title: "Order cancelled" });
    } catch {
      toast({ title: "Failed to cancel order", variant: "destructive" });
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadAll = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      await downloadPDF(
        endpoint.lab.testOrders.downloadResults(order._id),
        `results-${order._id}.pdf`,
      );
    } catch {
      toast({
        title: "Download failed",
        description: "Could not download results PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground animate-fade-in">
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center animate-fade-in">
        <AlertTriangle className="w-8 h-8 text-destructive/60" />
        <p className="text-sm text-muted-foreground">Order not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/lab/tests")}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const patientName = getPatientName(order.patient);
  const completedItems = order.items.filter((i) => i.status === "completed").length;
  // scientists is now search-driven via useStaffSearch(assignSearch)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => navigate("/lab/tests")}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Order header card */}
      <Card className="shadow-card">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">{patientName}</h2>
                <PriorityBadge priority={order.priority} />
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{order._id}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.date).toLocaleDateString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right shrink-0 space-y-2">
              <div>
                <p className="text-2xl font-bold text-primary">
                  ₦{(order.totalPrice ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} test{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
              {order.status === "completed" && can("results.read") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  disabled={downloading}
                  onClick={handleDownloadAll}
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading ? "Downloading…" : "Download All Results"}
                </Button>
              )}
            </div>
          </div>

          {order.notes && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground italic">"{order.notes}"</p>
            </>
          )}

          {order.sampleCollectedAt && (
            <>
              <Separator className="my-4" />
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>
                  <span className="font-medium">Collected by:</span>{" "}
                  {typeof order.sampleCollectedBy === "object" && order.sampleCollectedBy !== null
                    ? "Staff"
                    : (order.sampleCollectedBy as string) ?? "—"}
                </p>
                <p>
                  <span className="font-medium">Collected at:</span>{" "}
                  {new Date(order.sampleCollectedAt).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status alerts */}
      {order.status === "sample_collected" && (
        <Alert className="border-info/30 bg-info/5">
          <AlertTriangle className="w-4 h-4 text-info" />
          <AlertDescription className="text-info text-sm">
            All samples collected — assign scientists to each test item to proceed.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress bar */}
      {order.status === "in_progress" && (
        <Card className="shadow-card">
          <CardContent className="pt-4 pb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Test Progress</span>
              <span className="font-medium">
                {completedItems} / {order.items.length} completed
              </span>
            </div>
            <Progress
              value={order.items.length > 0 ? (completedItems / order.items.length) * 100 : 0}
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Test Items */}
      <Card className="shadow-card">
        <CardHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <span className="font-semibold">Test Items</span>
            <Badge variant="secondary" className="text-xs">
              {order.items.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {order.items.map((item) => {
            const isAssigned = !!item.assignedTo;
            const assignedUser =
              item.assignedTo && typeof item.assignedTo.user === "object"
                ? item.assignedTo.user
                : null;

            return (
              <div
                key={item._id}
                className="border border-border rounded-xl p-4 space-y-3"
              >
                {/* Item header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{item.testName}</p>
                      <ItemStatusBadge status={item.status} />
                    </div>
                    {item.samples?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Samples: {item.samples.join(", ")}
                      </p>
                    )}
                    {item.sampleCollectedAt && (
                      <p className="text-xs text-muted-foreground">
                        Collected: {new Date(item.sampleCollectedAt).toLocaleString()}
                      </p>
                    )}
                    {item.testStartedAt && (
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date(item.testStartedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary shrink-0">
                    ₦{(item.subtotal ?? 0).toLocaleString()}
                  </span>
                </div>

                {/* Parameters */}
                {item.parameters?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.parameters.map((p) => (
                      <Badge
                        key={p._id}
                        variant="outline"
                        className="text-[10px] px-1.5 text-muted-foreground"
                      >
                        {p.name}
                        {p.unit ? ` (${p.unit})` : ""}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Assigned scientist */}
                {isAssigned ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {assignedUser
                      ? `${assignedUser.firstName} ${assignedUser.lastName}`
                      : "Assigned"}
                    {item.assignedTo?.role && (
                      <span className="text-muted-foreground/60 capitalize">
                        ({item.assignedTo.role})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    Unassigned
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Assign — requires tests.assign permission */}
                  {can("tests.assign") &&
                    (item.status === "pending" || item.status === "assigned") &&
                    order.status !== "pending" &&
                    order.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => {
                          setAssignItem(item);
                          setAssignScientist(
                            typeof item.assignedTo === "string"
                              ? item.assignedTo
                              : (item.assignedTo as { _id?: string })?._id ?? "",
                          );
                          setAssignSearch("");
                        }}
                      >
                        <UserPlus className="w-3 h-3" />
                        {item.assignedTo ? "Reassign" : "Assign"}
                      </Button>
                    )}

                  {/* Start Test — requires tests.process permission */}
                  {can("tests.process") && item.status === "assigned" && (
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setStartTestItem(item);
                        setMaterialQtys({});
                      }}
                    >
                      <Play className="w-3 h-3" />
                      Start Test
                    </Button>
                  )}

                  {/* Mark Complete — requires tests.update_status permission */}
                  {can("tests.update_status") && item.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-success/40 text-success hover:bg-success/10"
                      onClick={() => setCompleteItem(item)}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Cancel — pending orders only, requires tests.create */}
      {can("tests.create") && order.status === "pending" && (
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            <Ban className="w-4 h-4" />
            Cancel Order
          </Button>
        </div>
      )}

      {/* ─── ASSIGN DIALOG ─── */}
      <Dialog
        open={!!assignItem}
        onOpenChange={(v) => {
          if (!v) { setAssignItem(null); setAssignSearch(""); }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Assign Scientist
            </DialogTitle>
          </DialogHeader>
          {assignItem && (
            <p className="text-sm text-muted-foreground">
              Assigning: <span className="font-medium text-foreground">{assignItem.testName}</span>
            </p>
          )}
          <div className="space-y-3 py-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                className="pl-9"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
              />
            </div>
            <div className="border border-border rounded-lg max-h-56 overflow-y-auto divide-y divide-border">
              {isLoadingStaff && (
                <p className="text-sm text-muted-foreground p-3">Searching…</p>
              )}
              {!isLoadingStaff && assignSearch.trim().length === 0 && (
                <p className="text-sm text-muted-foreground p-3">Type a name to search staff…</p>
              )}
              {!isLoadingStaff && assignSearch.trim().length > 0 && scientists.length === 0 && (
                <p className="text-sm text-muted-foreground p-3">No staff found.</p>
              )}
              {scientists
                .filter((s) => s.role === "scientist" || s.role === "manager")
                .map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => setAssignScientist(s._id)}
                  className={`w-full text-left px-3 py-2.5 hover:bg-muted/30 transition-colors flex items-center gap-2.5 ${
                    assignScientist === s._id ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {[s.user.firstName, s.user.lastName]
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {s.user.firstName} {s.user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{s.role}</p>
                  </div>
                  {assignScientist === s._id && (
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!assignScientist || isAssigning}
              className="gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {isAssigning ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── START TEST DIALOG ─── */}
      <Dialog
        open={!!startTestItem}
        onOpenChange={(v) => {
          if (!v) { setStartTestItem(null); setMaterialQtys({}); }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              Start Test
            </DialogTitle>
          </DialogHeader>
          {startTestItem && (
            <p className="text-sm text-muted-foreground">
              Starting:{" "}
              <span className="font-medium text-foreground">{startTestItem.testName}</span>
            </p>
          )}
          <div className="space-y-3 py-1">
            {isLoadingCatalog && (
              <p className="text-sm text-muted-foreground">Loading materials…</p>
            )}
            {!isLoadingCatalog && analysisMaterials.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No analysis-phase materials required. Click Start to proceed.
              </p>
            )}
            {analysisMaterials.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Analysis Materials Used
                </Label>
                {analysisMaterials.map((m) => (
                  <div key={m._id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.inventoryItem.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.inventoryItem.unit} · {m.inventoryItem.quantityOnHand} on hand
                      </p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="Qty"
                      className="w-20 h-8 text-sm text-right"
                      value={materialQtys[m._id] ?? ""}
                      onChange={(e) =>
                        setMaterialQtys((prev) => ({ ...prev, [m._id]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartTestItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartTest}
              disabled={isStarting || isLoadingCatalog}
              className="gap-1.5"
            >
              <Play className="w-4 h-4" />
              {isStarting ? "Starting…" : "Start Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MARK COMPLETE DIALOG ─── */}
      <Dialog
        open={!!completeItem}
        onOpenChange={(v) => { if (!v) setCompleteItem(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Mark Item Complete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Confirm that{" "}
            <span className="font-medium text-foreground">{completeItem?.testName}</span> has
            been completed. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkComplete}
              disabled={isMarkingComplete}
              className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isMarkingComplete ? "Saving…" : "Mark Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
