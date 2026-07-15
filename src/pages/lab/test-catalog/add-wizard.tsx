import { useState } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Check,
  X,
  Droplet,
  FlaskConical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateTest } from "@/hooks/use-test-catalog";
import { useInventoryList } from "@/hooks/use-inventory";
import endpoint from "@/api/endpoints";
import type { ParamType } from "@/api/types/test-catalog";
import {
  CATEGORY_SUGGESTIONS,
  SAMPLE_TYPES,
  type RangeTab,
  type WizardBasic,
  type ParamFormState,
  type PendingParam,
  type PendingMaterial,
  emptyParamForm,
  buildRangeForWizard,
} from "./shared";

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
          <div
            key={label}
            className={`flex items-center ${isLast ? "flex-shrink-0" : "flex-1 min-w-0"}`}
          >
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

interface AddWizardProps {
  open: boolean;
  onClose: () => void;
}

export function AddWizard({ open, onClose }: AddWizardProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { createTest, isLoading: isCreating } = useCreateTest([]);
  const { items: allItems } = useInventoryList({ limit: 100 });

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [step1Error, setStep1Error] = useState("");
  const [basic, setBasic] = useState<WizardBasic>({
    name: "",
    code: "",
    category: "",
    samples: [],
    turnaround: "",
  });
  const [pendingParams, setPendingParams] = useState<PendingParam[]>([]);
  const [paramFormOpen, setParamFormOpen] = useState(false);
  const [pf, setPf] = useState<ParamFormState>(emptyParamForm());
  const [pendingMaterials, setPendingMaterials] = useState<PendingMaterial[]>([]);
  const [matFormOpen, setMatFormOpen] = useState({ collection: false, analysis: false });
  const [matSearch, setMatSearch] = useState({ collection: "", analysis: "" });
  const [matSelectedId, setMatSelectedId] = useState({ collection: "", analysis: "" });

  const resetWizard = () => {
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
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

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
    if (!pf.name.trim()) {
      setPf((p) => ({ ...p, error: "Parameter name is required." }));
      return;
    }
    if (pf.price === "" || parseFloat(pf.price) < 0) {
      setPf((p) => ({ ...p, error: "Enter a valid price (0 or more)." }));
      return;
    }
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

  const filteredMatItems = (phase: "collection" | "analysis") => {
    const q = matSearch[phase].trim().toLowerCase();
    const alreadyAdded = new Set(
      pendingMaterials.filter((m) => m.phase === phase).map((m) => m.itemId),
    );
    return allItems
      .filter((i) => !alreadyAdded.has(i._id) && (!q || i.name.toLowerCase().includes(q)))
      .slice(0, 6);
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

  const handleCreate = async () => {
    if (
      !basic.name.trim() ||
      !basic.code.trim() ||
      !basic.category.trim() ||
      basic.samples.length === 0 ||
      !basic.turnaround
    ) {
      toast({
        title: "Required fields missing",
        description: "Please complete all fields in Step 1.",
        variant: "destructive",
      });
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
      mutate((key: unknown) =>
        typeof key === "string" && key.startsWith(endpoint.lab.testCatalog.list),
      );
      toast({
        title: "Test created",
        description: `${basic.name.trim()} added with ${pendingParams.length} parameter${pendingParams.length !== 1 ? "s" : ""}.`,
      });
      handleClose();
    } catch {
      toast({ title: "Failed to create test", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col gap-4 max-h-[min(640px,80vh)] w-full box-border overflow-x-hidden">

          {/* Header */}
          <div className="flex-shrink-0 px-6 pt-6 space-y-4">
            <h2 className="text-[17px] font-semibold">Add New Test</h2>
            <StepIndicator step={wizardStep} />
          </div>

          {/* Scrollable body */}
          <div
            className="overflow-y-auto flex-1 min-h-0 px-6 pb-2"
            style={{ paddingRight: "18px" }}
          >
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
                      onChange={(e) =>
                        setBasic((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                      }
                    />
                    <p className="text-[11.5px] text-muted-foreground">
                      Unique identifier — uppercase letters and numbers only
                    </p>
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
                      {CATEGORY_SUGGESTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <Label className="text-[13px]">Sample Type</Label>
                    <Select
                      value=""
                      onValueChange={(v) => {
                        if (!basic.samples.includes(v))
                          setBasic((p) => ({ ...p, samples: [...p.samples, v] }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add sample type…" />
                      </SelectTrigger>
                      <SelectContent>
                        {SAMPLE_TYPES.filter((s) => !basic.samples.includes(s)).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {basic.samples.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {basic.samples.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 text-xs font-medium bg-muted border border-border rounded-full py-0.5 pl-2.5 pr-1"
                          >
                            {s}
                            <button
                              type="button"
                              className="flex items-center text-muted-foreground hover:text-foreground p-0.5"
                              onClick={() =>
                                setBasic((p) => ({
                                  ...p,
                                  samples: p.samples.filter((x) => x !== s),
                                }))
                              }
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
                        onChange={(e) =>
                          setBasic((p) => ({ ...p, turnaround: e.target.value }))
                        }
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 h-7 text-xs"
                      onClick={() => {
                        setPf(emptyParamForm());
                        setParamFormOpen(true);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Parameter
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {pendingParams.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border bg-card"
                    >
                      <span className="flex-1 min-w-0 text-[13px] font-semibold truncate">
                        {p.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 shrink-0 ${p.type === "numeric" ? "border-info/40 text-info" : p.type === "select" ? "border-accent/40 text-accent" : "border-muted text-muted-foreground"}`}
                      >
                        {p.type}
                      </Badge>
                      <span className="text-[13px] font-semibold w-20 text-right shrink-0">
                        ₦{p.price.toLocaleString()}
                      </span>
                      <button
                        className="text-destructive hover:opacity-70 flex-shrink-0 flex items-center"
                        onClick={() =>
                          setPendingParams((prev) => prev.filter((x) => x.id !== p.id))
                        }
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

                {paramFormOpen && (
                  <div className="border border-primary/30 bg-primary/[.04] rounded-xl p-4 flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[13px]">
                        Parameter Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="e.g. Haemoglobin"
                        value={pf.name}
                        onChange={(e) =>
                          setPf((p) => ({ ...p, name: e.target.value, error: "" }))
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <Label className="text-[13px]">
                          Price <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground pointer-events-none">
                            ₦
                          </span>
                          <Input
                            type="number"
                            min="0"
                            className="pl-6 w-full"
                            value={pf.price}
                            onChange={(e) =>
                              setPf((p) => ({ ...p, price: e.target.value, error: "" }))
                            }
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

                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[13px]">Type</Label>
                      <p className="text-[11.5px] text-muted-foreground -mt-1">
                        Determines how a scientist enters this parameter's result
                      </p>
                      <div className="inline-flex border border-border rounded-lg overflow-hidden w-fit">
                        {(["Numeric", "Text", "Select"] as const).map((t, i, arr) => (
                          <button
                            key={t}
                            type="button"
                            className={`px-4 py-[7px] text-[12.5px] font-semibold transition-colors ${i < arr.length - 1 ? "border-r border-border" : ""} ${pf.type === t.toLowerCase() ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted/40"}`}
                            onClick={() =>
                              setPf((p) => ({
                                ...emptyParamForm(),
                                name: p.name,
                                price: p.price,
                                type: t.toLowerCase() as ParamType,
                              }))
                            }
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {pf.type === "numeric" && (
                      <div className="flex flex-col gap-2">
                        <Label className="text-[13px]">Reference Range</Label>
                        <div className="inline-flex border border-border rounded-lg overflow-hidden w-fit">
                          {(["Male", "Female", "General"] as const).map((rt, i, arr) => (
                            <button
                              key={rt}
                              type="button"
                              className={`px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${i < arr.length - 1 ? "border-r border-border" : ""} ${pf.rangeTab === rt ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted/40"}`}
                              onClick={() => setPf((p) => ({ ...p, rangeTab: rt as RangeTab }))}
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
                              onChange={(e) =>
                                setPf((p) => ({
                                  ...p,
                                  ranges: {
                                    ...p.ranges,
                                    [p.rangeTab]: { ...p.ranges[p.rangeTab], min: e.target.value },
                                  },
                                }))
                              }
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-xs text-muted-foreground">Max</Label>
                            <Input
                              type="number"
                              value={pf.ranges[pf.rangeTab].max}
                              onChange={(e) =>
                                setPf((p) => ({
                                  ...p,
                                  ranges: {
                                    ...p.ranges,
                                    [p.rangeTab]: { ...p.ranges[p.rangeTab], max: e.target.value },
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}

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
                              setPf((p) => ({
                                ...p,
                                options: [...p.options, p.optionDraft.trim()],
                                optionDraft: "",
                              }));
                            }
                          }}
                        />
                        {pf.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {pf.options.map((o, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted border border-border rounded-full py-0.5 pl-2.5 pr-1"
                              >
                                {o}
                                <button
                                  type="button"
                                  className="flex items-center text-muted-foreground hover:text-foreground p-0.5"
                                  onClick={() =>
                                    setPf((p) => ({
                                      ...p,
                                      options: p.options.filter((_, i) => i !== idx),
                                    }))
                                  }
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {pf.error && (
                      <p className="text-[12px] text-destructive">{pf.error}</p>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setParamFormOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveParam}>
                        Save Parameter
                      </Button>
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
                          {isCollection ? (
                            <Droplet className="w-3 h-3" />
                          ) : (
                            <FlaskConical className="w-3 h-3" />
                          )}
                          {isCollection ? "Collection Phase" : "Analysis Phase"}
                        </p>
                        {!isOpen && (
                          <Button
                            variant="outline"
                            size="sm"
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
                          <div
                            key={m.id}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-border bg-card"
                          >
                            <span className="flex-1 min-w-0 text-[12.5px] font-medium truncate">
                              {m.name}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isCollection ? "bg-info/15 text-info border-info/30" : "bg-primary/15 text-primary border-primary/30"}`}
                            >
                              {isCollection ? "Collection" : "Analysis"}
                            </span>
                            <button
                              type="button"
                              className="flex-shrink-0 text-muted-foreground hover:text-foreground flex items-center"
                              onClick={() =>
                                setPendingMaterials((prev) =>
                                  prev.filter((x) => x.id !== m.id),
                                )
                              }
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
                              <p className="text-xs text-muted-foreground py-2 text-center">
                                No items found
                              </p>
                            ) : (
                              results.map((it) => (
                                <button
                                  key={it._id}
                                  type="button"
                                  className={`flex justify-between gap-2 px-2.5 py-1.5 text-[12.5px] rounded-md text-left transition-colors ${matSelectedId[phase] === it._id ? "border border-primary bg-primary/[.08]" : "border border-transparent hover:bg-muted/40"}`}
                                  onClick={() =>
                                    setMatSelectedId((p) => ({ ...p, [phase]: it._id }))
                                  }
                                >
                                  <span>{it.name}</span>
                                  <span className="text-[11px] text-muted-foreground shrink-0">
                                    {it.quantityOnHand} in stock
                                  </span>
                                </button>
                              ))
                            )}
                          </div>
                          <div className="flex justify-end gap-1.5 mt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() =>
                                setMatFormOpen((p) => ({ ...p, [phase]: false }))
                              }
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs"
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

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-end gap-2 border-t border-border px-6 py-4">
            {wizardStep > 1 && (
              <Button variant="outline" onClick={goBack}>
                Back
              </Button>
            )}
            {wizardStep < 3 ? (
              <Button onClick={goNext}>Next</Button>
            ) : (
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating…" : "Create Test"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
