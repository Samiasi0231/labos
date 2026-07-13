import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  User,
  FlaskConical,
  TestTube,
  Save,
  Send,
  TriangleAlert,
} from "lucide-react";
import {
  useResultEntryForm,
  useSaveResultDraft,
  useSubmitResult,
} from "@/hooks/use-results";
import { useToast } from "@/hooks/use-toast";

interface ResultEntryNavState {
  orderId: string;
  itemId: string;
  testName: string;
  patientId: string;
  patientName: string;
  priority: string;
}

function checkAbnormalClientSide(
  value: string,
  range?: { min: number; max: number },
): boolean {
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

  const { form, isLoading, refetch } = useResultEntryForm(
    state?.orderId ?? null,
    state?.itemId ?? null,
  );
  const { saveDraft, isLoading: isSaving } = useSaveResultDraft();
  const { submitResult, isLoading: isSubmitting } = useSubmitResult();

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill from existing draft/returned result
  useEffect(() => {
    if (form?.existingResult) {
      const prefill: Record<string, string> = {};
      form.existingResult.values.forEach((v) => {
        prefill[v.parameterId] = v.value;
      });
      setValues(prefill);
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
  const hasTriedSubmit = errors.size > 0;

  const buildValuesPayload = () =>
    params
      .filter((p) => values[p.parameterId]?.trim())
      .map((p) => ({
        parameterId: p.parameterId,
        value: values[p.parameterId],
      }));

  const handleSaveDraft = async () => {
    if (!state) return;
    try {
      await saveDraft(state.orderId, state.itemId, buildValuesPayload());
      toast({
        title: "Draft saved",
        description: "Your progress has been saved.",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
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
    try {
      // Save first — submit endpoint requires a saved draft and takes no body
      await saveDraft(state.orderId, state.itemId, buildValuesPayload());
      await submitResult(state.orderId, state.itemId);
      setSubmitted(true);
      toast({
        title: "Result submitted",
        description: `${state.testName} result for ${state.patientName} sent for review.`,
      });
    } catch {
      toast({
        title: "Submit failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ── Success state ──────────────────────────────────────────
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
            <span className="font-medium text-foreground">
              {state.patientName}
            </span>{" "}
            has been sent for review.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setValues({});
              setErrors(new Set());
              refetch();
            }}
          >
            Enter Another
          </Button>
          <Button onClick={() => navigate("/lab/assigned")}>
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  // ── No navigation state ────────────────────────────────────
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

const returnInfo =
  form?.existingResult?.status === "returned" && form.existingResult.comments
    ? {
        comment: form.existingResult.comments,
        reviewer:
          typeof form.existingResult.reviewedBy === "object" &&
          typeof form.existingResult.reviewedBy.user === "object"
            ? `${form.existingResult.reviewedBy.user.firstName ?? ""} ${
                form.existingResult.reviewedBy.user.lastName ?? ""
              }`
            : "Reviewer",
      }
    : null;

  return (
    <div className="flex h-full -m-4 md:-m-6 overflow-hidden animate-fade-in">
      <div className="hidden lg:flex flex-col w-72 xl:w-80 border-r border-border flex-shrink-0 overflow-y-auto bg-muted/20">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Patient
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {form
                    ? `${form.patient.firstName} ${form.patient.lastName}`
                    : state.patientName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {state.patientId}
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              <ContextRow label="Gender" value={form?.patient.gender ?? "—"} />
              <ContextRow
                label="DOB"
                value={form?.patient.dob ? form.patient.dob.slice(0, 10) : "—"}
              />
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Test
            </p>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FlaskConical className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">
                  {form?.item.testName ?? state.testName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {state.itemId}
                </p>
              </div>
            </div>
            <div className="space-y-2.5">
              <ContextRow label="Sample" value={form?.item.samples?.join(", ") ?? "—"} />
              <ContextRow label="Priority" value={state.priority} />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge className="text-[10px] bg-info/10 text-info border-info/30 border">
                  {form?.item.status ?? "—"}
                </Badge>
              </div>
            </div>
          </div>

          {returnInfo && (
            <>
              <div className="border-t border-border" />
              <div className="rounded-lg border-l-4 border-warning bg-warning/10 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="w-4 h-4 text-warning flex-shrink-0" />
                  <span className="text-xs font-semibold text-warning">
                    Returned for Correction
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground/80">
                  {returnInfo.reviewer}
                </p>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{returnInfo.comment}"
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-auto p-6 flex items-center gap-2 opacity-20 select-none">
          <TestTube className="w-5 h-5" />
          <span className="text-xs font-medium">Result Entry</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="lg:hidden px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {state.patientName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {state.testName}
            </p>
          </div>
          <Badge className="text-[10px] bg-info/10 text-info border-info/30 border flex-shrink-0">
            {form?.item.status ?? "—"}
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 xl:px-10 py-6 xl:py-8 space-y-1 max-w-2xl">
            {!isLoading && params.length > 0 && (
              <div className="grid grid-cols-[1fr_1.4fr_auto] gap-4 pb-3 border-b border-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Parameter
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Value
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20 text-right">
                  Reference
                </p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-5 pt-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1.4fr_auto] gap-4 items-center py-4 border-b border-border"
                  >
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-9 w-full rounded-md" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && params.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-20 text-center">
                <FlaskConical className="w-10 h-10 text-muted-foreground/40" />
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
                  param.type === "numeric" &&
                  checkAbnormalClientSide(val, param.referenceRange);

                return (
                  <div
                    key={param.parameterId}
                    className="grid grid-cols-[1fr_1.4fr_auto] gap-4 items-center py-4 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold leading-tight">
                        {param.name}
                      </p>
                      {param.unit && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {param.unit}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {param.type === "numeric" && (
                        <Input
                          type="number"
                          placeholder="Enter value"
                          value={val}
                          onChange={(e) =>
                            setValue(param.parameterId, e.target.value)
                          }
                          className={`h-9 transition-colors ${hasError ? "border-destructive ring-destructive/20 ring-1 focus-visible:ring-destructive/30" : ""}`}
                        />
                      )}
                      {param.type === "text" && (
                        <Input
                          type="text"
                          placeholder="Enter result"
                          value={val}
                          onChange={(e) =>
                            setValue(param.parameterId, e.target.value)
                          }
                          className={`h-9 transition-colors ${hasError ? "border-destructive ring-destructive/20 ring-1 focus-visible:ring-destructive/30" : ""}`}
                        />
                      )}
                      {param.type === "select" && (
                        <Select
                          value={val}
                          onValueChange={(v) => setValue(param.parameterId, v)}
                        >
                          <SelectTrigger
                            className={`h-9 transition-colors ${hasError ? "border-destructive ring-destructive/20 ring-1 focus-visible:ring-destructive/30" : ""}`}
                          >
                            <SelectValue placeholder="Select result" />
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
                        <Badge className="text-[10px] px-1.5 py-0.5 shrink-0 bg-warning/15 text-warning border-warning/40 border flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Abnormal
                        </Badge>
                      )}
                    </div>

                    <div className="w-20 text-right">
                      {param.referenceRangeDisplay ? (
                        <p className="text-xs text-muted-foreground leading-snug">
                          {param.referenceRangeDisplay}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/30">—</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="border-t border-border bg-background px-6 xl:px-10 py-4 flex-shrink-0">
          {hasTriedSubmit && missingParams.length > 0 && (
            <p className="text-xs text-destructive mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {missingParams.length} parameter
              {missingParams.length !== 1 ? "s" : ""} still need values
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              className="gap-2"
              onClick={handleSubmit}
              disabled={isSaving || isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Submitting..." : "Submit Result"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {label}
      </span>
      <span className="text-xs font-medium text-right truncate">{value}</span>
    </div>
  );
}
