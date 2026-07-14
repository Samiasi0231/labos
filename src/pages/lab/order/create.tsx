import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Plus,
  Search,
  Zap,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  X,
  ClipboardList,
  TestTube,
  Layers,
  User,
} from "lucide-react";

import { usePatientSearch } from "@/hooks/use-patients";
import { useStaffSearch } from "@/hooks/use-staff";
import { useTestCatalogList } from "@/hooks/use-test-catalog";
import type { TestCatalogEntry } from "@/api/types/test-catalog";

import { useMutation } from "@/hooks/use-api";
import type {
  TestOrder,
  TestOrderItem,
  TestOrderPriority,
  CreateTestOrderPayload,
  CollectSamplePayload,
  AssignTestOrderItemPayload,
} from "@/api/types/test-order";

import { get } from "@/api/fetcher";
import endpoint from "@/api/endpoints";
import { useToast } from "@/hooks/use-toast";

// ── Constants ──────────────────────────────────────────────────────────────────

const PRIORITIES: TestOrderPriority[] = ["routine", "urgent", "stat"];
const PRIORITY_LABEL: Record<TestOrderPriority, string> = {
  routine: "Routine",
  urgent: "Urgent",
  stat: "STAT",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface StagedItem {
  testCatalogId: string;
  testName: string;
  samples: string[];
  parameterIds: string[];
  paramNames: string[];
  subtotal: number;
}

export interface CreateOrderInitialState {
  patientId?: string;
  patientName?: string;
}

export interface CreateOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialState?: CreateOrderInitialState;
}

// ── Badges ─────────────────────────────────────────────────────────────────────

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

// ── Create Order Sheet ─────────────────────────────────────────────────────────

export function CreateOrderSheet({ open, onOpenChange, initialState }: CreateOrderSheetProps) {
  const { toast } = useToast();

  // ── API hooks ────────────────────────────────────────────────────────────────
  const { trigger: createOrder, isLoading: isCreating } = useMutation<TestOrder, CreateTestOrderPayload>(
    endpoint.lab.testOrders.create,
    { skipErrorHandling: true, invalidate: [endpoint.lab.testOrders.list] },
  );
  const { trigger: collectSample } = useMutation<TestOrderItem, CollectSamplePayload>(
    "test-orders/collect-sample",
    { skipErrorHandling: true, invalidate: [endpoint.lab.testOrders.list] },
  );
  const { trigger: assignTestOrderItem } = useMutation<TestOrderItem, AssignTestOrderItemPayload>(
    "test-orders/assign-item",
    { method: "PATCH", skipErrorHandling: true, invalidate: [endpoint.lab.testOrders.list] },
  );
  const { tests: catalogTests, isLoading: isLoadingCatalog } = useTestCatalogList({ isActive: true, limit: 100 });

  // ── Wizard state ─────────────────────────────────────────────────────────────
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);

  // Step 1 — Patient + Tests + Priority + Notes
  const [coPSearch, setCoPSearch] = useState("");
  const [coPatient, setCoPatient] = useState("");
  const [coPatientName, setCoPatientName] = useState("");
  const [coPriority, setCoPriority] = useState<TestOrderPriority>("routine");
  const [coNotes, setCoNotes] = useState("");
  const [coItems, setCoItems] = useState<StagedItem[]>([]);
  const [coCatSearch, setCoCatSearch] = useState("");
  const [coExpandedId, setCoExpandedId] = useState<string | null>(null);
  const [coChecked, setCoChecked] = useState<Record<string, Set<string>>>({});

  // Step 2 — Samples per test
  const [coSampleDescs, setCoSampleDescs] = useState<Record<string, string[]>>({});

  // Step 3 — Assign per test (testCatalogId → membershipId)
  const [coAssignments, setCoAssignments] = useState<Record<string, string>>({});
  const [coAssignNames, setCoAssignNames] = useState<Record<string, string>>({});
  const [coActiveTestId, setCoActiveTestId] = useState<string | null>(null);
  const [coStaffQ, setCoStaffQ] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Patient search
  const { patients: patientResults, isLoading: isLoadingPatients } = usePatientSearch(coPSearch);

  // Staff search — fires when picking scientist in Step 3
  const { staff: staffResults, isLoading: isLoadingStaff } = useStaffSearch(coStaffQ);

  // ── Reset on open / apply initialState ───────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setCreateStep(1);
    setCoPSearch(initialState?.patientName ?? "");
    setCoPatient(initialState?.patientId ?? "");
    setCoPatientName(initialState?.patientName ?? "");
    setCoPriority("routine");
    setCoNotes("");
    setCoItems([]);
    setCoCatSearch("");
    setCoExpandedId(null);
    setCoChecked({});
    setCoSampleDescs({});
    setCoAssignments({});
    setCoAssignNames({});
    setCoActiveTestId(null);
    setCoStaffQ("");
  }, [open]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const coGrandTotal = coItems.reduce((s, i) => s + i.subtotal, 0);
  const coFilteredCat = catalogTests.filter((t) =>
    t.name.toLowerCase().includes(coCatSearch.toLowerCase()),
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const toggleCoExpand = (testId: string) => {
    if (coExpandedId === testId) { setCoExpandedId(null); return; }
    setCoExpandedId(testId);
    const test = catalogTests.find((t) => t._id === testId);
    if (test && !coChecked[testId]) {
      setCoChecked((prev) => ({ ...prev, [testId]: new Set(test.parameters.map((p) => p._id)) }));
    }
  };

  const toggleCoParam = (testId: string, paramId: string) => {
    setCoChecked((prev) => {
      const s = new Set(prev[testId] ?? []);
      if (s.has(paramId)) s.delete(paramId); else s.add(paramId);
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
      toast({ title: `${test.name} is already on this order`, variant: "destructive" });
      return;
    }
    const selectedParams = test.parameters.filter((p) => paramSet.has(p._id));
    const subtotal = selectedParams.reduce((s, p) => s + (p.price ?? 0), 0);
    setCoItems((prev) => [
      ...prev,
      {
        testCatalogId: test._id,
        testName: test.name,
        samples: test.samples ?? [],
        parameterIds: selectedParams.map((p) => p._id),
        paramNames: selectedParams.map((p) => p.name),
        subtotal,
      },
    ]);
    setCoExpandedId(null);
    toast({ description: `${test.name} added.` });
  };

  const goToStep2 = () => {
    if (!coPatient) { toast({ title: "Select a patient first", variant: "destructive" }); return; }
    if (coItems.length === 0) { toast({ title: "Add at least one test", variant: "destructive" }); return; }
    setCoSampleDescs((prev) => {
      const next = { ...prev };
      for (const item of coItems) {
        if (!next[item.testCatalogId]) {
          next[item.testCatalogId] = item.samples.length > 0 ? [...item.samples] : [""];
        }
      }
      return next;
    });
    setCreateStep(2);
  };

  const goToStep3 = () => {
    const missing = coItems.find(
      (i) => !coSampleDescs[i.testCatalogId]?.some((s) => s.trim()),
    );
    if (missing) {
      toast({
        title: "Missing sample info",
        description: `Enter at least one sample for "${missing.testName}".`,
        variant: "destructive",
      });
      return;
    }
    setCreateStep(3);
  };

  const submitOrder = async () => {
    if (!coPatient) return;
    setIsSubmitting(true);
    try {
      const payload: CreateTestOrderPayload = {
        patient: coPatient,
        priority: coPriority,
        notes: coNotes || undefined,
        items: coItems.map((i) => ({
          testCatalogId: i.testCatalogId,
          parameterIds: i.parameterIds,
        })),
      };
      const createRes = await createOrder(payload);
      if (!createRes) throw new Error("Failed to create test order");
      const created = createRes.data;

      const populatedRes = await get<TestOrder>(endpoint.lab.testOrders.get(created._id));
      const populatedItems = populatedRes.data?.items ?? [];

      for (const item of populatedItems) {
        const samples = (coSampleDescs[item.testCatalog] ?? []).filter((s) => s.trim());
        if (samples.length > 0) {
          await collectSample(
            { samples, materials: [] },
            endpoint.lab.testOrders.collectSample(created._id, item._id),
          );
        }
      }

      for (const item of populatedItems) {
        const staffId = coAssignments[item.testCatalog];
        if (staffId) {
          await assignTestOrderItem(
            { assignedTo: staffId },
            endpoint.lab.testOrders.assignItem(created._id, item._id),
          );
        }
      }

      onOpenChange(false);
      toast({
        title: "Order placed",
        description: `Order for ${coPatientName} has been created and samples recorded.`,
      });
    } catch {
      toast({ title: "Failed to create order", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <SheetContent className="sm:max-w-xl w-full overflow-y-auto flex flex-col gap-0 p-0">

        {/* Header + step indicator */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            New Test Order
          </SheetTitle>
          <div className="flex items-center gap-2 mt-2">
            {[
              { n: 1, icon: ClipboardList },
              { n: 2, icon: TestTube },
              { n: 3, icon: Layers },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold transition-colors ${
                    createStep >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {createStep > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
                </div>
                {i < 2 && (
                  <div className={`h-0.5 w-8 transition-colors ${createStep > s.n ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {createStep === 1 ? "Select Tests" : createStep === 2 ? "Collect Samples" : "Assign & Confirm"}
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── STEP 1: Patient + Priority + Tests ── */}
          {createStep === 1 && (
            <div className="space-y-5">

              {/* Patient search */}
              <div className="space-y-2">
                <Label>Patient <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email or code…"
                    className="pl-9"
                    value={coPSearch}
                    onChange={(e) => { setCoPSearch(e.target.value); setCoPatient(""); setCoPatientName(""); }}
                  />
                </div>
                {coPSearch.trim().length >= 2 && (
                  <div className="border border-border rounded-lg max-h-48 overflow-y-auto divide-y divide-border">
                    {isLoadingPatients && (
                      <p className="text-sm text-muted-foreground p-3">Searching…</p>
                    )}
                    {!isLoadingPatients && patientResults.length === 0 && (
                      <p className="text-sm text-muted-foreground p-3">No patients found.</p>
                    )}
                    {patientResults.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => {
                          setCoPatient(p._id);
                          const name = `${p.firstName} ${p.lastName}`;
                          setCoPatientName(name);
                          setCoPSearch(name);
                        }}
                        className={`w-full text-left px-3 py-2.5 hover:bg-muted/30 transition-colors flex items-center gap-2.5 ${
                          coPatient === p._id ? "bg-primary/10" : ""
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {p.firstName[0]}{p.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-muted-foreground">{p.code}</p>
                        </div>
                        {coPatient === p._id && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
                {coPatient && (
                  <p className="text-xs text-success flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {coPatientName} selected
                  </p>
                )}
              </div>

              {/* Priority + Notes */}
              <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Priority</Label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setCoPriority(p)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
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
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Notes <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    placeholder="Clinical context or special instructions…"
                    value={coNotes}
                    onChange={(e) => setCoNotes(e.target.value)}
                    className="min-h-[52px] text-xs resize-none"
                  />
                </div>
              </div>

              <Separator />

              {/* Test catalog browser */}
              <div className="space-y-2">
                <Label>Select Tests <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search catalog tests…"
                    className="pl-9"
                    value={coCatSearch}
                    onChange={(e) => setCoCatSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {isLoadingCatalog && (
                    <p className="text-sm text-muted-foreground text-center py-6">Loading catalog…</p>
                  )}
                  {!isLoadingCatalog && coFilteredCat.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">No tests found.</p>
                  )}
                  {coFilteredCat.map((test) => {
                    const isExpanded = coExpandedId === test._id;
                    const paramSet = coChecked[test._id] ?? new Set();
                    const subtotal = test.parameters
                      .filter((p) => paramSet.has(p._id))
                      .reduce((s, p) => s + (p.price ?? 0), 0);
                    const alreadyAdded = coItems.some((i) => i.testCatalogId === test._id);
                    return (
                      <div key={test._id} className={`border border-border rounded-lg overflow-hidden ${alreadyAdded ? "opacity-50" : ""}`}>
                        <button
                          onClick={() => !alreadyAdded && toggleCoExpand(test._id)}
                          disabled={alreadyAdded}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/30 transition-colors text-left disabled:cursor-not-allowed"
                        >
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{test.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {test.code} · {test.parameters.length} params · {test.samples?.join(", ")}
                            </p>
                          </div>
                          {alreadyAdded && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">Added</Badge>
                          )}
                        </button>
                        {isExpanded && (
                          <div className="border-t border-border bg-muted/10 px-3 pb-3 pt-2 space-y-2">
                            <div className="space-y-1.5">
                              {test.parameters.map((param) => (
                                <div key={param._id} className="flex items-center gap-2.5">
                                  <Checkbox
                                    id={`${test._id}-${param._id}`}
                                    checked={paramSet.has(param._id)}
                                    onCheckedChange={() => toggleCoParam(test._id, param._id)}
                                  />
                                  <label
                                    htmlFor={`${test._id}-${param._id}`}
                                    className="flex-1 flex items-center justify-between text-xs cursor-pointer"
                                  >
                                    <span>
                                      {param.name}
                                      {param.unit && <span className="text-muted-foreground"> ({param.unit})</span>}
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
                                Subtotal: <span className="text-primary">₦{subtotal.toLocaleString()}</span>
                              </span>
                              <Button
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => addCoItem(test)}
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
              </div>

              {/* Added tests summary */}
              {coItems.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold mb-2">Added Tests ({coItems.length})</p>
                    <div className="space-y-2">
                      {coItems.map((item, idx) => (
                        <div key={item.testCatalogId} className="flex items-start gap-2 p-2.5 bg-muted/30 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.testName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.parameterIds.length} params · {item.samples.join(", ")}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary shrink-0">
                            ₦{item.subtotal.toLocaleString()}
                          </span>
                          <button
                            onClick={() => setCoItems((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-destructive hover:opacity-70 shrink-0 mt-0.5"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center justify-between p-2.5 bg-primary/5 rounded-lg border border-primary/10">
                        <span className="text-sm font-semibold">Grand Total</span>
                        <span className="text-base font-bold text-primary">₦{coGrandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 2: Confirm Sample Collection ── */}
          {createStep === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Record Sample Collection</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Confirm what was physically collected for each test. Pre-filled from catalog.
                </p>
              </div>

              {coItems.map((item) => (
                <Card key={item.testCatalogId} className="border shadow-sm">
                  <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TestTube className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.testName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.parameterIds.length} params · ₦{item.subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Samples collected <span className="text-destructive">*</span>
                      </Label>
                      {(coSampleDescs[item.testCatalogId] ?? [""]).map((val, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder="e.g. EDTA whole blood…"
                            value={val}
                            onChange={(e) =>
                              setCoSampleDescs((prev) => {
                                const arr = [...(prev[item.testCatalogId] ?? [""])];
                                arr[idx] = e.target.value;
                                return { ...prev, [item.testCatalogId]: arr };
                              })
                            }
                          />
                          {(coSampleDescs[item.testCatalogId]?.length ?? 1) > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 shrink-0 text-destructive hover:text-destructive"
                              onClick={() =>
                                setCoSampleDescs((prev) => {
                                  const arr = [...(prev[item.testCatalogId] ?? [])];
                                  arr.splice(idx, 1);
                                  return { ...prev, [item.testCatalogId]: arr };
                                })
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 mt-1"
                        onClick={() =>
                          setCoSampleDescs((prev) => ({
                            ...prev,
                            [item.testCatalogId]: [...(prev[item.testCatalogId] ?? [""]), ""],
                          }))
                        }
                      >
                        <Plus className="w-3 h-3" />
                        Add sample
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ── STEP 3: Assign & Confirm ── */}
          {createStep === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold">Assign Professionals</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Optionally assign a scientist or manager to each test. You can also assign later from the order detail page.
                </p>
              </div>

              {coItems.map((item) => {
                const isActive = coActiveTestId === item.testCatalogId;
                const assignedName = coAssignNames[item.testCatalogId];
                return (
                  <div key={item.testCatalogId} className="border border-border rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.testName}</p>
                        <p className="text-xs text-muted-foreground">
                          {coSampleDescs[item.testCatalogId] || "—"} · {item.parameterIds.length} params
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary shrink-0">
                        ₦{item.subtotal.toLocaleString()}
                      </span>
                    </div>

                    {assignedName ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-1 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          {assignedName}
                        </div>
                        <button
                          className="text-xs text-primary hover:underline"
                          onClick={() => {
                            setCoActiveTestId(item.testCatalogId);
                            setCoStaffQ("");
                          }}
                        >
                          Change
                        </button>
                        <button
                          className="text-xs text-destructive hover:underline"
                          onClick={() => {
                            setCoAssignments((prev) => { const n = { ...prev }; delete n[item.testCatalogId]; return n; });
                            setCoAssignNames((prev) => { const n = { ...prev }; delete n[item.testCatalogId]; return n; });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                        onClick={() => {
                          setCoActiveTestId(item.testCatalogId);
                          setCoStaffQ("");
                        }}
                      >
                        <Plus className="w-3 h-3" />
                        Assign scientist
                      </button>
                    )}

                    {/* Inline staff search */}
                    {isActive && (
                      <div className="border border-border rounded-lg overflow-hidden mt-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input
                            autoFocus
                            placeholder="Search by name or email…"
                            className="pl-8 h-8 text-xs border-0 border-b border-border rounded-none"
                            value={coStaffQ}
                            onChange={(e) => setCoStaffQ(e.target.value)}
                          />
                        </div>
                        <div className="max-h-44 overflow-y-auto divide-y divide-border">
                          {isLoadingStaff && (
                            <p className="text-xs text-muted-foreground p-2.5">Searching…</p>
                          )}
                          {!isLoadingStaff && coStaffQ.trim().length > 0 && staffResults.length === 0 && (
                            <p className="text-xs text-muted-foreground p-2.5">No staff found.</p>
                          )}
                          {!isLoadingStaff && coStaffQ.trim().length === 0 && (
                            <p className="text-xs text-muted-foreground p-2.5">Type a name to search…</p>
                          )}
                          {staffResults
                            .filter((s) => s.role === "scientist" || s.role === "manager")
                            .map((s) => (
                              <button
                                key={s._id}
                                type="button"
                                onClick={() => {
                                  setCoAssignments((prev) => ({ ...prev, [item.testCatalogId]: s._id }));
                                  setCoAssignNames((prev) => ({
                                    ...prev,
                                    [item.testCatalogId]: `${s.user.firstName} ${s.user.lastName}`,
                                  }));
                                  setCoActiveTestId(null);
                                  setCoStaffQ("");
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-muted/30 transition-colors flex items-center gap-2.5"
                              >
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[10px] font-bold text-primary">
                                    {s.user.firstName[0]}{s.user.lastName[0]}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium truncate">
                                    {s.user.firstName} {s.user.lastName}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground capitalize">{s.role}</p>
                                </div>
                              </button>
                            ))}
                        </div>
                        <div className="border-t border-border p-1.5">
                          <button
                            className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
                            onClick={() => { setCoActiveTestId(null); setCoStaffQ(""); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Order summary */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 space-y-2 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Patient</span>
                  <span className="font-medium">{coPatientName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tests</span>
                  <span className="font-medium">{coItems.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Priority</span>
                  <PriorityBadge priority={coPriority} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Grand Total</span>
                  <span className="text-lg font-bold text-primary">₦{coGrandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2 justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (createStep > 1) setCreateStep((prev) => (prev - 1) as 1 | 2 | 3);
              else onOpenChange(false);
            }}
          >
            {createStep === 1 ? "Cancel" : "Back"}
          </Button>

          {createStep === 1 && (
            <Button size="sm" disabled={!coPatient || coItems.length === 0} onClick={goToStep2}>
              Collect Samples →
            </Button>
          )}
          {createStep === 2 && (
            <Button size="sm" onClick={goToStep3}>
              Assign Professionals →
            </Button>
          )}
          {createStep === 3 && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={submitOrder}
              disabled={isSubmitting || isCreating}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Placing Order…" : "Place Order"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
