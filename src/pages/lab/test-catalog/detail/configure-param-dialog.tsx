import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  TestCatalogParameter,
  ParamType,
  ReferenceRange,
  UpdateParameterPayload,
  CreateParameterPayload,
} from "@/api/types/test-catalog";
import { emptyRanges, type RangeTab } from "../shared";

interface Props {
  testId: string;
  /** Pass a parameter to edit it, or null to add a new one. */
  param: TestCatalogParameter | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LBL =
  "block text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-[5px]";

const PARAM_TYPES: ParamType[] = ["numeric", "text", "select"];
const TYPE_LABELS: Record<ParamType, string> = {
  numeric: "Numeric",
  text: "Text",
  select: "Select",
};
const RANGE_TABS: RangeTab[] = ["General", "Male", "Female"];

interface FormState {
  name: string;
  price: string;
  unit: string;
  type: ParamType;
  options: string[];
  optionDraft: string;
  ranges: Record<RangeTab, { min: string; max: string }>;
  rangeOpen: Record<RangeTab, boolean>;
}

function toRangeState(ref?: ReferenceRange): Record<RangeTab, { min: string; max: string }> {
  return {
    General: {
      min: String(ref?.general?.min ?? ""),
      max: String(ref?.general?.max ?? ""),
    },
    Male: {
      min: String(ref?.male?.min ?? ""),
      max: String(ref?.male?.max ?? ""),
    },
    Female: {
      min: String(ref?.female?.min ?? ""),
      max: String(ref?.female?.max ?? ""),
    },
  };
}

function buildReferenceRange(
  ranges: Record<RangeTab, { min: string; max: string }>,
): ReferenceRange | undefined {
  const result: ReferenceRange = {};
  const g = ranges.General;
  const m = ranges.Male;
  const f = ranges.Female;
  if (g.min && g.max) result.general = { min: Number(g.min), max: Number(g.max) };
  if (m.min && m.max) result.male = { min: Number(m.min), max: Number(m.max) };
  if (f.min && f.max) result.female = { min: Number(f.min), max: Number(f.max) };
  return Object.keys(result).length > 0 ? result : undefined;
}

export function ConfigureParamDialog({ testId, param, open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    name: "",
    price: "0",
    unit: "",
    type: "numeric",
    options: [],
    optionDraft: "",
    ranges: emptyRanges(),
    rangeOpen: { General: true, Male: false, Female: false },
  });

  useEffect(() => {
    if (open && param) {
      setForm({
        name: param.name,
        price: String(param.price ?? 0),
        unit: param.unit ?? "",
        type: param.type,
        options: param.options ?? [],
        optionDraft: "",
        ranges: toRangeState(param.referenceRange),
        rangeOpen: { General: true, Male: false, Female: false },
      });
    }
  }, [open, param]);

  const isAdd = param === null;

  const save = useMutation<unknown, UpdateParameterPayload | CreateParameterPayload>(
    // stable key — real URL supplied per-call
    endpoint.lab.testCatalog.list,
    {
      method: isAdd ? "POST" : "PATCH",
      successToast: isAdd ? "Parameter added" : "Parameter updated",
      onSuccess,
    },
  );

  function handleSave() {
    const price = parseFloat(form.price) || 0;
    const base = {
      name: form.name,
      unit: form.unit || undefined,
      type: form.type,
      price,
      ...(form.type === "select" && { options: form.options }),
      ...(form.type === "numeric" && { referenceRange: buildReferenceRange(form.ranges) }),
    };

    if (isAdd) {
      save.trigger(base, endpoint.lab.testCatalog.addParameter(testId));
    } else {
      save.trigger(base, endpoint.lab.testCatalog.updateParameter(testId, param._id));
    }
  }

  function setField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addOption() {
    const trimmed = form.optionDraft.trim();
    if (trimmed && !form.options.includes(trimmed)) {
      setForm((f) => ({ ...f, options: [...f.options, trimmed], optionDraft: "" }));
    }
  }

  function removeOption(idx: number) {
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));
  }

  function setRange(tab: RangeTab, field: "min" | "max", v: string) {
    setForm((f) => ({
      ...f,
      ranges: { ...f.ranges, [tab]: { ...f.ranges[tab], [field]: v } },
    }));
  }

  function toggleRange(tab: RangeTab) {
    setForm((f) => ({
      ...f,
      rangeOpen: { ...f.rangeOpen, [tab]: !f.rangeOpen[tab] },
    }));
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold">
            {isAdd ? "Add Parameter" : "Configure Parameter"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[16px] max-h-[68vh] overflow-y-auto pr-1">
          {/* Name */}
          <div>
            <label className={LBL}>Name</label>
            <Input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="w-full"
            />
          </div>

          {/* Price + Unit */}
          <div className="grid grid-cols-2 gap-[14px]">
            <div>
              <label className={LBL}>Price</label>
              <div className="relative">
                <span className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground pointer-events-none">
                  ₦
                </span>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  className="w-full pl-[24px]"
                />
              </div>
            </div>
            <div>
              <label className={LBL}>Unit</label>
              <Input
                placeholder="e.g. g/dL"
                value={form.unit}
                onChange={(e) => setField("unit", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Result Type segmented toggle */}
          <div>
            <label className={LBL}>Result Type</label>
            <div className="inline-flex border border-border rounded-[var(--radius-md)] overflow-hidden mt-1">
              {PARAM_TYPES.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setField("type", t)}
                  className={cn(
                    "px-[14px] py-[7px] text-[12.5px] font-semibold cursor-pointer border-none transition-colors",
                    i < PARAM_TYPES.length - 1 ? "border-r border-r-border" : "",
                    form.type === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-muted/40",
                  )}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Options (Select) */}
          {form.type === "select" && (
            <div>
              <label className={LBL}>Options</label>
              <Input
                placeholder="Type a value and press Enter"
                value={form.optionDraft}
                onChange={(e) => setField("optionDraft", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOption();
                  }
                }}
                className="w-full"
              />
              {form.options.length > 0 && (
                <div className="flex flex-wrap gap-[6px] mt-[6px]">
                  {form.options.map((o, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-[6px] text-[12px] font-medium bg-muted border border-border rounded-full px-[10px] py-[3px]"
                    >
                      {o}
                      <button
                        onClick={() => removeOption(i)}
                        className="border-none bg-transparent cursor-pointer text-muted-foreground flex p-[2px] hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reference Ranges (Numeric) */}
          {form.type === "numeric" && (
            <div>
              <label className={LBL}>Reference Range</label>
              <div className="flex flex-col gap-[6px] mt-1">
                {RANGE_TABS.map((tab) => (
                  <div
                    key={tab}
                    className="border border-border rounded-[var(--radius)] overflow-hidden"
                  >
                    <button
                      className="flex items-center justify-between w-full border-none bg-transparent cursor-pointer p-[9px_12px] text-left hover:bg-muted/20 transition-colors"
                      onClick={() => toggleRange(tab)}
                    >
                      <span className="text-[12.5px] font-semibold">{tab}</span>
                      {form.rangeOpen[tab] ? (
                        <ChevronUp className="w-[13px] h-[13px] text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-[13px] h-[13px] text-muted-foreground" />
                      )}
                    </button>
                    {form.rangeOpen[tab] && (
                      <div className="grid grid-cols-2 gap-[10px] px-3 pb-3">
                        <div>
                          <label className="block text-[11px] text-muted-foreground mb-1">
                            Min
                          </label>
                          <Input
                            type="number"
                            value={form.ranges[tab].min}
                            onChange={(e) => setRange(tab, "min", e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-muted-foreground mb-1">
                            Max
                          </label>
                          <Input
                            type="number"
                            value={form.ranges[tab].max}
                            onChange={(e) => setRange(tab, "max", e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-[14px]">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={save.isLoading} onClick={handleSave}>
            {save.isLoading ? "Saving…" : isAdd ? "Add Parameter" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
