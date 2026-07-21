import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useMutation } from "@/hooks/use-api";
import { get } from "@/api/fetcher";
import endpoint from "@/api/endpoints";
import { useToast } from "@/hooks/use-toast";

import type { PatientListItem } from "@/api/types/patients";
import type {
  TestOrder,
  TestOrderItem,
  TestOrderPriority,
  CreateTestOrderPayload,
  CollectSamplePayload,
  AssignTestOrderItemPayload,
} from "@/api/types/test-order";

import type { StagedItem, AssigneeInfo, ProgressStep, ProgressPhase, SheetMode } from "./types";
import { PatientPrioritySection } from "./patient-priority";
import { TestSelectionSection } from "./test-selection";
import { AddNotesSection } from "./add-notes";
import { CollectSamplesSection } from "./collect-samples";
import { AssignScientistsSection } from "./assign-scientists";
import { ProgressView } from "./progress-view";

// ── Public props ──────────────────────────────────────────────────────────────

export interface CreateOrderInitialState {
  patientId?: string;
  patientName?: string;
}

export interface CreateOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialState?: CreateOrderInitialState;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyFormState() {
  return {
    patient: null as PatientListItem | null,
    priority: "routine" as TestOrderPriority,
    selectedTests: [] as StagedItem[],
    notes: "",
    sampleChips: {} as Record<string, string[]>,
    assignees: {} as Record<string, AssigneeInfo | null>,
    showPatientError: false,
    showTestsError: false,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateOrderSheet({
  open,
  onOpenChange,
  initialState,
}: CreateOrderSheetProps) {
  const { toast } = useToast();

  // ── Form state ───────────────────────────────────────────────────────────────
  const [patient, setPatient] = useState<PatientListItem | null>(null);
  const [priority, setPriority] = useState<TestOrderPriority>("routine");
  const [selectedTests, setSelectedTests] = useState<StagedItem[]>([]);
  const [notes, setNotes] = useState("");
  const [sampleChips, setSampleChips] = useState<Record<string, string[]>>({});
  const [assignees, setAssignees] = useState<Record<string, AssigneeInfo | null>>({});
  const [showPatientError, setShowPatientError] = useState(false);
  const [showTestsError, setShowTestsError] = useState(false);

  // ── Submission state ─────────────────────────────────────────────────────────
  const [mode, setMode] = useState<SheetMode>("form");
  const [progressPhase, setProgressPhase] = useState<ProgressPhase>("running");
  const [progressLog, setProgressLog] = useState<ProgressStep[]>([]);
  const [failedItems, setFailedItems] = useState<string[]>([]);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // ── API hooks ────────────────────────────────────────────────────────────────
<<<<<<< HEAD
  // Progress UI owns feedback. Create errors auto-toast; step errors stay in the log.
  const { trigger: createOrder } = useMutation<TestOrder, CreateTestOrderPayload>(
    endpoint.lab.testOrders.create,
    { invalidate: [endpoint.lab.testOrders.list] },
=======
  const { trigger: createOrder } = useMutation<TestOrder, CreateTestOrderPayload>(
    endpoint.lab.testOrders.create,
    { skipErrorHandling: true, invalidate: [endpoint.lab.testOrders.list] },
>>>>>>> origin/main
  );
  const { trigger: collectSample } = useMutation<TestOrderItem, CollectSamplePayload>(
    "test-orders/collect-sample",
    { skipErrorHandling: true, invalidate: [endpoint.lab.testOrders.list] },
  );
  const { trigger: assignTestOrderItem } = useMutation<TestOrderItem, AssignTestOrderItemPayload>(
    "test-orders/assign-item",
    { method: "PATCH", skipErrorHandling: true, invalidate: [endpoint.lab.testOrders.list] },
  );

  // ── Reset on open ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const s = emptyFormState();
    setPatient(s.patient);
    setPriority(s.priority);
    setSelectedTests(s.selectedTests);
    setNotes(s.notes);
    setSampleChips(s.sampleChips);
    setAssignees(s.assignees);
    setShowPatientError(s.showPatientError);
    setShowTestsError(s.showTestsError);
    setMode("form");
    setProgressPhase("running");
    setProgressLog([]);
    setFailedItems([]);
    setCreatedOrderId(null);
  }, [open]);

  // ── Validation ───────────────────────────────────────────────────────────────
  function validate(): boolean {
    const missingPatient = !patient;
    const missingTests = selectedTests.length === 0;
    setShowPatientError(missingPatient);
    setShowTestsError(missingTests);
    return !missingPatient && !missingTests;
  }

  // ── Progress log helpers ──────────────────────────────────────────────────────
  function markStep(key: string, status: ProgressStep["status"]) {
    setProgressLog((prev) =>
      prev.map((s) => (s.key === key ? { ...s, status } : s)),
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  async function submitOrder() {
    if (!validate()) return;
    if (!patient) return;

    const hasSamples = selectedTests.some(
      (t) => (sampleChips[t.testCatalogId] ?? []).length > 0,
    );
    const hasAssignments = selectedTests.some(
      (t) => !!assignees[t.testCatalogId],
    );

    // Build progress steps
    const steps: ProgressStep[] = [
      { key: "create", label: "Creating order…", doneLabel: "Order created", status: "running" },
    ];
    if (hasSamples)
      steps.push({
        key: "samples",
        label: "Recording samples…",
        doneLabel: "Samples recorded",
        status: "pending",
      });
    if (hasAssignments)
      steps.push({
        key: "assign",
        label: "Assigning scientists…",
        doneLabel: "Assignments saved",
        status: "pending",
      });

    setProgressLog(steps);
    setMode("progress");
    setProgressPhase("running");

    const failures: string[] = [];

<<<<<<< HEAD
    const payload: CreateTestOrderPayload = {
      patient: patient._id,
      priority,
      notes: notes.trim() || undefined,
      items: selectedTests.map((i) => ({
        testCatalogId: i.testCatalogId,
        parameterIds: i.parameterIds,
      })),
    };

    const createRes = await createOrder(payload);
    if (!createRes?.data) {
      setMode("form");
      return;
    }
    const created = createRes.data;
    setCreatedOrderId(created._id);
    markStep("create", "done");

    if (!hasSamples && !hasAssignments) {
      setProgressPhase("success");
      return;
    }

    const populatedRes = await get<TestOrder>(endpoint.lab.testOrders.get(created._id));
    const populatedItems: TestOrderItem[] = populatedRes.data?.items ?? [];

    if (hasSamples) {
      markStep("samples", "running");
      for (let i = 0; i < populatedItems.length; i++) {
        const apiItem = populatedItems[i];
        const staged = selectedTests[i];
        if (!staged || !apiItem) continue;
        const samples = (sampleChips[staged.testCatalogId] ?? []).filter((s) => s.trim());
        if (samples.length === 0) continue;
        try {
          await collectSample(
            { samples, materials: [] },
            endpoint.lab.testOrders.collectSample(created._id, apiItem._id),
          );
        } catch {
          failures.push(`Collect sample: ${staged.testName}`);
        }
      }
      markStep("samples", failures.some((f) => f.startsWith("Collect")) ? "failed" : "done");
    }

    if (hasAssignments) {
      markStep("assign", "running");
      for (let i = 0; i < populatedItems.length; i++) {
        const apiItem = populatedItems[i];
        const staged = selectedTests[i];
        if (!staged || !apiItem) continue;
        const assignee = assignees[staged.testCatalogId];
        if (!assignee) continue;
        const hasSampleForItem =
          (sampleChips[staged.testCatalogId] ?? []).length > 0;
        if (!hasSampleForItem) {
          failures.push(`Assign: ${staged.testName} (no sample collected)`);
          continue;
        }
        try {
          await assignTestOrderItem(
            { assignedTo: assignee.id },
            endpoint.lab.testOrders.assignItem(created._id, apiItem._id),
          );
        } catch {
          failures.push(`Assign: ${staged.testName}`);
        }
      }
      markStep("assign", failures.some((f) => f.startsWith("Assign")) ? "failed" : "done");
    }

    setFailedItems(failures);
    setProgressPhase(failures.length > 0 ? "partialFail" : "success");
=======
    try {
      // ── Step 1: Create order ─────────────────────────────────────────────────
      const payload: CreateTestOrderPayload = {
        patient: patient._id,
        priority,
        notes: notes.trim() || undefined,
        items: selectedTests.map((i) => ({
          testCatalogId: i.testCatalogId,
          parameterIds: i.parameterIds,
        })),
      };

      const createRes = await createOrder(payload);
      if (!createRes?.data) throw new Error("Order creation failed");
      const created = createRes.data;
      setCreatedOrderId(created._id);
      markStep("create", "done");

      if (!hasSamples && !hasAssignments) {
        setProgressPhase("success");
        return;
      }

      // ── Fetch populated items (match by index) ───────────────────────────────
      const populatedRes = await get<TestOrder>(endpoint.lab.testOrders.get(created._id));
      const populatedItems: TestOrderItem[] = populatedRes.data?.items ?? [];

      // ── Step 2: Collect samples ──────────────────────────────────────────────
      if (hasSamples) {
        markStep("samples", "running");
        for (let i = 0; i < populatedItems.length; i++) {
          const apiItem = populatedItems[i];
          const staged = selectedTests[i];
          if (!staged || !apiItem) continue;
          const samples = (sampleChips[staged.testCatalogId] ?? []).filter((s) => s.trim());
          if (samples.length === 0) continue;
          try {
            await collectSample(
              { samples, materials: [] },
              endpoint.lab.testOrders.collectSample(created._id, apiItem._id),
            );
          } catch {
            failures.push(`Collect sample: ${staged.testName}`);
          }
        }
        markStep("samples", failures.some((f) => f.startsWith("Collect")) ? "failed" : "done");
      }

      // ── Step 3: Assign scientists ────────────────────────────────────────────
      if (hasAssignments) {
        markStep("assign", "running");
        for (let i = 0; i < populatedItems.length; i++) {
          const apiItem = populatedItems[i];
          const staged = selectedTests[i];
          if (!staged || !apiItem) continue;
          const assignee = assignees[staged.testCatalogId];
          if (!assignee) continue;
          // Assignment requires sample to have been collected
          const hasSampleForItem =
            (sampleChips[staged.testCatalogId] ?? []).length > 0;
          if (!hasSampleForItem) {
            failures.push(`Assign: ${staged.testName} (no sample collected)`);
            continue;
          }
          try {
            await assignTestOrderItem(
              { assignedTo: assignee.id },
              endpoint.lab.testOrders.assignItem(created._id, apiItem._id),
            );
          } catch {
            failures.push(`Assign: ${staged.testName}`);
          }
        }
        markStep("assign", failures.some((f) => f.startsWith("Assign")) ? "failed" : "done");
      }

      setFailedItems(failures);
      setProgressPhase(failures.length > 0 ? "partialFail" : "success");
    } catch (err) {
      // Order creation itself failed — close progress, show toast
      setMode("form");
      toast({ title: "Failed to create order", variant: "destructive" });
    }
>>>>>>> origin/main
  }

  // ── Retry failed steps ───────────────────────────────────────────────────────
  async function retryFailed() {
    if (!createdOrderId) return;
    setProgressPhase("running");
    // Re-run only the failed steps — simplified: navigate to order detail to handle manually
    // Full retry logic deferred to API integration phase
    setProgressPhase("success");
    toast({ description: "Please complete remaining steps from the order detail page." });
  }

  function handleViewOrder() {
    onOpenChange(false);
    // Navigation to order detail handled by parent if needed
  }

  function handleCreateAnother() {
    const s = emptyFormState();
    setPatient(s.patient);
    setPriority(s.priority);
    setSelectedTests(s.selectedTests);
    setNotes(s.notes);
    setSampleChips(s.sampleChips);
    setAssignees(s.assignees);
    setShowPatientError(false);
    setShowTestsError(false);
    setMode("form");
    setProgressPhase("running");
    setProgressLog([]);
    setFailedItems([]);
    setCreatedOrderId(null);
  }

  const canSubmit = !!patient && selectedTests.length > 0;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <SheetContent className="sm:max-w-[560px] w-full p-0 flex flex-col overflow-hidden">

        {/* Header */}
        <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-[18px]">
            <ClipboardList className="w-4 h-4 text-primary" />
            New Test Order
          </SheetTitle>
          {mode === "form" && (
            <p className="text-[12.5px] text-muted-foreground">
              Patient and tests are required. Samples and assignments can be done
              now or later from order detail.
            </p>
          )}
        </SheetHeader>

        {/* Body */}
        {mode === "form" ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* A + B: Patient + Priority */}
              <PatientPrioritySection
                patient={patient}
                priority={priority}
                showPatientError={showPatientError}
                initialPatientId={initialState?.patientId}
                initialPatientName={initialState?.patientName}
                onPatientChange={setPatient}
                onPriorityChange={setPriority}
              />

              {/* Divider */}
              <div className="border-t border-border" />

              {/* C: Tests */}
              <TestSelectionSection
                selectedTests={selectedTests}
                showTestsError={showTestsError}
                onTestsChange={setSelectedTests}
              />

              {/* D: Notes */}
              <AddNotesSection value={notes} onChange={setNotes} />

              {/* E: Collect Samples */}
              <CollectSamplesSection
                selectedTests={selectedTests}
                value={sampleChips}
                onChange={setSampleChips}
              />

              {/* F: Assign Scientists */}
              <AssignScientistsSection
                selectedTests={selectedTests}
                sampleChips={sampleChips}
                value={assignees}
                onChange={setAssignees}
              />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex items-center justify-between gap-3 border-t border-border px-6 py-4">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={!canSubmit}
                onClick={submitOrder}
              >
                Create Order
              </Button>
            </div>
          </>
        ) : (
          /* Progress mode */
          <div className="flex flex-1 flex-col overflow-hidden">
            <ProgressView
              phase={progressPhase}
              steps={progressLog}
              failedItems={failedItems}
              onCreateAnother={handleCreateAnother}
              onViewOrder={handleViewOrder}
              onRetry={retryFailed}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
