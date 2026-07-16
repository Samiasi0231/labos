import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  FlaskConical,
  Save,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";
import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  ResultEntryFormResponse,
  SaveResultDraftPayload,
  LabResult,
} from "@/api/types/results";
import { useToast } from "@/hooks/use-toast";

interface ResultEntryNavState {
  orderId: string;
  itemId: string;
  testName: string;
  patientId: string;
  patientName: string;
  priority: string;
}

function checkAbnormal(value: string, range?: { min: number; max: number }): boolean {
  if (!value.trim() || !range) return false;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num < range.min || num > range.max;
}

export default function ResultEntry() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const state = location.state as ResultEntryNavState | null;

  const entryFormUrl = state
    ? endpoint.lab.resultEntry.entryForm(state.orderId, state.itemId)
    : null;
  const { data: formData, isLoading, mutate: refetch } =
    useApi<ResultEntryFormResponse>(entryFormUrl);
  const form = formData?.data ?? null;

  const { trigger: triggerSaveDraft, isLoading: isSaving } = useMutation<
    LabResult,
    SaveResultDraftPayload
  >("results/save-draft", { method: "PUT", successToast: "Draft saved" });

  const { trigger: triggerSubmit, isLoading: isSubmitting } = useMutation<
    LabResult,
    void
  >("results/submit", { successToast: "Result submitted" });

  const [values, setValues] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (form?.existingResult) {
      const prefill: Record<string, string> = {};
      form.existingResult.values.forEach((v) => {
        prefill[v.parameterId] = v.value;
      });
      setValues(prefill);
      setNote(form.existingResult.notes ?? "");
    }
  }, [form?.existingResult]);

  const setValue = (paramId: string, val: string) => {
    setValues((prev) => ({ ...prev, [paramId]: val }));
    if (errors.has(paramId)) {
      setErrors((prev) => {
        const n = new Set(prev);
        n.delete(paramId);
        return n;
      });
    }
  };

  const params = form?.parameters ?? [];
  const missingParams = params.filter((p) => !values[p.parameterId]?.trim());

  const buildPayload = (): SaveResultDraftPayload => ({
    values: params
      .filter((p) => values[p.parameterId]?.trim())
      .map((p) => ({ parameterId: p.parameterId, value: values[p.parameterId] })),
    notes: note.trim() || undefined,
  });

  const handleSaveDraft = async () => {
    if (!state) return;
    const res = await triggerSaveDraft(
      buildPayload(),
      endpoint.lab.resultEntry.saveDraft(state.orderId, state.itemId),
    );
    if (!res) return;
  };

  const handleSubmit = async () => {
    if (!state) return;
    if (missingParams.length > 0) {
      setErrors(new Set(missingParams.map((p) => p.parameterId)));
      toast({
        title: "Missing values",
        description: "Fill in all parameters before submitting.",
        variant: "destructive",
      });
      return;
    }
    const saveRes = await triggerSaveDraft(
      buildPayload(),
      endpoint.lab.resultEntry.saveDraft(state.orderId, state.itemId),
    );
    if (!saveRes) return;
    const submitRes = await triggerSubmit(
      undefined,
      endpoint.lab.resultEntry.submit(state.orderId, state.itemId),
    );
    if (!submitRes) return;
    setSubmitted(true);
  };

  const returnInfo = useMemo(() => {
    if (form?.existingResult?.status !== "returned") return null;
    const timelines = form.existingResult.timelines ?? [];
    const entry = [...timelines].reverse().find((t) => t.status === "returned");
    if (!entry) return null;
    const by = entry.by;
    let reviewer = "Reviewer";
    if (typeof by === "object") {
      if (by.user && typeof by.user === "object") {
        const name = `${by.user.firstName ?? ""} ${by.user.lastName ?? ""}`.trim();
        reviewer = name || by.role || "Reviewer";
      } else if (by.role) {
        reviewer = by.role;
      }
    }
    return { comment: entry.note ?? "", reviewer };
  }, [form?.existingResult]);

  // ── Success ──
  if (submitted && state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold">Result Submitted</h2>
          <p className="text-sm text-muted-foreground">
            {state.testName} for{" "}
            <span className="font-medium text-foreground">{state.patientName}</span>{" "}
            has been sent for review.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setValues({});
              setNote("");
              setErrors(new Set());
              refetch();
            }}
          >
            Enter Another
          </Button>
          <Button onClick={() => navigate("/lab/assigned")}>Back to Tests</Button>
        </div>
      </div>
    );
  }

  // ── No state ──
  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <FlaskConical className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <div>
          <p className="font-semibold">No test selected</p>
          <p className="text-sm text-muted-foreground mt-1">
            Open this page from an assigned test to enter results.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/lab/assigned")}>
          Go to Assigned Tests
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5 animate-fade-in">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-semibold">Result Entry</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {form?.item.testName ?? state.testName}{" "}
          <span className="mx-1">·</span>
          {form
            ? `${form.patient.firstName} ${form.patient.lastName}`
            : state.patientName}
        </p>
      </div>

      {/* Returned notice */}
      {returnInfo && (
        <div className="rounded-lg border-l-4 border-warning bg-warning/10 px-4 py-3 flex items-start gap-3">
          <TriangleAlert className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">Returned for Correction</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              by {returnInfo.reviewer}
            </p>
            {returnInfo.comment && (
              <p className="text-xs text-foreground/70 italic mt-1">
                "{returnInfo.comment}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Parameters card */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-5 flex flex-col gap-5">
        <p className="text-[13px] font-semibold text-muted-foreground">Parameters</p>

        {isLoading && (
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-48 rounded" />
                <Skeleton className="h-10 w-72 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && params.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <FlaskConical className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No parameters configured for this test.
            </p>
          </div>
        )}

        {!isLoading &&
          params.map((param) => {
            const val = values[param.parameterId] ?? "";
            const hasError = errors.has(param.parameterId);
            const abnormal =
              param.type === "numeric" && checkAbnormal(val, param.referenceRange);

            return (
              <div key={param.parameterId} className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium leading-none">
                  {param.name}
                  {param.referenceRangeDisplay && (
                    <span className="ml-1.5 text-[11.5px] font-normal text-muted-foreground">
                      ({param.referenceRangeDisplay})
                    </span>
                  )}
                </label>

                {param.type === "numeric" && (
                  <div className="relative max-w-[280px]">
                    <Input
                      type="number"
                      placeholder="—"
                      value={val}
                      onChange={(e) => setValue(param.parameterId, e.target.value)}
                      className={`pr-14 h-10 transition-colors ${hasError || abnormal ? "border-destructive/50" : ""}`}
                    />
                    {param.unit && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none select-none">
                        {param.unit}
                      </span>
                    )}
                  </div>
                )}

                {param.type === "text" && (
                  <Input
                    type="text"
                    placeholder="Enter result"
                    value={val}
                    onChange={(e) => setValue(param.parameterId, e.target.value)}
                    className={`max-w-[400px] h-10 transition-colors ${hasError ? "border-destructive/50" : ""}`}
                  />
                )}

                {param.type === "select" && (
                  <Select
                    value={val}
                    onValueChange={(v) => setValue(param.parameterId, v)}
                  >
                    <SelectTrigger
                      className={`max-w-[280px] h-10 transition-colors ${hasError ? "border-destructive/50" : ""}`}
                    >
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {param.options?.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {abnormal && (
                  <p className="flex items-center gap-1.5 text-[11.5px] text-destructive">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    Outside reference range — will be flagged
                  </p>
                )}
                {hasError && !abnormal && (
                  <p className="text-[11.5px] text-destructive">
                    This field is required
                  </p>
                )}
              </div>
            );
          })}

        {!isLoading && params.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium">
                Result Note{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                placeholder="Add observations, interpretations, or clinical notes…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="resize-y text-sm"
              />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
          <Save className="w-4 h-4 mr-1.5" />
          Save Draft
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving || isSubmitting}>
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          {isSubmitting ? "Submitting…" : "Submit for Review"}
        </Button>
      </div>
    </div>
  );
}
