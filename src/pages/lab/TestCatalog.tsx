import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { unslugify } from "@/lib/slug";
import type {
  TestCatalogEntry,
  TestCatalogParameter,
  ParamType,
  ReferenceRange,
} from "@/api/types/test-catalog";

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

interface ParamFormState {
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

const emptyParam: ParamFormState = {
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

interface TestFormState {
  name: string;
  code: string;
  category: string;
  turnaroundTime: string; 
  sampleType: string;
  parameters: TestCatalogParameter[]; 
}

const emptyForm: TestFormState = {
  name: "",
  code: "",
  category: "",
  turnaroundTime: "",
  sampleType: "",
  parameters: [],
};

export default function TestCatalog() {
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const { tests, isLoading, listUrl } = useTestCatalogList({
    search: search || undefined,
    category: catFilter === "All" ? undefined : catFilter,
    limit: 200,
  });

  const { createTest } = useCreateTest([listUrl]);
  const { updateTest } = useUpdateTest([listUrl]);
  const { removeTest } = useRemoveTest([listUrl]);
  const { updateStatus } = useUpdateTestStatus([listUrl]);
  const { addParameter } = useAddParameter([listUrl]);
  const { removeParameter } = useRemoveParameter([listUrl]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [editingTest, setEditingTest] = useState<TestCatalogEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TestCatalogEntry | null>(
    null,
  );

  const [form, setForm] = useState<TestFormState>(emptyForm);
  const [newParam, setNewParam] = useState<ParamFormState>(emptyParam);
  const [pendingParams, setPendingParams] = useState<
    TestCatalogEntry["parameters"]
  >([]);

  const categoriesInUse = useMemo(() => {
    const set = new Set(tests.map((t) => t.category));
    return Array.from(set);
  }, [tests]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const openAdd = () => {
    setForm(emptyForm);
    setPendingParams([]);
    setShowAdd(true);
  };
  const openEdit = (t: TestCatalogEntry) => {
    setForm({
      name: t.name,
      code: t.code,
      category: unslugify(t.category),
      turnaroundTime: String(t.turnaroundTime),
      sampleType: t.sampleType,
      parameters: t.parameters,
    });
    setEditingTest(t);
  };

  const buildReferenceRange = (
    p: ParamFormState,
  ): ReferenceRange | undefined => {
    if (p.type !== "numeric") return undefined;
    const range: ReferenceRange = {};
    if (p.refMaleMin && p.refMaleMax)
      range.male = { min: Number(p.refMaleMin), max: Number(p.refMaleMax) };
    if (p.refFemaleMin && p.refFemaleMax)
      range.female = {
        min: Number(p.refFemaleMin),
        max: Number(p.refFemaleMax),
      };
    return Object.keys(range).length > 0 ? range : undefined;
  };

  const addParamToNewTest = () => {
    if (!newParam.name) {
      toast({ title: "Parameter name required", variant: "destructive" });
      return;
    }
    const param: TestCatalogEntry["parameters"][number] = {
      _id: `temp-${Date.now()}`,
      name: newParam.name,
      unit: newParam.type !== "select" ? newParam.unit : undefined,
      type: newParam.type,
      options:
        newParam.type === "select"
          ? newParam.options
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined,
      referenceRange: buildReferenceRange(newParam),
      price: Number(newParam.price) || 0,
    };
    setPendingParams((prev) => [...prev, param]);
    setNewParam(emptyParam);
  };

  const addParamToExistingTest = async () => {
    if (!editingTest) return;
    if (!newParam.name) {
      toast({ title: "Parameter name required", variant: "destructive" });
      return;
    }
    try {
      const updated = await addParameter(editingTest._id, {
        name: newParam.name,
        unit:
          newParam.type !== "select" ? newParam.unit || undefined : undefined,
        type: newParam.type,
        options:
          newParam.type === "select"
            ? newParam.options
                .split(",")
                .map((o) => o.trim())
                .filter(Boolean)
            : undefined,
        referenceRange: buildReferenceRange(newParam),
        price: Number(newParam.price) || 0,
      });
      if (updated) {
        setForm((prev) => ({ ...prev, parameters: updated.parameters }));
        setEditingTest(updated);
      }
      setNewParam(emptyParam);
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
        setForm((prev) => ({ ...prev, parameters: updated.parameters }));
        setEditingTest(updated);
      }
      toast({ title: "Parameter removed" });
    } catch {
      toast({ title: "Failed to remove parameter", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (
      !form.name ||
      !form.code ||
      !form.category ||
      !form.turnaroundTime ||
      !form.sampleType
    ) {
      toast({
        title: "Required fields missing",
        description:
          "Name, code, category, price, turnaround time, and sample type are required.",
        variant: "destructive",
      });
      return;
    }
     let finalParams = pendingParams;
     if (!editingTest && newParam.name.trim()) {
       const param: TestCatalogEntry["parameters"][number] = {
         _id: `temp-${Date.now()}`,
         name: newParam.name,
         unit: newParam.type !== "select" ? newParam.unit : undefined,
         type: newParam.type,
         options:
           newParam.type === "select"
             ? newParam.options
                 .split(",")
                 .map((o) => o.trim())
                 .filter(Boolean)
             : undefined,
         referenceRange: buildReferenceRange(newParam),
         price: Number(newParam.price) || 0,
       };
       finalParams = [...pendingParams, param];
     }

    try {
      if (editingTest) {
        await updateTest(editingTest._id, {
          name: form.name,
          category: form.category,
          turnaroundTime: Number(form.turnaroundTime),
          sampleType: form.sampleType,
        });
        toast({
          title: "Test updated",
          description: `${form.name} has been updated.`,
        });
        setEditingTest(null);
      } else {
        await createTest({
          name: form.name,
          code: form.code.toUpperCase(),
          category: form.category,
          turnaroundTime: Number(form.turnaroundTime),
          sampleType: form.sampleType,
          parameters: finalParams.map((p) => ({
            name: p.name,
            unit: p.unit,
            type: p.type,
            options: p.options,
            referenceRange: p.referenceRange,
            price: p.price,
          })),
        });
        toast({
          title: "Test created",
          description: `${form.name} added to your catalog.`,
        });
        setShowAdd(false);
      }
      setForm(emptyForm);
      setPendingParams([]);
    } catch {
      toast({
        title: "Save failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await removeTest(deleteConfirm._id);
      toast({
        title: "Test deleted",
        description: `${deleteConfirm.name} removed.`,
      });
    } catch {
      toast({
        title: "Cannot delete test",
        description: "This test has existing orders. Deactivate it instead.",
        variant: "destructive",
      });
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

  const formatRefRange = (
    range?: ReferenceRange,
    key: "male" | "female" = "male",
  ) => {
    const v = range?.[key];
    if (!v) return "—";
    return `${v.min}–${v.max}`;
  };

  const avgParams =
    tests.length > 0
      ? Math.round(
          tests.reduce((s, t) => s + t.parameters.length, 0) / tests.length,
        )
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Test Catalog</h2>
        <p className="text-sm text-muted-foreground">
          View and manage your laboratory test offering with reference
          parameters
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-primary">{tests.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Tests</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-success">
            {tests.filter((t) => t.isActive).length}
          </p>
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
              <SelectItem key={c} value={c}>
                {unslugify(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="gap-2 flex-shrink-0" onClick={openAdd}>
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
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
              catFilter === slug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {label}{" "}
            <span
              className={`text-[10px] ${catFilter === slug ? "opacity-70" : "opacity-60"}`}
            >
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
                <TableCell
                  colSpan={9}
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  Loading catalog…
                </TableCell>
              </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-12 text-muted-foreground text-sm"
                >
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
                      {expanded.has(test._id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-medium text-sm">{test.name}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {test.code}
                      </code>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-xs">
                        {unslugify(test.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-sm">
                      ₦
                      {test.parameters
                        .reduce((sum, p) => sum + (p.price ?? 0), 0)
                        .toLocaleString()}
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
                    <TableCell
                      className="py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => openEdit(test)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleToggleActive(test)}
                          >
                            {test.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => setDeleteConfirm(test)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expanded.has(test._id) && (
                    <TableRow
                      key={`${test._id}-params`}
                      className="bg-muted/10"
                    >
                      <TableCell colSpan={9} className="pb-4 pt-2 px-6">
                        <div className="flex items-center gap-6 mb-3 flex-wrap">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Reference Parameters & Pricing
                          </p>
                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                            <TestTube className="w-3 h-3 text-primary/70" />
                            <span className="font-medium text-foreground">
                              {test.sampleType}
                            </span>
                          </span>
                        </div>
                        {test.parameters.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-4 text-center">
                            No parameters added yet.
                          </p>
                        ) : (
                          <div className="border border-border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                              <span className="col-span-3">Parameter</span>
                              <span className="col-span-1">Type</span>
                              <span className="col-span-1">Unit</span>
                              <span className="col-span-3">Male Ref.</span>
                              <span className="col-span-3">Female Ref.</span>
                              <span className="col-span-1 text-right">
                                Price (₦)
                              </span>
                            </div>
                            <div className="divide-y divide-border">
                              {test.parameters.map((p) => (
                                <div
                                  key={p._id}
                                  className="grid grid-cols-12 px-3 py-2 text-xs hover:bg-muted/10 items-center"
                                >
                                  <span className="col-span-3 font-medium">
                                    {p.name}
                                  </span>
                                  <span className="col-span-1">
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] px-1 h-4 ${
                                        p.type === "numeric"
                                          ? "border-info/40 text-info"
                                          : p.type === "select"
                                            ? "border-accent/40 text-accent"
                                            : "border-muted text-muted-foreground"
                                      }`}
                                    >
                                      {p.type}
                                    </Badge>
                                  </span>
                                  <span className="col-span-1 text-muted-foreground font-mono">
                                    {p.unit || "—"}
                                  </span>
                                  <span className="col-span-3 text-muted-foreground">
                                    {p.type === "select" && p.options?.length
                                      ? p.options.join(", ")
                                      : formatRefRange(
                                          p.referenceRange,
                                          "male",
                                        )}
                                  </span>
                                  <span className="col-span-3 text-muted-foreground">
                                    {p.type === "select"
                                      ? "—"
                                      : formatRefRange(
                                          p.referenceRange,
                                          "female",
                                        )}
                                  </span>
                                  <span className="col-span-1 text-right font-medium text-primary">
                                    ₦{p.price.toLocaleString()}
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

      {/* ── ADD / EDIT DIALOG ── */}
      <Dialog
        open={showAdd || !!editingTest}
        onOpenChange={(v) => {
          if (!v) {
            setShowAdd(false);
            setEditingTest(null);
            setForm(emptyForm);
            setPendingParams([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingTest ? (
                <Pencil className="w-4 h-4 text-primary" />
              ) : (
                <Plus className="w-4 h-4 text-primary" />
              )}
              {editingTest ? "Edit Test" : "Add New Test"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Test Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Full Blood Count"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Code *{" "}
                  {editingTest && (
                    <span className="text-muted-foreground text-xs">
                      (locked)
                    </span>
                  )}
                </Label>
                <Input
                  value={form.code}
                  disabled={!!editingTest}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. FBC"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Input
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  placeholder="e.g. Haematology"
                />
                <datalist id="category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label>Turnaround Time (hours) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.turnaroundTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, turnaroundTime: e.target.value }))
                  }
                  placeholder="e.g. 24"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sample Type *</Label>
                <Select
                  value={form.sampleType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, sampleType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Price (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newParam.price}
                  onChange={(e) =>
                    setNewParam((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder="e.g. 3500"
                />
                <p className="text-[10px] text-muted-foreground">
                  Price for the parameter you're about to add below
                </p>
              </div>
            </div>

            <Separator />
            <p className="text-sm font-semibold">Parameters</p>

            {(editingTest ? form.parameters : pendingParams).length > 0 && (
              <div className="space-y-1.5">
                {(editingTest ? form.parameters : pendingParams).map((p) => (
                  <div
                    key={p._id}
                    className="p-2 bg-muted/30 rounded-lg flex items-center gap-2 text-xs"
                  >
                    <span className="font-medium flex-1 truncate">
                      {p.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1 h-4 shrink-0 ${
                        p.type === "numeric"
                          ? "border-info/40 text-info"
                          : p.type === "select"
                            ? "border-accent/40 text-accent"
                            : "border-muted text-muted-foreground"
                      }`}
                    >
                      {p.type}
                    </Badge>
                    <span className="text-muted-foreground shrink-0">
                      {p.unit || "—"}
                    </span>
                    <span className="text-primary shrink-0 font-medium">
                      ₦{p.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() =>
                        editingTest
                          ? handleRemoveExistingParam(p._id)
                          : setPendingParams((prev) =>
                              prev.filter((x) => x._id !== p._id),
                            )
                      }
                      className="text-destructive hover:opacity-70 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-muted/20 rounded-xl space-y-3 border border-dashed border-border">
              <p className="text-xs font-semibold text-foreground">
                Add Parameter
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Parameter name *"
                  className="text-xs h-8"
                  value={newParam.name}
                  onChange={(e) =>
                    setNewParam((p) => ({ ...p, name: e.target.value }))
                  }
                />
                {newParam.type !== "select" ? (
                  <Input
                    placeholder="Unit (e.g. g/dL)"
                    className="text-xs h-8"
                    value={newParam.unit}
                    onChange={(e) =>
                      setNewParam((p) => ({ ...p, unit: e.target.value }))
                    }
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
                  onValueChange={(v) =>
                    setNewParam((p) => ({
                      ...emptyParam,
                      name: p.name,
                      unit: p.unit,
                      price: p.price,
                      type: v as ParamType,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric">
                      Numeric — number input with reference range
                    </SelectItem>
                    <SelectItem value="text">Text — free text input</SelectItem>
                    <SelectItem value="select">
                      Select — dropdown with predefined options
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newParam.type === "numeric" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">
                      Male range
                    </p>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Min"
                        type="number"
                        className="text-xs h-8"
                        value={newParam.refMaleMin}
                        onChange={(e) =>
                          setNewParam((p) => ({
                            ...p,
                            refMaleMin: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        className="text-xs h-8"
                        value={newParam.refMaleMax}
                        onChange={(e) =>
                          setNewParam((p) => ({
                            ...p,
                            refMaleMax: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">
                      Female range
                    </p>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Min"
                        type="number"
                        className="text-xs h-8"
                        value={newParam.refFemaleMin}
                        onChange={(e) =>
                          setNewParam((p) => ({
                            ...p,
                            refFemaleMin: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        className="text-xs h-8"
                        value={newParam.refFemaleMax}
                        onChange={(e) =>
                          setNewParam((p) => ({
                            ...p,
                            refFemaleMax: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
              {newParam.type === "select" && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    Options *{" "}
                    <span className="opacity-60">(comma-separated)</span>
                  </p>
                  <Input
                    placeholder="e.g. Positive, Negative"
                    className="text-xs h-8"
                    value={newParam.options}
                    onChange={(e) =>
                      setNewParam((p) => ({ ...p, options: e.target.value }))
                    }
                  />
                  {newParam.options && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {newParam.options
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean)
                        .map((opt) => (
                          <Badge
                            key={opt}
                            variant="outline"
                            className="text-[10px] px-1.5"
                          >
                            {opt}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs w-full"
                onClick={
                  editingTest ? addParamToExistingTest : addParamToNewTest
                }
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Parameter
              </Button>
              {editingTest && (
                <p className="text-[10px] text-muted-foreground">
                  Parameters on an existing test save immediately when added or
                  removed.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdd(false);
                setEditingTest(null);
                setForm(emptyForm);
                setPendingParams([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              {editingTest ? "Save Changes" : "Add Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(v) => !v && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Test
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deleteConfirm?.name}
            </span>
            ? This will remove it from your catalog. If this test has existing
            orders, deletion will be blocked — deactivate it instead.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
