import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Zap,
  Flame,
  Eye,
  Trash2,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  X,
  ClipboardList,
  Ban,
  User,
} from "lucide-react";

import { usePatientsList } from "@/hooks/use-patients";
import { useStaffList } from "@/hooks/use-staff";
import { useTestCatalogList } from "@/hooks/use-test-catalog";
import type { TestCatalogEntry } from "@/api/types/test-catalog";

import {
  useTestOrderList,
  useCreateTestOrder,
  useUpdateTestOrder,
  useCancelTestOrder,
  useCollectSample,
  useAddTestOrderItems,
  useRemoveTestOrderItem,
  useAssignTestOrderItem,
} from "@/hooks/use-testorder";
import type {
  TestOrder,
  TestOrderPriority,
  CollectSamplePayload,
  CreateTestOrderPayload,
} from "@/api/types/test-order";

import { useToast } from "@/hooks/use-toast";

function getPatientName(order: TestOrder): string {
  if (typeof order.patient === "string") return order.patient;
  if (!order.patient) return "Unknown patient";
  const { firstName, lastName } = order.patient as {
    firstName?: string;
    lastName?: string;
  };
  return [firstName, lastName].filter(Boolean).join(" ") || "Unknown patient";
}

interface StagedItem {
  testCatalogId: string;
  testName: string;
  parameterIds: string[];
  paramNames: string[];
  subtotal: number;
}

const PRIORITIES: TestOrderPriority[] = ["routine", "urgent", "stat"];
const PRIORITY_LABEL: Record<TestOrderPriority, string> = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "Stat",
};

function PriorityBadge({ priority }: { priority: TestOrderPriority }) {
  if (priority === "stat")
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
        <Flame className="w-3 h-3" />
        Stat
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
  pending: {
    label: "Pending",
    cls: "bg-muted/80 text-muted-foreground border",
  },
  sample_collected: {
    label: "Sample Collected",
    cls: "bg-info/15 text-info border-info/30 border",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-warning/15 text-warning border-warning/30 border",
  },
  completed: {
    label: "Completed",
    cls: "bg-success/15 text-success border-success/30 border",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-muted/50 text-muted-foreground border line-through",
  },
};

const DEFAULT_STATUS_CFG = {
  label: "Unknown",
  cls: "bg-muted/50 text-muted-foreground border",
};

function OrderStatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUS_CONFIG[status] ?? DEFAULT_STATUS_CFG;
  return (
    <Badge variant="outline" className={`text-xs ${cfg.cls}`}>
      {cfg.label}
    </Badge>
  );
}

const ITEM_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending: {
    label: "Pending",
    cls: "bg-muted/80 text-muted-foreground border",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-warning/15 text-warning border-warning/30 border",
  },
  completed: {
    label: "Completed",
    cls: "bg-success/15 text-success border-success/30 border",
  },
};

function ItemStatusBadge({ status }: { status: string }) {
  const cfg = ITEM_STATUS_CONFIG[status] ?? DEFAULT_STATUS_CFG;
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 ${cfg.cls}`}>
      {cfg.label}
    </Badge>
  );
}

const STATUS_TABS = [
  "All",
  "pending",
  "sample_collected",
  "in_progress",
  "completed",
  "cancelled",
] as const;
const TAB_LABEL: Record<string, string> = {
  All: "All",
  pending: "Pending",
  sample_collected: "Sample Collected",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Tests() {
  const { toast } = useToast();
  const location = useLocation();
  const {
    orders,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useTestOrderList({ limit: 100 });
  const { createTestOrder, isLoading: isCreating } = useCreateTestOrder();
  const { updateTestOrder, isLoading: isUpdatingOrder } = useUpdateTestOrder();
  const { cancelTestOrder, isLoading: isCancelling } = useCancelTestOrder();
  const { collectSample, isLoading: isCollecting } = useCollectSample();
  const { addTestOrderItems, isLoading: isAddingItems } =
    useAddTestOrderItems();
  const { removeTestOrderItem, isLoading: isRemovingItem } =
    useRemoveTestOrderItem();
  const { assignTestOrderItem, isLoading: isAssigning } =
    useAssignTestOrderItem();
  const { tests: catalogTests, isLoading: isLoadingCatalog } =
    useTestCatalogList({ isActive: true, limit: 100 });
  const { staff, isLoading: isLoadingStaff } = useStaffList({ limit: 100 });
  const scientists = staff.filter(
    (staff) => staff.role === "scientist" || staff.role === "technician",
  );

  useEffect(() => {
    const state = location.state as {
      openCreate?: boolean;
      patientId?: string;
      patientName?: string;
    } | null;
    if (state?.openCreate) {
      if (state.patientId && state.patientName) {
        setCoPatient(state.patientId);
        setCoPatientName(state.patientName);
        setCoPSearch(state.patientName);
      }
      setShowCreate(true);
      setCreateStep(1);
      window.history.replaceState({}, "");
    }
  }, []);

  const [tab, setTab] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<"All" | TestOrderPriority>("All");
  const [detailId, setDetailId] = useState<string | null>(null);
  const detailOrder = orders.find((o) => o._id === detailId) ?? null;
  const [detPriority, setDetPriority] = useState<TestOrderPriority>("routine");
  const [detNotes, setDetNotes] = useState("");
  const [detEditing, setDetEditing] = useState(false);
  const [detShowAdd, setDetShowAdd] = useState(false);
  const [detCatSearch, setDetCatSearch] = useState("");
  const [detExpandedId, setDetExpandedId] = useState<string | null>(null);
  const [detChecked, setDetChecked] = useState<Record<string, Set<string>>>({});
  const [assignItemId, setAssignItemId] = useState<string | null>(null);
  const [assignScientist, setAssignScientist] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [coPatient, setCoPatient] = useState("");
  const [coPatientName, setCoPatientName] = useState("");
  const [coPSearch, setCoPSearch] = useState("");
  const [coPriority, setCoPriority] = useState<TestOrderPriority>("routine");
  const [coNotes, setCoNotes] = useState("");
  const [coItems, setCoItems] = useState<StagedItem[]>([]);
  const [coCatSearch, setCoCatSearch] = useState("");
  const [coExpandedId, setCoExpandedId] = useState<string | null>(null);
  const [coChecked, setCoChecked] = useState<Record<string, Set<string>>>({});

  // ── Collect Sample dialog state ──
  const [showCollect, setShowCollect] = useState(false);
  const [containerType, setContainerType] = useState("");
  const [itemSampleTypes, setItemSampleTypes] = useState<
    Record<string, string>
  >({});

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const matchTab = tab === "All" || o.status === tab;
        const matchQ = getPatientName(o)
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchPrio = priority === "All" || o.priority === priority;
        return matchTab && matchQ && matchPrio;
      }),
    [orders, tab, search, priority],
  );

  const { patients: patientResults, isLoading: isLoadingPatients } =
    usePatientsList(
      coPSearch ? { search: coPSearch, limit: 10 } : { limit: 10 },
    );

  const tabCounts = STATUS_TABS.map((t) => ({
    t,
    count:
      t === "All" ? orders.length : orders.filter((o) => o.status === t).length,
  }));

  const openDetail = (order: TestOrder) => {
    setDetailId(order._id);
    setDetPriority(order.priority);
    setDetNotes(order.notes ?? "");
    setDetEditing(false);
    setDetShowAdd(false);
    setDetCatSearch("");
    setDetExpandedId(null);
    setDetChecked({});
  };

  const saveDetEdit = async () => {
    if (!detailOrder) return;
    try {
      await updateTestOrder(detailOrder._id, {
        priority: detPriority,
        notes: detNotes,
      });
      await refetchOrders();
      setDetEditing(false);
      toast({ title: "Order updated" });
    } catch {
      toast({ title: "Failed to update order", variant: "destructive" });
    }
  };

  const toggleDetExpand = (testId: string) => {
    if (detExpandedId === testId) {
      setDetExpandedId(null);
      return;
    }
    setDetExpandedId(testId);
    const test = catalogTests.find((t) => t._id === testId);
    if (test && !detChecked[testId]) {
      setDetChecked((prev) => ({
        ...prev,
        [testId]: new Set(test.parameters.map((p) => p._id)),
      }));
    }
  };

  const toggleDetParam = (testId: string, paramId: string) => {
    setDetChecked((prev) => {
      const s = new Set(prev[testId] ?? []);
      if (s.has(paramId)) s.delete(paramId);
      else s.add(paramId);
      return { ...prev, [testId]: s };
    });
  };

  const addDetItem = async (test: TestCatalogEntry) => {
    if (!detailOrder) return;
    const paramSet = detChecked[test._id] ?? new Set();
    if (paramSet.size === 0) {
      toast({ title: "Select at least one parameter", variant: "destructive" });
      return;
    }
    try {
      await addTestOrderItems(detailOrder._id, {
        items: [
          { testCatalogId: test._id, parameterIds: Array.from(paramSet) },
        ],
      });
      await refetchOrders();
      setDetShowAdd(false);
      setDetExpandedId(null);
      setDetChecked({});
      toast({
        title: "Item added",
        description: `${test.name} added to order.`,
      });
    } catch {
      toast({ title: "Failed to add item", variant: "destructive" });
    }
  };

  const handleRemoveItem = async (orderId: string, itemId: string) => {
    try {
      await removeTestOrderItem(orderId, itemId);
      await refetchOrders();
      toast({ title: "Item removed" });
    } catch {
      toast({ title: "Failed to remove item", variant: "destructive" });
    }
  };

  const handleAssign = async () => {
    if (!detailOrder || !assignItemId || !assignScientist) return;
    const sci = scientists.find((sci) => sci._id === assignScientist);
    if (!sci) return;
    try {
      await assignTestOrderItem(detailOrder._id, assignItemId, {
        assignedTo: sci._id,
      });
      await refetchOrders();
      setAssignItemId(null);
      setAssignScientist("");
      toast({
        title: "Assigned",
        description: `${sci.firstName} ${sci.lastName} assigned to test item.`,
      });
    } catch {
      toast({ title: "Failed to assign scientist", variant: "destructive" });
    }
  };

  const handleCancel = async () => {
    if (!detailOrder) return;
    try {
      await cancelTestOrder(detailOrder._id);
      await refetchOrders();
      setDetailId(null);
      toast({ title: "Order cancelled" });
    } catch {
      toast({ title: "Failed to cancel order", variant: "destructive" });
    }
  };

  // ── Collect Sample handlers ──
  const openCollectDialog = () => {
    if (!detailOrder) return;
    setContainerType(detailOrder.containerType ?? "");
    const defaults: Record<string, string> = {};
    detailOrder.items.forEach((item) => {
      defaults[item._id] = item.sampleType ?? "";
    });
    setItemSampleTypes(defaults);
    setShowCollect(true);
  };

  const submitCollectSample = async () => {
    if (!detailOrder) return;
    if (!containerType.trim()) {
      toast({ title: "Container type required", variant: "destructive" });
      return;
    }
    const items = detailOrder.items.map((item) => ({
      itemId: item._id,
      sampleType: itemSampleTypes[item._id] || item.sampleType || "",
    }));
    if (items.some((i) => !i.sampleType)) {
      toast({
        title: "Every item needs a sample type",
        variant: "destructive",
      });
      return;
    }
    const payload: CollectSamplePayload = { containerType, items };
    try {
      await collectSample(detailOrder._id, payload);
      await refetchOrders();
      setShowCollect(false);
      setDetailId(null);
      toast({
        title: "Sample collected",
        description: "Order moved to Sample Collected.",
      });
    } catch {
      toast({ title: "Failed to collect sample", variant: "destructive" });
    }
  };

  const openCreate = () => {
    setShowCreate(true);
    setCreateStep(1);
    setCoPatient("");
    setCoPatientName("");
    setCoPSearch("");
    setCoPriority("routine");
    setCoNotes("");
    setCoItems([]);
    setCoCatSearch("");
    setCoExpandedId(null);
    setCoChecked({});
  };

  const toggleCoExpand = (testId: string) => {
    if (coExpandedId === testId) {
      setCoExpandedId(null);
      return;
    }
    setCoExpandedId(testId);
    const test = catalogTests.find((t) => t._id === testId);
    if (test && !coChecked[testId]) {
      setCoChecked((prev) => ({
        ...prev,
        [testId]: new Set(test.parameters.map((p) => p._id)),
      }));
    }
  };

  const toggleCoParam = (testId: string, paramId: string) => {
    setCoChecked((prev) => {
      const s = new Set(prev[testId] ?? []);
      if (s.has(paramId)) s.delete(paramId);
      else s.add(paramId);
      return { ...prev, [testId]: s };
    });
  };

  const addCoItem = (test: TestCatalogEntry) => {
    const paramSet = coChecked[test._id] ?? new Set();
    if (paramSet.size === 0) {
      toast({ title: "Select at least one parameter", variant: "destructive" });
      return;
    }
    if (coItems.some((i) => i.testCatalogId === test._id)) {
      toast({
        title: "Already added",
        description: `${test.name} is already on this order.`,
        variant: "destructive",
      });
      return;
    }
    const selectedParams = test.parameters.filter((p) => paramSet.has(p._id));
    const subtotal = selectedParams.reduce((s, p) => s + p.price, 0);
    setCoItems((prev) => [
      ...prev,
      {
        testCatalogId: test._id,
        testName: test.name,
        parameterIds: selectedParams.map((p) => p._id),
        paramNames: selectedParams.map((p) => p.name),
        subtotal,
      },
    ]);
    setCoExpandedId(null);
    toast({ description: `${test.name} added to order.` });
  };

  const submitOrder = async () => {
    if (!coPatient) return;
    const payload: CreateTestOrderPayload = {
      patient: coPatient,
      priority: coPriority,
      notes: coNotes || undefined,
      items: coItems.map((i) => ({
        testCatalogId: i.testCatalogId,
        parameterIds: i.parameterIds,
      })),
    };
    try {
      const created = await createTestOrder(payload);
      await refetchOrders();
      setShowCreate(false);
      toast({
        title: "Order placed",
        description: `Order for ${coPatientName || "patient"} — ₦${(created.totalPrice ?? 0).toLocaleString()}`,
      });
    } catch {
      toast({ title: "Failed to create order", variant: "destructive" });
    }
  };

  const coGrandTotal = coItems.reduce((s, i) => s + i.subtotal, 0);
  const coFilteredCat = catalogTests.filter((t) =>
    t.name.toLowerCase().includes(coCatSearch.toLowerCase()),
  );
  const detFilteredCat = catalogTests.filter((t) =>
    t.name.toLowerCase().includes(detCatSearch.toLowerCase()),
  );

  const renderParamPicker = (
    filtered: TestCatalogEntry[],
    expandedId: string | null,
    checked: Record<string, Set<string>>,
    onExpand: (id: string) => void,
    onToggleParam: (testId: string, paramId: string) => void,
    onAdd: (test: TestCatalogEntry) => void,
  ) => (
    <div className="space-y-2">
      {isLoadingCatalog && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Loading catalog…
        </p>
      )}
      {!isLoadingCatalog && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          No tests match your search.
        </p>
      )}
      {filtered.map((test) => {
        const isExpanded = expandedId === test._id;
        const paramSet = checked[test._id] ?? new Set();
        const subtotal = test.parameters
          .filter((p) => paramSet.has(p._id))
          .reduce((s, p) => s + p.price, 0);
        return (
          <div
            key={test._id}
            className="border border-border rounded-lg overflow-hidden"
          >
            <button
              onClick={() => onExpand(test._id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{test.name}</p>
                <p className="text-xs text-muted-foreground">
                  {test.code} · {test.parameters.length} params ·{" "}
                  {test.turnaroundTime} hrs
                </p>
              </div>
            </button>
            {isExpanded && (
              <div className="border-t border-border bg-muted/10 px-3 pb-3 pt-2 space-y-2">
                <div className="space-y-1.5">
                  {test.parameters.map((param) => (
                    <div key={param._id} className="flex items-center gap-2.5">
                      <Checkbox
                        id={`${test._id}-${param._id}`}
                        checked={paramSet.has(param._id)}
                        onCheckedChange={() =>
                          onToggleParam(test._id, param._id)
                        }
                      />
                      <label
                        htmlFor={`${test._id}-${param._id}`}
                        className="flex-1 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span>
                          {param.name}{" "}
                          {param.unit && (
                            <span className="text-muted-foreground">
                              ({param.unit})
                            </span>
                          )}
                        </span>
                        <span className="text-primary font-medium ml-3">
                          ₦{(param.price ?? 0).toLocaleString()}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <span className="text-xs font-semibold">
                    Subtotal:{" "}
                    <span className="text-primary">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => onAdd(test)}
                    disabled={paramSet.size === 0}
                  >
                    <Plus className="w-3 h-3" />
                    Add to Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Test Orders</h2>
          <p className="text-sm text-muted-foreground">
            {orders.length} orders total
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patient name..."
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
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
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
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Patient</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Items</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingOrders ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground text-sm"
                    >
                      Loading orders…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground text-sm"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => {
                    const patientName = getPatientName(order);
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
                        onClick={() => openDetail(order)}
                      >
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
                              <p className="text-sm font-medium">
                                {patientName}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {order._id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={order.priority} />
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {order.items.length} test
                            {order.items.length !== 1 ? "s" : ""}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm font-semibold">
                            ₦{(order.totalPrice ?? 0).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(order);
                            }}
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
        </CardContent>
      </Card>

      {/* ─── ORDER DETAIL SHEET ─── */}
      <Sheet
        open={!!detailOrder}
        onOpenChange={(v) => {
          if (!v) setDetailId(null);
        }}
      >
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto flex flex-col gap-0 p-0">
          {detailOrder && (
            <>
              <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SheetTitle className="text-base">
                      {getPatientName(detailOrder)}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {detailOrder._id} ·{" "}
                      {new Date(detailOrder.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={detailOrder.priority} />
                    <OrderStatusBadge status={detailOrder.status} />
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {detailOrder.status === "sample_collected" && (
                  <Alert className="border-info/30 bg-info/5">
                    <AlertTriangle className="w-4 h-4 text-info" />
                    <AlertDescription className="text-info text-xs">
                      Sample collected — order items can no longer be edited.
                      Assign scientists to proceed.
                    </AlertDescription>
                  </Alert>
                )}
                {(detailOrder.status === "in_progress" ||
                  detailOrder.status === "completed" ||
                  detailOrder.status === "cancelled") && (
                  <Alert className="border-border bg-muted/20">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                    <AlertDescription className="text-muted-foreground text-xs">
                      {detailOrder.status === "cancelled"
                        ? "This order has been cancelled."
                        : "Order is read-only at this stage."}
                    </AlertDescription>
                  </Alert>
                )}

                {detailOrder.status === "in_progress" &&
                  (() => {
                    const done = detailOrder.items.filter(
                      (i) => i.status === "completed",
                    ).length;
                    const total = detailOrder.items.length;
                    return (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {done} / {total} items completed
                          </span>
                        </div>
                        <Progress
                          value={(done / total) * 100}
                          className="h-2"
                        />
                      </div>
                    );
                  })()}

                {detailOrder.status === "pending" && (
                  <div className="space-y-3">
                    {detEditing ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Priority</Label>
                            <Select
                              value={detPriority}
                              onValueChange={(v) =>
                                setDetPriority(v as TestOrderPriority)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PRIORITIES.map((p) => (
                                  <SelectItem key={p} value={p}>
                                    {PRIORITY_LABEL[p]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Notes</Label>
                          <Textarea
                            value={detNotes}
                            onChange={(e) => setDetNotes(e.target.value)}
                            className="text-xs min-h-[60px]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={saveDetEdit}
                            disabled={isUpdatingOrder}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setDetEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-start justify-between gap-2 p-3 bg-muted/20 rounded-lg">
                        <div className="space-y-1 text-sm">
                          {detailOrder.notes && (
                            <p className="text-sm text-muted-foreground italic">
                              "{detailOrder.notes}"
                            </p>
                          )}
                          {!detailOrder.notes && (
                            <p className="text-xs text-muted-foreground">
                              No notes added.
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs shrink-0"
                          onClick={() => setDetEditing(true)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {detailOrder.status !== "pending" && detailOrder.notes && (
                  <p className="text-sm text-muted-foreground italic px-3 py-2 bg-muted/20 rounded-lg">
                    "{detailOrder.notes}"
                  </p>
                )}

                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Test Items ({detailOrder.items.length})
                  </p>
                  {detailOrder.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setDetShowAdd((v) => !v);
                        setDetExpandedId(null);
                        setDetChecked({});
                      }}
                    >
                      <Plus className="w-3 h-3" />
                      Add Item
                    </Button>
                  )}
                </div>

                {detailOrder.status === "pending" && detShowAdd && (
                  <div className="p-3 bg-muted/20 rounded-xl border border-dashed border-border space-y-3">
                    <Input
                      placeholder="Search catalog..."
                      className="h-8 text-xs"
                      value={detCatSearch}
                      onChange={(e) => setDetCatSearch(e.target.value)}
                    />
                    <div className="max-h-64 overflow-y-auto space-y-1.5">
                      {renderParamPicker(
                        detFilteredCat,
                        detExpandedId,
                        detChecked,
                        toggleDetExpand,
                        toggleDetParam,
                        addDetItem,
                      )}
                    </div>
                    {isAddingItems && (
                      <p className="text-xs text-muted-foreground">
                        Adding item…
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {detailOrder.items.map((item) => {
                    const assignedScientist = scientists.find(
                      (s) => s._id === item.assignedTo,
                    );
                    return (
                      <div
                        key={item._id}
                        className="border border-border rounded-xl p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">
                              {item.testName}
                            </p>
                            {item.sampleType && (
                              <p className="text-xs text-muted-foreground">
                                {item.sampleType}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <ItemStatusBadge status={item.status} />
                            <span className="text-sm font-bold text-primary">
                              ₦{(item.subtotal ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(item.parameters ?? []).map((p) => (
                            <Badge
                              key={p._id}
                              variant="outline"
                              className="text-[10px] px-1.5 text-muted-foreground"
                            >
                              {p.name}
                            </Badge>
                          ))}
                        </div>

                        {assignedScientist && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <User className="w-3 h-3" />
                            {assignedScientist.firstName}{" "}
                            {assignedScientist.lastName}
                          </p>
                        )}

                        <div className="flex gap-2 pt-1">
                          {detailOrder.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                              onClick={() =>
                                handleRemoveItem(detailOrder._id, item._id)
                              }
                              disabled={isRemovingItem}
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </Button>
                          )}
                          {(detailOrder.status === "sample_collected" ||
                            detailOrder.status === "in_progress") &&
                            !item.assignedTo && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs gap-1"
                                onClick={() => {
                                  setAssignItemId(item._id);
                                  setAssignScientist("");
                                }}
                              >
                                <UserPlus className="w-3 h-3" />
                                Assign
                              </Button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    ₦{(detailOrder.totalPrice ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {detailOrder.status === "pending" && (
                <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2 justify-between">
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
                  <Button
                    size="sm"
                    className="gap-1.5"
                    disabled={detailOrder.items.length === 0}
                    onClick={openCollectDialog}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Ready for Collection
                  </Button>
                </SheetFooter>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── COLLECT SAMPLE DIALOG ─── */}
      <Dialog
        open={showCollect}
        onOpenChange={(v) => !v && setShowCollect(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Collect Sample
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-1.5">
              <Label className="text-sm">Container Type *</Label>
              <Input
                placeholder="e.g. EDTA tube"
                value={containerType}
                onChange={(e) => setContainerType(e.target.value)}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">Sample type per item</p>
              {detailOrder?.items.map((item) => (
                <div key={item._id} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {item.testName}
                  </Label>
                  <Input
                    className="h-8 text-sm"
                    value={itemSampleTypes[item._id] ?? ""}
                    onChange={(e) =>
                      setItemSampleTypes((prev) => ({
                        ...prev,
                        [item._id]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCollect(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitCollectSample}
              disabled={isCollecting}
              className="gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCollecting ? "Collecting…" : "Confirm Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── ASSIGN SCIENTIST DIALOG ─── */}
      <Dialog
        open={!!assignItemId}
        onOpenChange={(v) => {
          if (!v) setAssignItemId(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Assign Scientist
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-sm">Select Scientist</Label>
            <Select value={assignScientist} onValueChange={setAssignScientist}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a scientist..." />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStaff && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    Loading staff…
                  </div>
                )}
                {scientists.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    <span>
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="text-muted-foreground text-xs ml-2">
                      ({s.role})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignItemId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!assignScientist || isAssigning}
              className="gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── CREATE ORDER SHEET ─── */}
      <Sheet
        open={showCreate}
        onOpenChange={(v) => {
          if (!v) setShowCreate(false);
        }}
      >
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              New Test Order
            </SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-colors ${
                      createStep >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-0.5 w-8 transition-colors ${createStep > s ? "bg-primary" : "bg-muted"}`}
                    />
                  )}
                </div>
              ))}
              <span className="text-xs text-muted-foreground ml-2">
                {createStep === 1
                  ? "Patient & Priority"
                  : createStep === 2
                    ? "Add Tests"
                    : "Review & Confirm"}
              </span>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {createStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Patient <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="Search by name or ID..."
                    value={coPSearch}
                    onChange={(e) => setCoPSearch(e.target.value)}
                  />
                  {coPSearch && (
                    <div className="border border-border rounded-lg max-h-48 overflow-y-auto divide-y divide-border">
                      {isLoadingPatients && (
                        <p className="text-sm text-muted-foreground p-3">
                          Searching…
                        </p>
                      )}
                      {!isLoadingPatients && patientResults.length === 0 && (
                        <p className="text-sm text-muted-foreground p-3">
                          No patients found.
                        </p>
                      )}
                      {patientResults.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            setCoPatient(p._id);
                            setCoPatientName(`${p.firstName} ${p.lastName}`);
                            setCoPSearch(`${p.firstName} ${p.lastName}`);
                          }}
                          className={`w-full text-left px-3 py-2.5 hover:bg-muted/30 transition-colors flex items-center gap-2 ${coPatient === p._id ? "bg-primary/10" : ""}`}
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {p.firstName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {p.firstName} {p.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.gender}
                            </p>
                          </div>
                          {coPatient === p._id && (
                            <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {coPatient && (
                    <div className="flex items-center gap-2 text-xs text-success">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {coPatientName} selected
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setCoPriority(p)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          coPriority === p
                            ? p === "stat"
                              ? "bg-destructive/15 text-destructive border-destructive/50"
                              : p === "urgent"
                                ? "bg-warning/15 text-warning border-warning/50"
                                : "bg-primary/10 text-primary border-primary/40"
                            : "border-border text-muted-foreground hover:bg-muted/30"
                        }`}
                      >
                        {PRIORITY_LABEL[p]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>
                    Clinical Notes{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    placeholder="Any clinical context or referral notes..."
                    value={coNotes}
                    onChange={(e) => setCoNotes(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                </div>
              </div>
            )}

            {createStep === 2 && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search catalog tests..."
                    className="pl-9"
                    value={coCatSearch}
                    onChange={(e) => setCoCatSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                  {renderParamPicker(
                    coFilteredCat,
                    coExpandedId,
                    coChecked,
                    toggleCoExpand,
                    toggleCoParam,
                    addCoItem,
                  )}
                </div>

                {coItems.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-2">
                        Added Items ({coItems.length})
                      </p>
                      <div className="space-y-2">
                        {coItems.map((item, idx) => (
                          <div
                            key={item.testCatalogId}
                            className="flex items-start gap-2 p-2.5 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {item.testName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.parameterIds.length} params selected
                              </p>
                            </div>
                            <span className="text-sm font-bold text-primary shrink-0">
                              ₦{(item.subtotal ?? 0).toLocaleString()}
                            </span>
                            <button
                              onClick={() =>
                                setCoItems((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-destructive hover:opacity-70 shrink-0 mt-0.5"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                          <span className="text-sm font-semibold">
                            Grand Total
                          </span>
                          <span className="text-base font-bold text-primary">
                            ₦{coGrandTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {createStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-xl space-y-3 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Patient
                    </span>
                    <span className="text-sm font-medium">{coPatientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Priority
                    </span>
                    <PriorityBadge priority={coPriority} />
                  </div>
                  {coNotes && (
                    <div className="pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Notes:{" "}
                      </span>
                      <span className="text-xs italic">{coNotes}</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2">Test Items</p>
                  <div className="space-y-2">
                    {coItems.map((item) => (
                      <div
                        key={item.testCatalogId}
                        className="p-3 border border-border rounded-xl space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{item.testName}</p>
                          <span className="text-sm font-bold text-primary">
                            ₦{(item.subtotal ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.paramNames.map((name) => (
                            <Badge
                              key={name}
                              variant="outline"
                              className="text-[10px] px-1.5 text-muted-foreground"
                            >
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="font-semibold">Grand Total</span>
                      <span className="text-lg font-bold text-primary">
                        ₦{coGrandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2 justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (createStep > 1)
                  setCreateStep((prev) => (prev - 1) as 1 | 2 | 3);
                else setShowCreate(false);
              }}
            >
              {createStep === 1 ? "Cancel" : "Back"}
            </Button>
            {createStep < 3 ? (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={createStep === 1 ? !coPatient : coItems.length === 0}
                onClick={() => setCreateStep((prev) => (prev + 1) as 1 | 2 | 3)}
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={submitOrder}
                disabled={isCreating}
              >
                <CheckCircle2 className="w-4 h-4" />
                Place Order
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
