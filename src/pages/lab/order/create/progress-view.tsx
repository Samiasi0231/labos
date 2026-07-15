import { CheckCircle2, Loader2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProgressViewProps, ProgressStep } from "./types";

function StepIcon({ status }: { status: ProgressStep["status"] }) {
  if (status === "done")
    return <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />;
  if (status === "failed")
    return <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />;
  if (status === "running")
    return (
      <Loader2 className="w-5 h-5 text-primary flex-shrink-0 animate-spin" />
    );
  // pending
  return (
    <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />
  );
}

export function ProgressView({
  phase,
  steps,
  failedItems,
  onCreateAnother,
  onViewOrder,
  onRetry,
}: ProgressViewProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5">

      {/* ── Running ──────────────────────────────────────────────────────────── */}
      {phase === "running" && (
        <div className="w-full max-w-[340px] space-y-4">
          {steps.map((step) => (
            <div key={step.key} className="flex items-center gap-3">
              <StepIcon status={step.status} />
              <span
                className={`text-[13.5px] font-medium transition-colors ${
                  step.status === "done"
                    ? "text-foreground"
                    : step.status === "failed"
                    ? "text-destructive"
                    : step.status === "running"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.status === "done" ? step.doneLabel : step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Success ──────────────────────────────────────────────────────────── */}
      {phase === "success" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="w-10 h-10 text-success" />
          <div className="space-y-1">
            <p className="text-base font-bold">Order placed successfully</p>
            <p className="text-[12.5px] text-muted-foreground">
              {steps.length} step{steps.length !== 1 ? "s" : ""} completed
            </p>
          </div>
          <div className="flex gap-2.5 mt-2">
            <Button variant="outline" size="sm" onClick={onCreateAnother}>
              Create Another
            </Button>
            <Button size="sm" onClick={onViewOrder}>
              View Order →
            </Button>
          </div>
        </div>
      )}

      {/* ── Partial fail ─────────────────────────────────────────────────────── */}
      {phase === "partialFail" && (
        <div className="flex w-full max-w-[360px] flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-9 h-9 text-warning" />
          <div className="space-y-1">
            <p className="text-[15px] font-bold">Order created — some steps failed</p>
            <p className="text-[12px] text-muted-foreground">
              The order was saved. The steps below did not complete.
            </p>
          </div>
          <div className="w-full space-y-2 text-left">
            {failedItems.map((label, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2"
              >
                <span className="text-[12.5px]">{label}</span>
                <span className="text-[11px] font-bold text-destructive">Failed</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm" onClick={onViewOrder}>
              View Order Anyway
            </Button>
            <Button size="sm" onClick={onRetry}>
              Retry Failed
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
