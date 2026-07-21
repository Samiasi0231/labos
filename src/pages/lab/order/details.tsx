<<<<<<< HEAD
import { useState, useRef, useEffect, useMemo } from "react";
=======
import { useState, useRef, useEffect } from "react";
>>>>>>> origin/main
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  User,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Play,
  Flame,
  Zap,
  Search,
  Pencil,
  MoreVertical,
  Plus,
  X,
  ArrowRight,
} from "lucide-react";

import { useApi, useMutation, useMyPermissions } from "@/hooks/use-api";
<<<<<<< HEAD
=======
import { useStaffSearch } from "@/hooks/use-staff";
import { useTestCatalogList } from "@/hooks/use-test-catalog";
>>>>>>> origin/main
import endpoint from "@/api/endpoints";
import { downloadPDF } from "@/lib/utils";
import type {
  TestOrder,
  TestOrderItem,
  TestOrderPriority,
  AssignTestOrderItemPayload,
  StartTestPayload,
  CollectSamplePayload,
  UpdateTestOrderItemPayload,
  AddTestOrderItemsPayload,
  UpdateTestOrderPayload,
} from "@/api/types/test-order";
import type { TestCatalogEntry, TestCatalogListResponse } from "@/api/types/test-catalog";
import type { StaffMember } from "@/api/types/staff";
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
  cancelled: { label: "Cancelled", cls: "bg-muted/50 text-muted-foreground border" },
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPatientName(patient: unknown): string {
  if (!patient) return "Unknown";
  if (typeof patient === "string") return patient;
  const p = patient as { firstName?: string; lastName?: string; name?: string };
  if (p.name) return p.name;
  return [p.firstName, p.lastName].filter(Boolean).join(" ") || "Unknown";
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Status Stepper ────────────────────────────────────────────────────────────

const STEPS = [
  { key: "pending", label: "Pending" },
  { key: "sample_collected", label: "Sample Collected" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
] as const;

const STEP_INDEX: Record<string, number> = {
  pending: 0,
  sample_collected: 1,
  in_progress: 2,
  completed: 3,
};

function StatusStepper({ order }: { order: TestOrder }) {
  const currentIdx = STEP_INDEX[order.status] ?? 0;

  const inProgressTime = (() => {
    const started = order.items
      .filter((i) => i.testStartedAt)
      .map((i) => new Date(i.testStartedAt!).getTime());
    if (!started.length) return null;
    return new Date(Math.min(...started)).toISOString();
  })();

  const timestamps: Record<string, string | null | undefined> = {
    pending: order.date,
    sample_collected: order.sampleCollectedAt,
    in_progress: inProgressTime,
    completed: order.status === "completed" ? order.updatedAt : null,
  };

  return (
    <div className="flex items-start mt-5 pt-5 border-t border-border">
      {STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const isLast = idx === STEPS.length - 1;
        return (
          <div key={step.key} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ minWidth: 80 }}>
              <span
                className="inline-flex items-center justify-center rounded-full"
                style={{
                  width: 26,
                  height: 26,
                  background: done ? "hsl(var(--primary))" : "hsl(var(--muted))",
                  border: done ? "none" : "1px solid hsl(var(--border))",
                }}
              >
                {done && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <span
                className="text-[10.5px] text-center leading-tight"
                style={{
                  fontWeight: isCurrent ? 700 : 500,
                  color: done ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {timestamps[step.key] ? fmtDate(timestamps[step.key]) : "—"}
              </span>
            </div>
            {!isLast && (
              <span
                className="flex-1 h-0.5 mx-1 mt-[-28px]"
                style={{
                  background:
                    idx < currentIdx ? "hsl(var(--primary))" : "hsl(var(--border))",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Collect Sample Modal ──────────────────────────────────────────────────────

interface CollectSampleModalProps {
  item: TestOrderItem | null;
  orderId: string;
  onClose: () => void;
  onDone: () => void;
}

function CollectSampleModal({ item, orderId, onClose, onDone }: CollectSampleModalProps) {
  const { toast } = useToast();
  const [samples, setSamples] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [matQtys, setMatQtys] = useState<Record<string, string>>({});

  const { data: catalogData, isLoading: loadingCatalog } = useApi<TestCatalogEntry>(
    item ? endpoint.lab.testCatalog.get(item.testCatalog) : null,
  );
  const collectionMaterials = (catalogData?.data?.materials ?? []).filter(
    (m) => m.phase === "collection",
  );

  const { trigger: collectSample, isLoading: isCollecting } = useMutation<TestOrderItem, CollectSamplePayload>(
    item ? endpoint.lab.testOrders.collectSample(orderId, item._id) : "test-orders/collect",
<<<<<<< HEAD
    { successToast: "Sample collected" },
=======
    { skipErrorHandling: true },
>>>>>>> origin/main
  );

  useEffect(() => {
    if (!item) { setSamples([]); setDraft(""); setMatQtys({}); }
  }, [item]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && draft.trim()) {
      e.preventDefault();
      setSamples((prev) => [...prev, draft.trim()]);
      setDraft("");
    }
  };

  const handleSubmit = async () => {
    if (!item || samples.length === 0) {
      toast({ title: "Add at least one sample", variant: "destructive" });
      return;
    }
    const materials = collectionMaterials
      .map((m) => ({ catalogMaterialId: m._id, quantity: parseFloat(matQtys[m._id] ?? "0") }))
      .filter((m) => m.quantity > 0);

    const res = await collectSample(
      { samples, materials },
      endpoint.lab.testOrders.collectSample(orderId, item._id),
    );
<<<<<<< HEAD
    if (!res) return;
    onDone();
=======
    if (res) {
      toast({ title: "Sample collected" });
      onDone();
    } else {
      toast({ title: "Failed to collect sample", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  return (
    <Dialog open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Collect Sample</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-1">
          {/* Samples */}
          <div className="space-y-2">
            <Label>Samples</Label>
            <Input
              placeholder="Type a sample type and press Enter"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {samples.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {samples.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted rounded-full px-2.5 py-1"
                  >
                    {s}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setSamples((p) => p.filter((_, j) => j !== i))}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div className="space-y-2">
            <Label>
              Materials Used{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            {loadingCatalog ? (
              <p className="text-sm text-muted-foreground">Loading materials…</p>
            ) : collectionMaterials.length === 0 ? (
              <p className="text-xs text-muted-foreground">No collection materials defined.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {collectionMaterials.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center gap-3 border border-border rounded-lg px-3 py-2"
                  >
                    <span className="flex-1 text-sm">{m.inventoryItem.name}</span>
                    <span className="text-xs text-muted-foreground">Qty</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="0"
                      className="w-16 h-7 text-sm text-right"
                      value={matQtys[m._id] ?? ""}
                      onChange={(e) =>
                        setMatQtys((prev) => ({ ...prev, [m._id]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={onClose} disabled={isCollecting}>Cancel</Button>
<<<<<<< HEAD
          <PermissionButton
            permission="tests.update_status"
            fallback="hide"
            isLoading={isCollecting}
            disabled={samples.length === 0}
            onClick={handleSubmit}
          >
            Collect Sample
          </PermissionButton>
=======
          <Button onClick={handleSubmit} disabled={isCollecting || samples.length === 0}>
            {isCollecting ? "Collecting…" : "Collect Sample"}
          </Button>
>>>>>>> origin/main
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Parameters Modal ─────────────────────────────────────────────────────

interface EditParamsModalProps {
  item: TestOrderItem | null;
  orderId: string;
  onClose: () => void;
  onDone: () => void;
}

function EditParamsModal({ item, orderId, onClose, onDone }: EditParamsModalProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);

  const { data: catalogData, isLoading: loadingCatalog } = useApi<TestCatalogEntry>(
    item ? endpoint.lab.testCatalog.get(item.testCatalog) : null,
  );
  const allParams = catalogData?.data?.parameters ?? [];

  useEffect(() => {
    if (item) {
      setSelected(item.parameters.map((p) => p.parameterId));
    }
  }, [item]);

  const { trigger: updateParams, isLoading: isSaving } = useMutation<TestOrderItem, UpdateTestOrderItemPayload>(
    item ? endpoint.lab.testOrders.updateItem(orderId, item._id) : "test-orders/update-item",
<<<<<<< HEAD
    { method: "PATCH", successToast: "Parameters updated" },
=======
    { method: "PATCH", skipErrorHandling: true },
>>>>>>> origin/main
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!item || selected.length === 0) return;
    const res = await updateParams(
      { parameterIds: selected },
      endpoint.lab.testOrders.updateItem(orderId, item._id),
    );
<<<<<<< HEAD
    if (!res) return;
    onDone();
=======
    if (res) {
      toast({ title: "Parameters updated" });
      onDone();
    } else {
      toast({ title: "Failed to update parameters", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  return (
    <Dialog open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Edit Parameters</DialogTitle>
        </DialogHeader>
        <div className="py-1">
          {loadingCatalog ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
              {allParams.map((p) => (
                <label
                  key={p._id}
                  className="flex items-center gap-3 text-sm cursor-pointer py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p._id)}
                    onChange={() => toggle(p._id)}
                    className="w-4 h-4 accent-primary"
                  />
                  {p.name}
                </label>
              ))}
            </div>
          )}
          {selected.length === 0 && !loadingCatalog && (
            <p className="text-xs text-destructive mt-2">
              At least one parameter must remain selected.
            </p>
          )}
        </div>
        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || selected.length === 0}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Test Modal ────────────────────────────────────────────────────────────

interface AddTestModalProps {
  open: boolean;
  orderId: string;
  onClose: () => void;
  onDone: () => void;
}

function AddTestModal({ open, orderId, onClose, onDone }: AddTestModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"pick" | "params">("pick");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [paramSel, setParamSel] = useState<Record<string, string[]>>({});

<<<<<<< HEAD
  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("isActive", "true");
    params.set("page", "1");
    params.set("limit", "100");
    return `${endpoint.lab.testCatalog.list}?${params.toString()}`;
  }, []);

  const { data, isLoading } = useApi<TestCatalogListResponse>(listUrl);
  const tests = data?.data?.docs ?? [];
=======
  const { tests, isLoading } = useTestCatalogList({ isActive: true, limit: 100 });
>>>>>>> origin/main

  useEffect(() => {
    if (!open) { setStep("pick"); setSelectedIds([]); setParamSel({}); }
  }, [open]);

  const { trigger: addItems, isLoading: isAdding } = useMutation<TestOrder, AddTestOrderItemsPayload>(
    endpoint.lab.testOrders.addItems(orderId),
<<<<<<< HEAD
    { successToast: "Tests added" },
=======
    { skipErrorHandling: true },
>>>>>>> origin/main
  );

  const toggleTest = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const goParams = () => {
    const init: Record<string, string[]> = {};
    selectedIds.forEach((id) => {
      const t = tests.find((x) => x._id === id);
      if (t) init[id] = t.parameters.map((p) => p._id);
    });
    setParamSel(init);
    setStep("params");
  };

  const toggleParam = (testId: string, paramId: string) => {
    setParamSel((prev) => {
      const cur = prev[testId] ?? [];
      return {
        ...prev,
        [testId]: cur.includes(paramId) ? cur.filter((x) => x !== paramId) : [...cur, paramId],
      };
    });
  };

  const handleSubmit = async () => {
    const items = selectedIds.map((id) => ({
      testCatalogId: id,
      parameterIds: paramSel[id] ?? [],
    }));
    const res = await addItems({ items });
<<<<<<< HEAD
    if (!res) return;
    onDone();
=======
    if (res) {
      toast({ title: "Tests added", description: `${selectedIds.length} test(s) added to the order.` });
      onDone();
    } else {
      toast({ title: "Failed to add tests", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  const stepLabel =
    step === "pick"
      ? "Step 1 of 2 — Pick tests from catalog"
      : "Step 2 of 2 — Select parameters";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Test</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">{stepLabel}</p>

        {step === "pick" ? (
          <>
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto py-1">
              {isLoading ? (
                <p className="text-sm text-muted-foreground py-2">Loading catalog…</p>
              ) : (
                tests.map((t) => {
                  const sel = selectedIds.includes(t._id);
                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => toggleTest(t._id)}
                      className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border text-left transition-colors"
                      style={{
                        borderColor: sel ? "hsl(var(--primary))" : "hsl(var(--border))",
                        background: sel ? "hsl(var(--primary)/.06)" : "transparent",
                      }}
                    >
                      <span className="text-sm">{t.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ₦{((t as any).price ?? 0).toLocaleString()}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <DialogFooter className="border-t border-border pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={goParams} disabled={selectedIds.length === 0}>
                Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-4 max-h-72 overflow-y-auto py-1">
              {selectedIds.map((id) => {
                const t = tests.find((x) => x._id === id);
                if (!t) return null;
                return (
                  <div key={id}>
                    <p className="text-sm font-bold mb-2">{t.name}</p>
                    {t.parameters.map((p) => (
                      <label
                        key={p._id}
                        className="flex items-center gap-3 text-sm cursor-pointer py-0.5 pl-2"
                      >
                        <input
                          type="checkbox"
                          checked={(paramSel[id] ?? []).includes(p._id)}
                          onChange={() => toggleParam(id, p._id)}
                          className="w-4 h-4 accent-primary"
                        />
                        {p.name}
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
            <DialogFooter className="border-t border-border pt-4">
              <Button variant="outline" onClick={() => setStep("pick")}>Back</Button>
<<<<<<< HEAD
              <PermissionButton
                permission="tests.create"
                fallback="hide"
                isLoading={isAdding}
                onClick={handleSubmit}
              >
                Add to Order
              </PermissionButton>
=======
              <Button onClick={handleSubmit} disabled={isAdding}>
                {isAdding ? "Adding…" : "Add to Order"}
              </Button>
>>>>>>> origin/main
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TestOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can } = useMyPermissions();

  const invalidate = [
    endpoint.lab.testOrders.list,
    ...(orderId ? [endpoint.lab.testOrders.get(orderId)] : []),
  ];

  const { data: orderData, isLoading, mutate: refetch } = useApi<TestOrder>(
    orderId ? endpoint.lab.testOrders.get(orderId) : null,
  );
  const order = orderData?.data;

  // ── Mutations ──────────────────────────────────────────────────────────────
  const { trigger: cancelOrder, isLoading: isCancelling } = useMutation<TestOrder, void>(
    "test-orders/cancel",
    { successToast: "Order cancelled", invalidate },
  );
  const { trigger: updateOrder, isLoading: isUpdatingOrder } = useMutation<TestOrder, UpdateTestOrderPayload>(
    orderId ? endpoint.lab.testOrders.update(orderId) : "test-orders/update",
    { method: "PATCH", successToast: "Order updated", invalidate },
  );
  const { trigger: updateOrder, isLoading: isUpdatingOrder } = useMutation<TestOrder, UpdateTestOrderPayload>(
    orderId ? endpoint.lab.testOrders.update(orderId) : "test-orders/update",
    { method: "PATCH", skipErrorHandling: true, invalidate },
  );
  const { trigger: assignTestOrderItem, isLoading: isAssigning } = useMutation<TestOrderItem, AssignTestOrderItemPayload>(
    "test-orders/assign-item",
    { method: "PATCH", successToast: "Item assigned", invalidate },
  );
  const { trigger: startTest, isLoading: isStarting } = useMutation<TestOrderItem, StartTestPayload>(
    "test-orders/start-test",
    { successToast: "Test started", invalidate },
  );
  const { trigger: removeItemFn, isLoading: isRemoving } = useMutation<TestOrder, void>(
    "test-orders/remove-item",
    { method: "DELETE", successToast: "Item removed", invalidate },
  );
<<<<<<< HEAD

  // ── UI State ───────────────────────────────────────────────────────────────
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const orderMenuRef = useRef<HTMLDivElement>(null);

  // Edit Order modal
  const [editOrderOpen, setEditOrderOpen] = useState(false);
  const [eoPriority, setEoPriority] = useState<TestOrderPriority>("routine");
  const [eoNotes, setEoNotes] = useState("");

=======
  const { trigger: removeItemFn, isLoading: isRemoving } = useMutation<TestOrder, void>(
    "test-orders/remove-item",
    { method: "DELETE", skipErrorHandling: true, invalidate },
  );

  // ── UI State ───────────────────────────────────────────────────────────────
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const orderMenuRef = useRef<HTMLDivElement>(null);

  // Edit Order modal
  const [editOrderOpen, setEditOrderOpen] = useState(false);
  const [eoPriority, setEoPriority] = useState<TestOrderPriority>("routine");
  const [eoNotes, setEoNotes] = useState("");

>>>>>>> origin/main
  // Collect Sample modal
  const [collectItem, setCollectItem] = useState<TestOrderItem | null>(null);

  // Assign dialog
  const [assignItem, setAssignItem] = useState<TestOrderItem | null>(null);
  const [assignScientist, setAssignScientist] = useState("");
  const [assignSearch, setAssignSearch] = useState("");

  // Start Test dialog
  const [startTestItem, setStartTestItem] = useState<TestOrderItem | null>(null);
  const [materialQtys, setMaterialQtys] = useState<Record<string, string>>({});

  // Edit Parameters modal
  const [editParamsItem, setEditParamsItem] = useState<TestOrderItem | null>(null);

  // Add Test modal
  const [addTestOpen, setAddTestOpen] = useState(false);

  // Download state
  const [downloading, setDownloading] = useState(false);

  // Staff search for assign dialog
<<<<<<< HEAD
  const staffSearchUrl = useMemo(() => {
    const trimmed = assignSearch.trim();
    return trimmed.length >= 1
      ? `${endpoint.lab.staff.search}?q=${encodeURIComponent(trimmed)}`
      : null;
  }, [assignSearch]);
  const { data: staffSearchData, isLoading: isLoadingStaff } = useApi<StaffMember[]>(staffSearchUrl);
  const scientists = staffSearchData?.data ?? [];
=======
  const { staff: scientists, isLoading: isLoadingStaff } = useStaffSearch(assignSearch);
>>>>>>> origin/main

  // Start test — fetch analysis materials
  const { data: catalogData, isLoading: isLoadingCatalog } = useApi<TestCatalogEntry>(
    startTestItem ? endpoint.lab.testCatalog.get(startTestItem.testCatalog) : null,
  );
  const analysisMaterials = (catalogData?.data?.materials ?? []).filter(
    (m) => m.phase === "analysis",
  );

  // Click-outside for order menu
  useEffect(() => {
    if (!orderMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (orderMenuRef.current && !orderMenuRef.current.contains(e.target as Node)) {
        setOrderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [orderMenuOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (!order) return;
    const res = await cancelOrder(undefined, endpoint.lab.testOrders.cancel(order._id));
<<<<<<< HEAD
    if (!res) return;
    navigate("/lab/tests");
=======
    if (res) {
      toast({ title: "Order cancelled" });
      navigate("/lab/tests");
    } else {
      toast({ title: "Failed to cancel order", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  const handleEditOrderSave = async () => {
    if (!order) return;
    const res = await updateOrder({ priority: eoPriority, notes: eoNotes });
<<<<<<< HEAD
    if (!res) return;
    await refetch();
    setEditOrderOpen(false);
=======
    if (res) {
      toast({ title: "Order updated" });
      await refetch();
      setEditOrderOpen(false);
    } else {
      toast({ title: "Failed to update order", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  const handleAssign = async () => {
    if (!order || !assignItem || !assignScientist) return;
    const res = await assignTestOrderItem(
      { assignedTo: assignScientist },
      endpoint.lab.testOrders.assignItem(order._id, assignItem._id),
    );
<<<<<<< HEAD
    if (!res) return;
    await refetch();
    setAssignItem(null);
    setAssignScientist("");
    setAssignSearch("");
=======
    if (res) {
      await refetch();
      const sci = scientists.find((s) => s._id === assignScientist);
      setAssignItem(null);
      setAssignScientist("");
      setAssignSearch("");
      toast({
        title: "Item assigned",
        description: sci ? `${sci.user.firstName} ${sci.user.lastName} assigned.` : undefined,
      });
    } else {
      toast({ title: "Failed to assign", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  const handleStartTest = async () => {
    if (!order || !startTestItem) return;
    const materials = analysisMaterials
      .map((m) => ({
        catalogMaterialId: m._id,
        quantity: parseFloat(materialQtys[m._id] ?? "0"),
      }))
      .filter((m) => m.quantity > 0);
    const res = await startTest({ materials }, endpoint.lab.testOrders.startTest(order._id, startTestItem._id));
<<<<<<< HEAD
    if (!res) return;
    await refetch();
    setStartTestItem(null);
    setMaterialQtys({});
=======
    if (res) {
      await refetch();
      setStartTestItem(null);
      setMaterialQtys({});
      toast({ title: "Test started" });
    } else {
      toast({ title: "Failed to start test", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  const handleRemoveItem = async (item: TestOrderItem) => {
    if (!order) return;
    const res = await removeItemFn(undefined, endpoint.lab.testOrders.removeItem(order._id, item._id));
<<<<<<< HEAD
    if (!res) return;
    await refetch();
=======
    if (res) {
      await refetch();
      toast({ title: "Item removed", description: `${item.testName} removed from order.` });
    } else {
      toast({ title: "Failed to remove item", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  const handleDownloadAll = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      await downloadPDF(endpoint.lab.testOrders.downloadResults(order._id), `results-${order._id}.pdf`);
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
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
  const isTerminal = order.status === "completed" || order.status === "cancelled";
  const PRIORITIES_LIST: TestOrderPriority[] = ["routine", "urgent", "stat"];
  const PRIORITY_LABELS: Record<TestOrderPriority, string> = {
    routine: "Routine",
    urgent: "Urgent",
    stat: "Stat",
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-[880px] mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground self-start"
        onClick={() => navigate("/lab/tests")}
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Orders
      </Button>

      {/* ── Order Header Card ── */}
      <Card className="shadow-card">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left: identity */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[17px] font-bold leading-tight">{patientName}</p>
                <span className="text-xs font-mono text-muted-foreground">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={order.priority} />
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-[12.5px] text-muted-foreground">
                {new Date(order.date).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} · Total ₦{(order.totalPrice ?? 0).toLocaleString()}
              </p>
              {order.notes && (
                <p className="text-[12.5px] text-muted-foreground italic">{order.notes}</p>
              )}
              {order.sampleCollectedAt && (
                <p className="text-[12px] text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3 h-3 flex-shrink-0" />
                  Collected by:{" "}
                  {typeof order.sampleCollectedBy === "string"
                    ? order.sampleCollectedBy
                    : "Staff"}{" "}
                  · {fmtDate(order.sampleCollectedAt)}
                </p>
              )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0 relative" ref={orderMenuRef}>
              {!isTerminal && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    setEoPriority(order.priority);
                    setEoNotes(order.notes ?? "");
                    setEditOrderOpen(true);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Order
                </Button>
              )}
              {order.status === "completed" && can("results.read") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  disabled={downloading}
                  onClick={handleDownloadAll}
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloading ? "Downloading…" : "Download All Results"}
                </Button>
              )}
              {can("tests.create") && !isTerminal && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setOrderMenuOpen((v) => !v)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  {orderMenuOpen && (
                    <div className="absolute top-9 right-0 bg-card border border-border rounded-lg shadow-elevated z-10 min-w-[150px]">
                      <button
                        className="flex items-center gap-2 w-full border-none bg-transparent px-3.5 py-2.5 text-sm text-destructive cursor-pointer hover:bg-muted/30 text-left"
                        onClick={() => {
                          setOrderMenuOpen(false);
                          setCancelConfirmOpen(true);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Order
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Inline cancel confirm */}
          {cancelConfirmOpen && (
            <div className="mt-4 bg-destructive/6 border border-destructive/25 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-destructive">
                Cancel this order? This cannot be undone.
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCancelConfirmOpen(false)}
                  disabled={isCancelling}
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  className="bg-destructive hover:bg-destructive/90 border-destructive text-white"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling…" : "Confirm"}
                </Button>
              </div>
            </div>
          )}

          {/* Status stepper / terminal badge */}
          {order.status === "cancelled" ? (
            <div className="mt-5 pt-5 border-t border-border">
              <Badge className="bg-destructive/15 text-destructive border border-destructive/30 text-xs">
                Cancelled
              </Badge>
            </div>
          ) : (
            <StatusStepper order={order} />
          )}
        </CardContent>
      </Card>

      {/* ── Test Items ── */}
      <div>
        <p className="text-sm font-semibold mb-3">Test Items</p>
        <div className="flex flex-col gap-3">
          {order.items.map((item) => {
            const assignedUser =
              item.assignedTo && typeof item.assignedTo.user === "object"
                ? item.assignedTo.user
                : null;
            const assigneeName = assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName}`
              : null;

            return (
              <Card key={item._id} className="shadow-sm">
                <CardContent className="px-[18px] py-4">
                  {/* Top row: name | status + price */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14.5px] font-bold leading-tight">{item.testName}</p>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <ItemStatusBadge status={item.status} />
                      <span className="text-sm font-bold">₦{(item.subtotal ?? 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Info lines */}
                  <div className="mt-2 space-y-0.5">
                    {item.parameters.length > 0 && (
                      <p className="text-[12.5px] text-muted-foreground">
                        Parameters: {item.parameters.map((p) => p.name).join(" · ")}
                      </p>
                    )}
                    {item.samples.length > 0 && (
                      <p className="text-[12.5px] text-muted-foreground">
                        Samples: {item.samples.join(", ")}
                      </p>
                    )}
                    {item.sampleCollectedAt && (
                      <p className="text-[12px] text-muted-foreground">
                        Collected: {fmtDate(item.sampleCollectedAt)}
                      </p>
                    )}
                    {item.testStartedAt && (
                      <p className="text-[12px] text-muted-foreground">
                        Started: {fmtDate(item.testStartedAt)}
                      </p>
                    )}
                  </div>

                  {/* Assignee + actions row */}
                  <div className="flex items-center justify-between mt-2.5 gap-3">
                    <p className="text-[12.5px] text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3 h-3 flex-shrink-0" />
                      {assigneeName ?? "Unassigned"}
                    </p>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {/* pending actions */}
                      {item.status === "pending" && (
                        <>
                          {can("tests.create") && !item.sampleCollectedAt && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => setCollectItem(item)}>
                              Collect Sample
                            </Button>
                          )}
                          {can("tests.assign") && !!item.sampleCollectedAt && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                              onClick={() => { setAssignItem(item); setAssignScientist(""); setAssignSearch(""); }}>
                              <UserPlus className="w-3 h-3" />
                              Assign
                            </Button>
                          )}
                          {can("tests.create") && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => setEditParamsItem(item)}>
                              Edit Parameters
                            </Button>
                          )}
                          {can("tests.create") && (
                            <Button
                              size="sm" variant="outline"
                              className="h-7 text-xs text-destructive border-destructive/40 hover:bg-destructive/5"
                              disabled={isRemoving}
                              onClick={() => handleRemoveItem(item)}
                            >
                              Remove
                            </Button>
                          )}
                        </>
                      )}

                      {/* assigned actions */}
                      {item.status === "assigned" && (
                        <>
                          {can("tests.create") && !item.sampleCollectedAt && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => setCollectItem(item)}>
                              Collect Sample
                            </Button>
                          )}
                          {can("tests.process") && (
                            <Button size="sm" className="h-7 text-xs gap-1"
                              onClick={() => { setStartTestItem(item); setMaterialQtys({}); }}>
                              <Play className="w-3 h-3" />
                              Start Test
                            </Button>
                          )}
                          {can("tests.assign") && (
                            <Button size="sm" variant="outline" className="h-7 text-xs"
                              onClick={() => { setAssignItem(item); setAssignScientist(""); setAssignSearch(""); }}>
                              Reassign
                            </Button>
                          )}
                        </>
                      )}

                      {/* in_progress actions */}
                      {item.status === "in_progress" && can("results.create") && (
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            navigate("/lab/result-entry", {
                              state: {
                                orderId: order._id,
                                itemId: item._id,
                                testName: item.testName,
                                patientName,
                                priority: order.priority,
                              },
                            })
                          }
                        >
                          Enter Results
                        </Button>
                      )}

                      {/* completed actions */}
                      {item.status === "completed" && can("results.read") && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => navigate("/lab/result-entry", {
                              state: { orderId: order._id, itemId: item._id, testName: item.testName, patientName, readonly: true },
                            })}>
                            View Result
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                            onClick={() => downloadPDF(endpoint.lab.testOrders.downloadResults(order._id), `result-${item._id}.pdf`)}>
                            <Download className="w-3 h-3" />
                            Download Result PDF
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Test button */}
          {order.status === "pending" && can("tests.create") && (
            <Button
              variant="outline"
              className="self-start gap-1.5"
              onClick={() => setAddTestOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Test
            </Button>
          )}
        </div>
      </div>

      {/* ── EDIT ORDER MODAL ── */}
      <Dialog open={editOrderOpen} onOpenChange={(v) => { if (!v) setEditOrderOpen(false); }}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-1">
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="inline-flex border border-border rounded-lg overflow-hidden">
                {PRIORITIES_LIST.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEoPriority(p)}
                    className="px-4 py-2 text-xs font-semibold transition-colors"
                    style={{
                      background: eoPriority === p ? "hsl(var(--primary))" : "hsl(var(--card))",
                      color: eoPriority === p ? "#fff" : "hsl(var(--foreground))",
                    }}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                className="min-h-[80px] resize-vertical"
                value={eoNotes}
                onChange={(e) => setEoNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" onClick={() => setEditOrderOpen(false)} disabled={isUpdatingOrder}>
              Cancel
            </Button>
            <Button onClick={handleEditOrderSave} disabled={isUpdatingOrder}>
              {isUpdatingOrder ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── COLLECT SAMPLE MODAL ── */}
      <CollectSampleModal
        item={collectItem}
        orderId={orderId!}
        onClose={() => setCollectItem(null)}
        onDone={async () => { setCollectItem(null); await refetch(); }}
      />

      {/* ── EDIT PARAMETERS MODAL ── */}
      <EditParamsModal
        item={editParamsItem}
        orderId={orderId!}
        onClose={() => setEditParamsItem(null)}
        onDone={async () => { setEditParamsItem(null); await refetch(); }}
      />

      {/* ── ADD TEST MODAL ── */}
      <AddTestModal
        open={addTestOpen}
        orderId={orderId!}
        onClose={() => setAddTestOpen(false)}
        onDone={async () => { setAddTestOpen(false); await refetch(); }}
      />

      {/* ── ASSIGN DIALOG ── */}
      <Dialog
        open={!!assignItem}
        onOpenChange={(v) => { if (!v) { setAssignItem(null); setAssignSearch(""); } }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              {assignItem?.assignedTo ? "Reassign" : "Assign"} Scientist
            </DialogTitle>
          </DialogHeader>
          {assignItem && (
            <p className="text-sm text-muted-foreground">
              Test: <span className="font-medium text-foreground">{assignItem.testName}</span>
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
              {isLoadingStaff && <p className="text-sm text-muted-foreground p-3">Searching…</p>}
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
                    className={`w-full text-left px-3 py-2.5 hover:bg-muted/30 transition-colors flex items-center gap-2.5 ${assignScientist === s._id ? "bg-primary/10" : ""
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
            <Button variant="outline" onClick={() => setAssignItem(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignScientist || isAssigning} className="gap-1.5">
              <UserPlus className="w-4 h-4" />
              {isAssigning ? "Assigning…" : assignItem?.assignedTo ? "Reassign" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── START TEST DIALOG ── */}
      <Dialog
        open={!!startTestItem}
        onOpenChange={(v) => { if (!v) { setStartTestItem(null); setMaterialQtys({}); } }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Start Test</DialogTitle>
          </DialogHeader>
          {startTestItem && (
            <p className="text-sm text-muted-foreground">
              Starting: <span className="font-medium text-foreground">{startTestItem.testName}</span>
            </p>
          )}
          <div className="space-y-3 py-1">
            <Label>
              Materials Used{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            {isLoadingCatalog && <p className="text-sm text-muted-foreground">Loading materials…</p>}
            {!isLoadingCatalog && analysisMaterials.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No analysis-phase materials required. Click Start to proceed.
              </p>
            )}
            {analysisMaterials.length > 0 && (
              <div className="flex flex-col gap-2">
                {analysisMaterials.map((m) => (
                  <div key={m._id} className="flex items-center gap-3 border border-border rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.inventoryItem.name}</p>
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
            <Button variant="outline" onClick={() => setStartTestItem(null)}>Cancel</Button>
            <Button onClick={handleStartTest} disabled={isStarting || isLoadingCatalog} className="gap-1.5">
              <Play className="w-4 h-4" />
              {isStarting ? "Starting…" : "Start Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
