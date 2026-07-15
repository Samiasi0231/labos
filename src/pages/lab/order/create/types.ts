import type { TestOrderPriority } from "@/api/types/test-order";
import type { PatientListItem } from "@/api/types/patients";

export type { TestOrderPriority };
export type { PatientListItem };

// ── Staged test item (selected in the form, not yet sent to API) ──────────────

export interface StagedItem {
  testCatalogId: string;
  testName: string;
  /** Joined from catalog's samples array — used only as placeholder text */
  sampleHint: string;
  parameterIds: string[];
  paramNames: string[];
  subtotal: number;
}

// ── Assignee ──────────────────────────────────────────────────────────────────

export interface AssigneeInfo {
  /** Membership ID */
  id: string;
  name: string;
}

// ── Progress ──────────────────────────────────────────────────────────────────

export type ProgressStepStatus = "pending" | "running" | "done" | "failed";

export interface ProgressStep {
  key: string;
  label: string;
  doneLabel: string;
  status: ProgressStepStatus;
}

export type ProgressPhase = "running" | "success" | "partialFail";
export type SheetMode = "form" | "progress";

// ── Section prop interfaces ───────────────────────────────────────────────────

export interface PatientPrioritySectionProps {
  patient: PatientListItem | null;
  priority: TestOrderPriority;
  showPatientError: boolean;
  initialPatientId?: string;
  initialPatientName?: string;
  onPatientChange: (p: PatientListItem | null) => void;
  onPriorityChange: (p: TestOrderPriority) => void;
}

export interface TestSelectionSectionProps {
  selectedTests: StagedItem[];
  showTestsError: boolean;
  onTestsChange: (tests: StagedItem[]) => void;
}

export interface AddNotesSectionProps {
  value: string;
  onChange: (notes: string) => void;
}

export interface CollectSamplesSectionProps {
  selectedTests: StagedItem[];
  /** Controlled chip map: testCatalogId → collected sample strings */
  value: Record<string, string[]>;
  onChange: (chips: Record<string, string[]>) => void;
}

export interface AssignScientistsSectionProps {
  selectedTests: StagedItem[];
  /** Needed to compute disabled state — assign requires samples entered */
  sampleChips: Record<string, string[]>;
  /** Controlled assignee map: testCatalogId → AssigneeInfo | null */
  value: Record<string, AssigneeInfo | null>;
  onChange: (assignees: Record<string, AssigneeInfo | null>) => void;
}

export interface ProgressViewProps {
  phase: ProgressPhase;
  steps: ProgressStep[];
  failedItems: string[];
  onCreateAnother: () => void;
  onViewOrder: () => void;
  onRetry: () => void;
}
