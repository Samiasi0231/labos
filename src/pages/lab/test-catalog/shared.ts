import type { ParamType, ReferenceRange } from "@/api/types/test-catalog";

export const CATEGORY_SUGGESTIONS = [
  "Haematology",
  "Biochemistry",
  "Parasitology",
  "Microbiology",
  "Serology",
  "Endocrinology",
];

export const SAMPLE_TYPES = [
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

// ── Wizard types ──────────────────────────────────────────────────────────────

export type RangeTab = "Male" | "Female" | "General";

export interface WizardBasic {
  name: string;
  code: string;
  category: string;
  samples: string[];
  turnaround: string;
}

export interface ParamFormState {
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

export interface PendingParam {
  id: string;
  name: string;
  price: number;
  unit?: string;
  type: ParamType;
  referenceRange?: ReferenceRange;
  options?: string[];
}

export interface PendingMaterial {
  id: string;
  itemId: string;
  name: string;
  phase: "collection" | "analysis";
}

// ── Edit dialog types ─────────────────────────────────────────────────────────

export interface EditFormState {
  name: string;
  code: string;
  category: string;
  turnaroundTime: string;
  samples: string[];
  parameters: import("@/api/types/test-catalog").TestCatalogEntry["parameters"];
}

export interface EditParamState {
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

export const emptyEditParam: EditParamState = {
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

export function emptyRanges(): Record<RangeTab, { min: string; max: string }> {
  return {
    Male: { min: "", max: "" },
    Female: { min: "", max: "" },
    General: { min: "", max: "" },
  };
}

export function emptyParamForm(): ParamFormState {
  return {
    name: "",
    price: "",
    unit: "",
    type: "numeric",
    rangeTab: "Male",
    ranges: emptyRanges(),
    options: [],
    optionDraft: "",
    error: "",
  };
}

export function buildRangeForWizard(pf: ParamFormState): ReferenceRange | undefined {
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

export function buildRangeForEdit(p: EditParamState): ReferenceRange | undefined {
  if (p.type !== "numeric") return undefined;
  const range: ReferenceRange = {};
  if (p.refMaleMin && p.refMaleMax)
    range.male = { min: Number(p.refMaleMin), max: Number(p.refMaleMax) };
  if (p.refFemaleMin && p.refFemaleMax)
    range.female = { min: Number(p.refFemaleMin), max: Number(p.refFemaleMax) };
  return Object.keys(range).length > 0 ? range : undefined;
}
