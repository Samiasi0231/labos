import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  MoreHorizontal,
  Check,
  X,
  PlusCircle,
  TestTube,
  FlaskConical,
  Droplet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useTestCatalogList,
  useCreateTest,
  useUpdateTest,
  useRemoveTest,
  useUpdateTestStatus,
  useAddParameter,
  useRemoveParameter,
} from "@/hooks/use-test-catalog";
import { useInventoryList } from "@/hooks/use-inventory";
import { unslugify } from "@/lib/slug";
import type {
  TestCatalogEntry,
  ParamType,
  ReferenceRange,
} from "@/api/types/test-catalog";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_SUGGESTIONS = [
  "Haematology",
  "Biochemistry",
  "Parasitology",
  "Microbiology",
  "Serology",
  "Endocrinology",
];

const SAMPLE_TYPES = [
  "Whole Blood",
  "Venous Blood",
  "Capillary Blood",
  "Urine",
  "Stool",
  "Swab",
  "CSF",
  "Sputum",
  "Other",
];

type RangeTab = "Male" | "Female" | "General";

// ── Wizard state types ────────────────────────────────────────────────────────

interface WizardBasic {
  name: string;
  code: string;
  category: string;
  samples: string[];
  turnaround: string;
}

interface ParamFormState {
  name: string;
  price: string;
  unit: string;
  type: ParamType;
  rangeTab: RangeTab;
  ranges: Record<RangeTab, { min: string; max: string }>;
  options: string[];
  optionDraft: string;
  error: string;
}

interface PendingParam {
  id: string;
  name: string;
  price: number;
  unit?: string;
  type: ParamType;
  referenceRange?: ReferenceRange;
  options?: string[];
}

interface PendingMaterial {
  id: string;
  itemId: string;
  name: string;
  phase: "collection" | "analysis";
}

// ── Edit form state (unchanged from existing) ─────────────────────────────────

interface EditFormState {
  name: string;
  code: string;
  category: string;
  turnaroundTime: string;
  samples: string[];
  parameters: TestCatalogEntry["parameters"];
}

interface EditParamState {
  name: string;
  unit: string;
  type: ParamType;
  refMaleMin: string;
  refMaleMax: string;
  refFemaleMin: string;
  refFemaleMax: string;
  options: string;
  price: string;
}

const emptyEditParam: EditParamState = {
  name: "",
  unit: "",
  type: "numeric",
  refMaleMin: "",
  refMaleMax: "",
  refFemaleMin: "",
  refFemaleMax: "",
  options: "",
  price: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyRanges(): Record<RangeTab, { min: string; max: string }> {
  return { Male: { min: "", max: "" }, Female: { min: "", max: "" }, General: { min: "", max: "" } };
}

function emptyParamForm(): ParamFormState {
  return { name: "", price: "", unit: "", type: "numeric", rangeTab: "Male", ranges: emptyRanges(), options: [], optionDraft: "", error: "" };
}

function buildRangeForEdit(p: EditParamState): ReferenceRange | undefined {
  if (p.type !== "numeric") return undefined;
  const range: ReferenceRange = {};
  if (p.refMaleMin && p.refMaleMax) range.male = { min: Number(p.refMaleMin), max: Number(p.refMaleMax) };
  if (p.refFemaleMin && p.refFemaleMax) range.female = { min: Number(p.refFemaleMin), max: Number(p.refFemaleMax) };
  return Object.keys(range).length > 0 ? range : undefined;
}

function buildRangeForWizard(pf: ParamFormState): ReferenceRange | undefined {
  if (pf.type !== "numeric") return undefined;
  const range: ReferenceRange = {};
  const m = pf.ranges.Male;
  const f = pf.ranges.Female;
  const g = pf.ranges.General;
  if (m.min && m.max) range.male = { min: Number(m.min), max: Number(m.max) };
  if (f.min && f.max) range.female = { min: Number(f.min), max: Number(f.max) };
  if (g.min && g.max) range.general = { min: Number(g.min), max: Number(g.max) };
  return Object.keys(range).length > 0 ? range : undefined;
}

// ── Step Indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ["Basic Info", "Parameters", "Materials"] as const;

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-start w-full">
      {STEP_LABELS.map((label, idx) => {
        const num = idx + 1;
        const isDone = num < step;
        const isActive = num === step;
        const isLast = idx === STEP_LABELS.length - 1;
        return (
          <div key={label} className={`flex items-center ${isLast ? "flex-shrink-0" : "flex-1 min-w-0"}`}>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <span
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 border-box
                  ${isDone ? "bg-primary text-primary-foreground border-0" : ""}
                  ${isActive ? "bg-card text-primary border-2 border-primary" : ""}
                  ${!isDone && !isActive ? "bg-muted text-muted-foreground border border-border" : ""}
                `}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : num}
              </span>
              <span
                className={`text-[10.5px] text-center leading-tight max-w-[72px] break-words
                  ${isActive ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}
                `}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-[2px] mx-1 mb-[18px] ${num < step ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TestCatalog() {
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const { tests, isLoading, listUrl } = useTestCatalogList({
    search: search || undefined,
    category: catFilter === "All" ? undefined : catFilter,
    limit: 200,
  });

  const { createTest, isLoading: isCreating } = useCreateTest([listUrl]);
  const { updateTest } = useUpdateTest([listUrl]);
  const { removeTest } = useRemoveTest([listUrl]);
  const { updateStatus } = useUpdateTestStatus([listUrl]);
  const { addParameter } = useAddParameter([listUrl]);
  const { removeParameter } = useRemoveParameter([listUrl]);

  // Inventory items for Step 3 material search
  const { items: allItems } = useInventoryList({ limit: 100 });

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<TestCatalogEntry | null>(null);

  // ── Wizard (Add) state ──
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [step1Error, setStep1Error] = useState("");
  const [basic, setBasic] = useState<WizardBasic>({ name: "", code: "", category: "", sampleType: "", turnaround: "" });
  const [pendingParams, setPendingParams] = useState<PendingParam[]>([]);
  const [paramFormOpen, setParamFormOpen] = useState(false);
  const [pf, setPf] = useState<ParamFormState>(emptyParamForm());
  const [pendingMaterials, setPendingMaterials] = useState<PendingMaterial[]>([]);
  const [matFormOpen, setMatFormOpen] = useState({ collection: false, analysis: false });
  const [matSearch, setMatSearch] = useState({ collection: "", analysis: "" });
  const [matSelectedId, setMatSelectedId] = useState({ collection: "", analysis: "" });

  // ── Edit state (unchanged logic) ──
  const [editingTest, setEditingTest] = useState<TestCatalogEntry | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({ name: "", code: "", category: "", turnaroundTime: "", sampleType: "", parameters: [] });
  const [newParam, setNewParam] = useState<EditParamState>(emptyEditParam);

  const categoriesInUse = useMemo(() => {
    const set = new Set(tests.map((t) => t.category));
    return Array.from(set);
  }, [tests]);

  const avgParams =
    tests.length > 0
      ? Math.round(tests.reduce((s, t) => s + t.parameters.length, 0) / tests.length)
      : 0;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  // ── Wizard handlers ──

  const openWizard = () => {
    setBasic({ name: "", code: "", category: "", samples: [], turnaround: "" });
    setPendingParams([]);
    setPendingMaterials([]);
    setParamFormOpen(false);
    setPf(emptyParamForm());
    setMatFormOpen({ collection: false, analysis: false });
    setMatSearch({ collection: "", analysis: "" });
    setMatSelectedId({ collection: "", analysis: "" });
    setStep1Error("");
    setWizardStep(1);
    setWizardOpen(true);
  };

  const closeWizard = () => setWizardOpen(false);

  const goNext = () => {
    if (wizardStep === 1) {
      if (!basic.name.trim() || !basic.code.trim()) {
        setStep1Error("Test Name and Test Code are required.");
        return;
      }
      setStep1Error("");
      setWizardStep(2);
    } else if (wizardStep === 2) {
      setWizardStep(3);
    }
  };

  const goBack = () => {
    if (wizardStep === 2) setWizardStep(1);
    else if (wizardStep === 3) setWizardStep(2);
  };

  const saveParam = () => {
    if (!pf.name.trim()) { setPf((p) => ({ ...p, error: "Parameter name is required." })); return; }
    if (pf.price === "" || parseFloat(pf.price) < 0) { setPf((p) => ({ ...p, error: "Enter a valid price (0 or more)." })); return; }
    const entry: PendingParam = {
      id: `param-${Date.now()}`,
      name: pf.name.trim(),
      price: parseFloat(pf.price) || 0,
      unit: pf.type !== "select" ? pf.unit.trim() || undefined : undefined,
      type: pf.type,
      referenceRange: buildRangeForWizard(pf),
      options: pf.type === "select" ? pf.options : undefined,
    };
    setPendingParams((prev) => [...prev, entry]);
    setPf(emptyParamForm());
    setParamFormOpen(false);
  };

  const addMatItem = (phase: "collection" | "analysis") => {
    const selId = matSelectedId[phase];
    if (!selId) return;
    const item = allItems.find((i) => i._id === selId);
    if (!item) return;
    setPendingMaterials((prev) => [
      ...prev,
      { id: `mat-${Date.now()}`, itemId: item._id, name: item.name, phase },
    ]);
    setMatFormOpen((prev) => ({ ...prev, [phase]: false }));
    setMatSearch((prev) => ({ ...prev, [phase]: "" }));
    setMatSelectedId((prev) => ({ ...prev, [phase]: "" }));
  };

  const handleCreateTest = async () => {
    if (!basic.name.trim() || !basic.code.trim() || !basic.category.trim() || basic.samples.length === 0 || !basic.turnaround) {
      toast({ title: "Required fields missing", description: "Please complete all fields in Step 1.", variant: "destructive" });
      return;
    }
    try {
      await createTest({
        name: basic.name.trim(),
        code: basic.code.trim().toUpperCase(),
        category: basic.category.trim(),
        turnaroundTime: Number(basic.turnaround),
        samples: basic.samples,
        parameters: pendingParams.map((p) => ({
          name: p.name,
          unit: p.unit,
          type: p.type,
          options: p.options,
          referenceRange: p.referenceRange,
          price: p.price,
        })),
        materials: pendingMaterials.map((m) => ({
          inventoryItem: m.itemId,
          phase: m.phase,
        })),
      });
      toast({
        title: "Test created",
        description: `${basic.name.trim()} added with ${pendingParams.length} parameter${pendingParams.length !== 1 ? "s" : ""}.`,
      });
      closeWizard();
    } catch {
      toast({ title: "Failed to create test", variant: "destructive" });
    }
  };

  // ── Edit handlers (unchanged logic) ──

  const openEdit = (t: TestCatalogEntry) => {
    setEditForm({
      name: t.name,
      code: t.code,
      category: unslugify(t.category),
      turnaroundTime: String(t.turnaroundTime),
      samples: t.samples ?? [],
      parameters: t.parameters,
    });
    setNewParam(emptyEditParam);
    setEditingTest(t);
  };

  const buildReferenceRangeEdit = (p: EditParamState): ReferenceRange | undefined => buildRangeForEdit(p);

  const addParamToExistingTest = async () => {
    if (!editingTest) return;
    if (!newParam.name) { toast({ title: "Parameter name required", variant: "destructive" }); return; }
    try {
      const updated = await addParameter(editingTest._id, {
        name: newParam.name,
        unit: newParam.type !== "select" ? newParam.unit || undefined : undefined,
        type: newParam.type,
        options: newParam.type === "select" ? newParam.options.split(",").map((o) => o.trim()).filter(Boolean) : undefined,
        referenceRange: buildReferenceRangeEdit(newParam),
        price: Number(newParam.price) || 0,
      });
      if (updated) {
        setEditForm((prev) => ({ ...prev, parameters: updated.parameters }));
        setEditingTest(updated);
      }
      setNewParam(emptyEditParam);
      toast({ title: "Parameter added" });
    } catch {
      toast({ title: "Failed to add parameter", variant: "destructive" });
    }
  };

  const handleRemoveExistingParam = async (paramId: string) => {
    if (!editingTest) return;
    try {
      const updated = await removeParameter(editingTest._id, paramId);
      if (updated) {
        setEditForm((prev) => ({ ...prev, parameters: updated.parameters }));
        setEditingTest(updated);
      }
      toast({ title: "Parameter removed" });
    } catch {
      toast({ title: "Failed to remove parameter", variant: "destructive" });
    }
  };

  const handleEditSave = async () => {
    if (!editingTest || !editForm.name || !editForm.category || !editForm.turnaroundTime || editForm.samples.length === 0) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    try {
      await updateTest(editingTest._id, {
        name: editForm.name,
        category: editForm.category,
        turnaroundTime: Number(editForm.turnaroundTime),
        samples: editForm.samples,
      });
      toast({ title: "Test updated", description: `${editForm.name} has been updated.` });
      setEditingTest(null);
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await removeTest(deleteConfirm._id);
      toast({ title: "Test deleted", description: `${deleteConfirm.name} removed.` });
    } catch {
      toast({ title: "Cannot delete test", description: "This test has existing orders. Deactivate it instead.", variant: "destructive" });
    }
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (t: TestCatalogEntry) => {
    try {
      await updateStatus(t._id, !t.isActive);
      toast({ title: t.isActive ? "Test deactivated" : "Test activated" });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const formatRefRange = (range?: ReferenceRange, key: "male" | "female" = "male") => {
    const v = range?.[key] || range?.general;
    if (!v) return "—";
    return `${v.min}–${v.max}`;
  };

  // ── Material phase helpers ──
  const filteredMatItems = (phase: "collection" | "analysis") => {
    const q = matSearch[phase].trim().toLowerCase();
    const alreadyAdded = new Set(pendingMaterials.filter((m) => m.phase === phase).map((m) => m.itemId));
    return allItems
      .filter((i) => !alreadyAdded.has(i._id) && (!q || i.name.toLowerCase().includes(q)))
      .slice(0, 6);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Test Catalog</h2>
        <p className="text-sm text-muted-foreground">
          View and manage your laboratory test offering with reference parameters
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-primary">{tests.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Tests</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-success">{tests.filter((t) => t.isActive).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Tests</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold">{categoriesInUse.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Categories</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-info">{avgParams}</p>
          <p className="text-xs text-muted-foreground mt-1">Avg Parameters</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search test name or code..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categoriesInUse.map((c) => (
              <SelectItem key={c} value={c}>{unslugify(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="gap-2 flex-shrink-0" onClick={openWizard}>
          <Plus className="w-4 h-4" />
          Add Test
        </Button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", slug: "All", count: tests.length },
          ...categoriesInUse.map((c) => ({
            label: unslugify(c),
            slug: c,
            count: tests.filter((t) => t.category === c).length,
          })),
        ].map(({ label, slug, count }) => (
          <button
            key={slug}
            onClick={() => setCatFilter(slug)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${catFilter === slug
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
              }`}
          >
            {label}{" "}
            <span className={`text-[10px] ${catFilter === slug ? "opacity-70" : "opacity-60"}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Test Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (₦)</TableHead>
              <TableHead>Parameters</TableHead>
              <TableHead>TAT</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                  Loading catalog…
                </TableCell>
              </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                  No tests found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <>
                  <TableRow
                    key={test._id}
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => toggleExpand(test._id)}
                  >
                    <TableCell className="py-3">
                      {expanded.has(test._id)
                        ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-medium text-sm">{test.name}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{test.code}</code>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-xs">{unslugify(test.category)}</Badge>
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-sm">
                      ₦{test.parameters.reduce((sum, p) => sum + (p.price ?? 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {test.parameters.length} params
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {test.turnaroundTime}h
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${test.isActive ? "border-success/30 text-success" : "border-muted text-muted-foreground"}`}
                      >
                        {test.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => openEdit(test)}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => handleToggleActive(test)}>
                            {test.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteConfirm(test)}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expanded.has(test._id) && (
                    <TableRow key={`${test._id}-params`} className="bg-muted/10">
                      <TableCell colSpan={9} className="pb-4 pt-2 px-6">
                        <div className="flex items-center gap-6 mb-3 flex-wrap">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Reference Parameters & Pricing
                          </p>
                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                            <TestTube className="w-3 h-3 text-primary/70" />
                            <span className="font-medium text-foreground">{(test.samples ?? []).join(", ")}</span>
                          </span>
                        </div>
                        {test.parameters.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-4 text-center">No parameters added yet.</p>
                        ) : (
                          <div className="border border-border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                              <span className="col-span-3">Parameter</span>
                              <span className="col-span-1">Type</span>
                              <span className="col-span-1">Unit</span>
                              <span className="col-span-3">Male Ref.</span>
                              <span className="col-span-3">Female Ref.</span>
                              <span className="col-span-1 text-right">Price (₦)</span>
                            </div>
                            <div className="divide-y divide-border">
                              {test.parameters.map((p) => (
                                <div key={p._id} className="grid grid-cols-12 px-3 py-2 text-xs hover:bg-muted/10 items-center">
                                  <span className="col-span-3 font-medium">{p.name}</span>
                                  <span className="col-span-1">
                                    <Badge variant="outline" className={`text-[9px] px-1 h-4 ${p.type === "numeric" ? "border-info/40 text-info" : p.type === "select" ? "border-accent/40 text-accent" : "border-muted text-muted-foreground"}`}>
                                      {p.type}
                                    </Badge>
                                  </span>
                                  <span className="col-span-1 text-muted-foreground font-mono">{p.unit || "—"}</span>
                                  <span className="col-span-3 text-muted-foreground">
                                    {p.type === "select" && p.options?.length ? p.options.join(", ") : formatRefRange(p.referenceRange, "male")}
                                  </span>
                                  <span className="col-span-3 text-muted-foreground">
                                    {p.type === "select" ? "—" : formatRefRange(p.referenceRange, "female")}
                                  </span>
                                  <span className="col-span-1 text-right font-medium text-primary">
                                    ₦{(p.price ?? 0).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ══════════════════ ADD WIZARD ══════════════════ */}
      <Dialog open={wizardOpen} onOpenChange={(v) => !v && closeWizard()}>
        <DialogContent className="sm:max-w-[640px] p-0 gap-0 overflow-hidden">
          <div className="flex flex-col gap-4 max-h-[min(640px,80vh)] w-full box-border overflow-x-hidden">

            {/* Header — fixed */}
            <div className="flex-shrink-0 px-6 pt-6 space-y-4">
              <h2 className="text-[17px] font-semibold">Add New Test</h2>
              <StepIndicator step={wizardStep} />
            </div>

            {/* Body — scrollable */}
            <div className="overflow-y-auto flex-1 min-h-0 px-6 pb-2 pr-[calc(24px-6px)]" style={{ paddingRight: "18px" }}>

              {/* ── Step 1 — Basic Info ── */}
              {wizardStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-[13px]">
                      Test Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Complete Blood Count"
                      value={basic.name}
                      onChange={(e) => setBasic((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <Label className="text-[13px]">
                        Test Code <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        className="font-mono"
                        placeholder="e.g. CBC-001"
                        value={basic.code}
                        onChange={(e) => setBasic((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                      />
                      <p className="text-[11.5px] text-muted-foreground">Unique identifier — uppercase letters and numbers only</p>
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <Label className="text-[13px]">Category</Label>
                      <Input
                        list="cat-suggestions"
                        placeholder="e.g. Haematology"
                        value={basic.category}
                        onChange={(e) => setBasic((p) => ({ ...p, category: e.target.value }))}
                      />
                      <datalist id="cat-suggestions">
                        {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <Label className="text-[13px]">Sample Type</Label>
                      <Select
                        value=""
                        onValueChange={(v) => {
                          if (!basic?.samples?.includes(v))
                            setBasic((p) => ({ ...p, samples: [...p.samples, v] }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add sample type…" />
                        </SelectTrigger>
                        <SelectContent>
                          {SAMPLE_TYPES.filter((s) => !basic?.samples?.includes(s)).map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {basic?.samples?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {basic?.samples?.map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 text-xs font-medium bg-muted border border-border rounded-full py-0.5 pl-2.5 pr-1">
                              {s}
                              <button
                                type="button"
                                className="flex items-center text-muted-foreground hover:text-foreground p-0.5"
                                onClick={() => setBasic((p) => ({ ...p, samples: p?.samples?.filter((x) => x !== s) }))}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <Label className="text-[13px]">Turnaround Time</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          className="pr-14"
                          value={basic.turnaround}
                          onChange={(e) => setBasic((p) => ({ ...p, turnaround: e.target.value }))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          hours
                        </span>
                      </div>
                    </div>
                  </div>
                  {step1Error && (
                    <p className="text-[12px] text-destructive">{step1Error}</p>
                  )}
                </div>
              )}

              {/* ── Step 2 — Parameters ── */}
              {wizardStep === 2 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[.05em] text-muted-foreground">
                      Test Parameters
                    </p>
                    {!paramFormOpen && (
                      <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => { setPf(emptyParamForm()); setParamFormOpen(true); }}>
                        <Plus className="w-3.5 h-3.5" /> Add Parameter
                      </Button>
                    )}
                  </div>

                  {/* Parameter list */}
                  <div className="flex flex-col gap-2">
                    {pendingParams.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border bg-card">
                        <span className="flex-1 min-w-0 text-[13px] font-semibold truncate">{p.name}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 shrink-0 ${p.type === "numeric" ? "border-info/40 text-info" : p.type === "select" ? "border-accent/40 text-accent" : "border-muted text-muted-foreground"}`}>
                          {p.type}
                        </Badge>
                        <span className="text-[13px] font-semibold w-20 text-right shrink-0">
                          ₦{p.price.toLocaleString()}
                        </span>
                        <button
                          className="text-destructive hover:opacity-70 flex-shrink-0 flex items-center"
                          onClick={() => setPendingParams((prev) => prev.filter((x) => x.id !== p.id))}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {pendingParams.length === 0 && !paramFormOpen && (
                      <div className="text-center py-5 border border-dashed border-border rounded-xl text-muted-foreground text-[13px]">
                        No parameters added yet — parameters can also be added later.
                      </div>
                    )}
                  </div>

                  {/* Inline parameter form */}
                  {paramFormOpen && (
                    <div className="border border-primary/30 bg-primary/[.04] rounded-xl p-4 flex flex-col gap-3.5">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-[13px]">
                          Parameter Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="e.g. Haemoglobin"
                          value={pf.name}
                          onChange={(e) => setPf((p) => ({ ...p, name: e.target.value, error: "" }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <Label className="text-[13px]">
                            Price <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground pointer-events-none">₦</span>
                            <Input
                              type="number"
                              min="0"
                              className="pl-6 w-full"
                              value={pf.price}
                              onChange={(e) => setPf((p) => ({ ...p, price: e.target.value, error: "" }))}
                            />
                          </div>
                        </div>
                        {pf.type !== "select" && (
                          <div className="flex flex-col gap-1.5 min-w-0">
                            <Label className="text-[13px]">Unit</Label>
                            <Input
                              placeholder="e.g. g/dL, mmol/L"
                              className="w-full"
                              value={pf.unit}
                              onChange={(e) => setPf((p) => ({ ...p, unit: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>

                      {/* Type segmented button */}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-[13px]">Type</Label>
                        <p className="text-[11.5px] text-muted-foreground -mt-1">Determines how a scientist enters this parameter's result</p>
                        <div className="inline-flex border border-border rounded-lg overflow-hidden w-fit">
                          {(["Numeric", "Text", "Select"] as const).map((t, i, arr) => (
                            <button
                              key={t}
                              type="button"
                              className={`px-4 py-[7px] text-[12.5px] font-semibold transition-colors ${i < arr.length - 1 ? "border-r border-border" : ""} ${pf.type === t.toLowerCase() ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted/40"}`}
                              onClick={() => setPf((p) => ({ ...emptyParamForm(), name: p.name, price: p.price, type: t.toLowerCase() as ParamType }))}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reference range (Numeric only) */}
                      {pf.type === "numeric" && (
                        <div className="flex flex-col gap-2">
                          <Label className="text-[13px]">Reference Range</Label>
                          <div className="inline-flex border border-border rounded-lg overflow-hidden w-fit">
                            {(["Male", "Female", "General"] as const).map((rt, i, arr) => (
                              <button
                                key={rt}
                                type="button"
                                className={`px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${i < arr.length - 1 ? "border-r border-border" : ""} ${pf.rangeTab === rt ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted/40"}`}
                                onClick={() => setPf((p) => ({ ...p, rangeTab: rt }))}
                              >
                                {rt}
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3 max-w-[280px]">
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs text-muted-foreground">Min</Label>
                              <Input
                                type="number"
                                value={pf.ranges[pf.rangeTab].min}
                                onChange={(e) => setPf((p) => ({ ...p, ranges: { ...p.ranges, [p.rangeTab]: { ...p.ranges[p.rangeTab], min: e.target.value } } }))}
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label className="text-xs text-muted-foreground">Max</Label>
                              <Input
                                type="number"
                                value={pf.ranges[pf.rangeTab].max}
                                onChange={(e) => setPf((p) => ({ ...p, ranges: { ...p.ranges, [p.rangeTab]: { ...p.ranges[p.rangeTab], max: e.target.value } } }))}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Options chips (Select only) */}
                      {pf.type === "select" && (
                        <div className="flex flex-col gap-1.5">
                          <Label className="text-[13px]">Options</Label>
                          <Input
                            placeholder="Type a value and press Enter"
                            value={pf.optionDraft}
                            onChange={(e) => setPf((p) => ({ ...p, optionDraft: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && pf.optionDraft.trim()) {
                                e.preventDefault();
                                setPf((p) => ({ ...p, options: [...p.options, p.optionDraft.trim()], optionDraft: "" }));
                              }
                            }}
                          />
                          {pf.options.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {pf.options.map((o, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted border border-border rounded-full py-0.5 pl-2.5 pr-1">
                                  {o}
                                  <button
                                    type="button"
                                    className="flex items-center text-muted-foreground hover:text-foreground p-0.5"
                                    onClick={() => setPf((p) => ({ ...p, options: p.options.filter((_, i) => i !== idx) }))}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {pf.error && <p className="text-[12px] text-destructive">{pf.error}</p>}

                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setParamFormOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={saveParam}>Save Parameter</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3 — Materials ── */}
              {wizardStep === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["collection", "analysis"] as const).map((phase) => {
                    const isCollection = phase === "collection";
                    const phaseItems = pendingMaterials.filter((m) => m.phase === phase);
                    const results = filteredMatItems(phase);
                    const isOpen = matFormOpen[phase];
                    return (
                      <div key={phase} className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[.05em] text-muted-foreground">
                            {isCollection
                              ? <Droplet className="w-3 h-3" />
                              : <FlaskConical className="w-3 h-3" />}
                            {isCollection ? "Collection Phase" : "Analysis Phase"}
                          </p>
                          {!isOpen && (
                            <Button
                              variant="outline" size="sm"
                              className="h-6 text-[11px] gap-1 px-2"
                              onClick={() => {
                                setMatSearch((p) => ({ ...p, [phase]: "" }));
                                setMatSelectedId((p) => ({ ...p, [phase]: "" }));
                                setMatFormOpen((p) => ({ ...p, [phase]: true }));
                              }}
                            >
                              <Plus className="w-3 h-3" /> Add
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {phaseItems.map((m) => (
                            <div key={m.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border bg-card">
                              <span className="flex-1 min-w-0 text-[12.5px] font-medium truncate">{m.name}</span>
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isCollection ? "bg-info/15 text-info border-info/30" : "bg-primary/15 text-primary border-primary/30"}`}>
                                {isCollection ? "Collection" : "Analysis"}
                              </span>
                              <button
                                type="button"
                                className="flex-shrink-0 text-muted-foreground hover:text-foreground flex items-center"
                                onClick={() => setPendingMaterials((prev) => prev.filter((x) => x.id !== m.id))}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {phaseItems.length === 0 && !isOpen && (
                            <div className="text-center py-[18px] px-2.5 border border-dashed border-border rounded-lg text-muted-foreground text-xs">
                              No materials added
                            </div>
                          )}
                        </div>

                        {isOpen && (
                          <div className="border border-primary/30 bg-primary/[.04] rounded-lg p-3 flex flex-col gap-2">
                            <Input
                              className="h-[34px] text-sm"
                              placeholder="Search inventory items…"
                              value={matSearch[phase]}
                              onChange={(e) => {
                                setMatSearch((p) => ({ ...p, [phase]: e.target.value }));
                                setMatSelectedId((p) => ({ ...p, [phase]: "" }));
                              }}
                            />
                            <div className="max-h-[120px] overflow-y-auto flex flex-col gap-1">
                              {results.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-2 text-center">No items found</p>
                              ) : results.map((it) => (
                                <button
                                  key={it._id}
                                  type="button"
                                  className={`flex justify-between gap-2 px-2.5 py-1.5 text-[12.5px] rounded-md text-left transition-colors ${matSelectedId[phase] === it._id ? "border border-primary bg-primary/[.08]" : "border border-transparent hover:bg-muted/40"}`}
                                  onClick={() => setMatSelectedId((p) => ({ ...p, [phase]: it._id }))}
                                >
                                  <span>{it.name}</span>
                                  <span className="text-[11px] text-muted-foreground shrink-0">{it.quantityOnHand} in stock</span>
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-end gap-1.5 mt-1">
                              <Button
                                variant="ghost" size="sm" className="h-7 text-xs"
                                onClick={() => setMatFormOpen((p) => ({ ...p, [phase]: false }))}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm" className="h-7 text-xs"
                                disabled={!matSelectedId[phase]}
                                onClick={() => addMatItem(phase)}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer — fixed */}
            <div className="flex-shrink-0 flex justify-end gap-2 border-t border-border px-6 py-4">
              {wizardStep > 1 && (
                <Button variant="outline" onClick={goBack}>Back</Button>
              )}
              {wizardStep < 3 ? (
                <Button onClick={goNext}>Next</Button>
              ) : (
                <Button onClick={handleCreateTest} disabled={isCreating}>
                  {isCreating ? "Creating…" : "Create Test"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════════════════ EDIT DIALOG ══════════════════ */}
      <Dialog open={!!editingTest} onOpenChange={(v) => !v && setEditingTest(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" />
              Edit Test
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Test Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Full Blood Count"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Code <span className="text-muted-foreground text-xs">(locked)</span></Label>
                <Input value={editForm.code} disabled />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Input
                  list="edit-category-suggestions"
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Haematology"
                />
                <datalist id="edit-category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label>Turnaround Time (hours) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.turnaroundTime}
                  onChange={(e) => setEditForm((p) => ({ ...p, turnaroundTime: e.target.value }))}
                  placeholder="e.g. 24"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Sample Type *</Label>
              <Select
                value=""
                onValueChange={(v) => {
                  if (!editForm?.samples?.includes(v))
                    setEditForm((p) => ({ ...p, samples: [...p.samples, v] }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add sample type…" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_TYPES.filter((s) => !editForm?.samples?.includes(s)).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editForm?.samples?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {editForm?.samples?.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1 text-xs font-medium bg-muted border border-border rounded-full py-0.5 pl-2.5 pr-1">
                      {s}
                      <button
                        type="button"
                        className="flex items-center text-muted-foreground hover:text-foreground p-0.5"
                        onClick={() => setEditForm((p) => ({ ...p, samples: p?.samples?.filter((x) => x !== s) }))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-semibold">Parameters</p>
              {editForm.parameters.length > 0 && (
                <div className="space-y-1.5">
                  {editForm.parameters.map((p) => (
                    <div key={p._id} className="p-2 bg-muted/30 rounded-lg flex items-center gap-2 text-xs">
                      <span className="font-medium flex-1 truncate">{p.name}</span>
                      <Badge variant="outline" className={`text-[9px] px-1 h-4 shrink-0 ${p.type === "numeric" ? "border-info/40 text-info" : p.type === "select" ? "border-accent/40 text-accent" : "border-muted text-muted-foreground"}`}>
                        {p.type}
                      </Badge>
                      <span className="text-muted-foreground shrink-0">{p.unit || "—"}</span>
                      <span className="text-primary shrink-0 font-medium">₦{(p.price ?? 0).toLocaleString()}</span>
                      <button onClick={() => handleRemoveExistingParam(p._id)} className="text-destructive hover:opacity-70 flex-shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-3 bg-muted/20 rounded-xl space-y-3 border border-dashed border-border">
                <p className="text-xs font-semibold text-foreground">Add Parameter</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Parameter name *"
                    className="text-xs h-8"
                    value={newParam.name}
                    onChange={(e) => setNewParam((p) => ({ ...p, name: e.target.value }))}
                  />
                  {newParam.type !== "select" ? (
                    <Input
                      placeholder="Unit (e.g. g/dL)"
                      className="text-xs h-8"
                      value={newParam.unit}
                      onChange={(e) => setNewParam((p) => ({ ...p, unit: e.target.value }))}
                    />
                  ) : (
                    <div className="h-8 flex items-center px-2 rounded-md bg-muted/40 text-xs text-muted-foreground/50 border border-border/50">
                      No unit for select
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Input Type *</Label>
                  <Select
                    value={newParam.type}
                    onValueChange={(v) => setNewParam((p) => ({ ...emptyEditParam, name: p.name, unit: p.unit, price: p.price, type: v as ParamType }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="numeric">Numeric — number input with reference range</SelectItem>
                      <SelectItem value="text">Text — free text input</SelectItem>
                      <SelectItem value="select">Select — dropdown with predefined options</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newParam.type === "numeric" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Male range</p>
                      <div className="flex gap-1">
                        <Input placeholder="Min" type="number" className="text-xs h-8" value={newParam.refMaleMin} onChange={(e) => setNewParam((p) => ({ ...p, refMaleMin: e.target.value }))} />
                        <Input placeholder="Max" type="number" className="text-xs h-8" value={newParam.refMaleMax} onChange={(e) => setNewParam((p) => ({ ...p, refMaleMax: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Female range</p>
                      <div className="flex gap-1">
                        <Input placeholder="Min" type="number" className="text-xs h-8" value={newParam.refFemaleMin} onChange={(e) => setNewParam((p) => ({ ...p, refFemaleMin: e.target.value }))} />
                        <Input placeholder="Max" type="number" className="text-xs h-8" value={newParam.refFemaleMax} onChange={(e) => setNewParam((p) => ({ ...p, refFemaleMax: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}
                {newParam.type === "select" && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Options * <span className="opacity-60">(comma-separated)</span></p>
                    <Input
                      placeholder="e.g. Positive, Negative"
                      className="text-xs h-8"
                      value={newParam.options}
                      onChange={(e) => setNewParam((p) => ({ ...p, options: e.target.value }))}
                    />
                    {newParam.options && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {newParam.options.split(",").map((o) => o.trim()).filter(Boolean).map((opt) => (
                          <Badge key={opt} variant="outline" className="text-[10px] px-1.5">{opt}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Price (₦)</Label>
                    <Input type="number" min="0" className="text-xs h-8" value={newParam.price} onChange={(e) => setNewParam((p) => ({ ...p, price: e.target.value }))} placeholder="0" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full" onClick={addParamToExistingTest}>
                  <PlusCircle className="w-3.5 h-3.5" /> Add Parameter
                </Button>
                <p className="text-[10px] text-muted-foreground">
                  Parameters on an existing test save immediately when added or removed.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTest(null)}>Cancel</Button>
            <Button onClick={handleEditSave} className="gap-2">
              <Check className="w-4 h-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══════════════════ DELETE CONFIRM ══════════════════ */}
      <Dialog open={!!deleteConfirm} onOpenChange={(v) => !v && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Test
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deleteConfirm?.name}</span>?
            This will remove it from your catalog. If this test has existing orders, deletion will be
            blocked — deactivate it instead.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
