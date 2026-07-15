import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Undo2,
  Send,
  Download,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import { useToast } from "@/hooks/use-toast";
import { useMyPermissions } from "@/hooks/use-api";
import { downloadPDF, asPopulated, refId } from "@/lib/utils";
import type {
  LabResult,
  ResultStatus,
  ReturnResultPayload,
  ResultValue,
  TimelineEntry,
} from "@/api/types/results";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ResultStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground border" },
  submitted: { label: "Pending Approval", cls: "bg-warning/15 text-warning border-warning/30 border" },
  returned: { label: "Returned", cls: "bg-destructive/15 text-destructive border-destructive/30 border" },
  approved: { label: "Approved", cls: "bg-success/15 text-success border-success/30 border" },
  released: { label: "Released", cls: "bg-primary/15 text-primary border-primary/30 border" },
};

const TIMELINE_DOT: Record<ResultStatus, string> = {
  draft: "bg-muted-foreground",
  submitted: "bg-warning",
  returned: "bg-destructive",
  approved: "bg-primary",
  released: "bg-success",
};

const TIMELINE_LABEL: Record<ResultStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  returned: "Returned",
  approved: "Approved",
  released: "Released",
};

function getFlag(v: ResultValue): "H" | "L" | null {
  if (!v.isAbnormal) return null;
  const num = parseFloat(v.value);
  if (isNaN(num) || !v.referenceRange) return null;
  const m = v.referenceRange.match(/(\d+(?:\.\d+)?)\s*[–\-]\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  if (num < parseFloat(m[1])) return "L";
  if (num > parseFloat(m[2])) return "H";
  return null;
}

function patientName(result: LabResult): string {
  const p = asPopulated(result.patient);
  if (!p) return refId(result.patient);
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.code || refId(result.patient);
}

function testName(result: LabResult): string {
  const item = asPopulated(result.testOrderItem);
  return item?.testName ?? refId(result.testOrderItem);
}


function timelineActor(entry: TimelineEntry): { name: string; role: string } {
  const by = entry.by;
  if (typeof by === "object") {
    const role = by.role ?? "";
    if (by.user && typeof by.user === "object") {
      const name = `${by.user.firstName ?? ""} ${by.user.lastName ?? ""}`.trim();
      return { name: name || "—", role };
    }
    return { name: role || "—", role };
  }
  return { name: "—", role: "" };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LabResultDetail() {
  const { resultId } = useParams<{ resultId: string }>();
  const { toast } = useToast();
  const { can } = useMyPermissions();

  const invalidate = [
    endpoint.lab.results.list,
    ...(resultId ? [endpoint.lab.results.get(resultId)] : []),
  ];

  const { data: resultData, isLoading, error } = useApi<LabResult>(
    resultId ? endpoint.lab.results.get(resultId) : null,
  );
  const result = resultData?.data ?? null;

  const { trigger: approveResult, isLoading: isApproving } = useMutation<LabResult, void>(
    "results/approve",
    { skipErrorHandling: true, invalidate },
  );
  const { trigger: returnResult, isLoading: isReturning } = useMutation<LabResult, ReturnResultPayload>(
    "results/return",
    { skipErrorHandling: true, invalidate },
  );
  const { trigger: releaseResult, isLoading: isReleasing } = useMutation<LabResult, void>(
    "results/release",
    { skipErrorHandling: true, invalidate },
  );

  const [returnOpen, setReturnOpen] = useState(false);
  const [returnNote, setReturnNote] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleApprove = async () => {
    if (!result) return;
    try {
      const res = await approveResult(undefined, endpoint.lab.results.approve(result._id));
      if (!res) throw new Error();
      toast({ title: "Result Approved", description: "Ready to release to the patient." });
    } catch {
      toast({ title: "Approve failed", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleRelease = async () => {
    if (!result) return;
    try {
      const res = await releaseResult(undefined, endpoint.lab.results.release(result._id));
      if (!res) throw new Error();
      toast({ title: "Result Released", description: "The patient can now view this result." });
    } catch {
      toast({ title: "Release failed", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleReturn = async () => {
    if (!result) return;
    if (!returnNote.trim()) {
      toast({ title: "Note required", description: "A note is required when returning a result.", variant: "destructive" });
      return;
    }
    try {
      const res = await returnResult(
        { note: returnNote.trim() },
        endpoint.lab.results.return(result._id),
      );
      if (!res) throw new Error();
      setReturnOpen(false);
      setReturnNote("");
      toast({ title: "Result Returned", description: "Sent back to the lab scientist for correction." });
    } catch {
      toast({ title: "Return failed", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      await downloadPDF(
        endpoint.lab.results.download(result._id),
        `result-${result._id}.pdf`,
      );
    } catch {
      toast({ title: "Download failed", description: "Could not download the PDF.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-5 animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56 rounded" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <AlertTriangle className="w-8 h-8 text-destructive/60" />
        <p className="text-sm text-muted-foreground">Could not load result.</p>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[result.status];
  const timelines = result.timelines ?? [];

  const canReturn = result.status === "submitted" && can("results.return");
  const canApprove = result.status === "submitted" && can("results.approve");
  const canRelease = result.status === "approved" && can("results.release");

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5 animate-fade-in pb-8">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{testName(result)}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            <Link
              to={`/lab/patients/${refId(result.patient)}`}
              className="text-primary hover:underline"
            >
              {patientName(result)}
            </Link>
            <span className="mx-1.5">·</span>
            <Link
              to={`/lab/tests/${refId(result.testOrder)}`}
              className="text-primary hover:underline"
            >
              #{refId(result.testOrder).slice(-8).toUpperCase()}
            </Link>
          </p>
        </div>
        <Badge variant="outline" className={`text-xs whitespace-nowrap ${statusCfg.cls}`}>
          {statusCfg.label}
        </Badge>
      </div>

      {/* ── Result Note ── */}
      {result.notes && (
        <div className="rounded-xl border border-border bg-muted/20 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Result Note
          </p>
          <p className="text-[13.5px] leading-relaxed text-foreground">
            {result.notes}
          </p>
        </div>
      )}

      {/* ── Values table ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 pl-5 pr-3">
                Parameter
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3">
                Result
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3">
                Unit
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 px-3">
                Reference Range
              </th>
              <th className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 pl-3 pr-5">
                Flag
              </th>
            </tr>
          </thead>
          <tbody>
            {result.values.map((v) => {
              const flag = getFlag(v);
              return (
                <tr
                  key={v.parameterId}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-3 pl-5 pr-3 font-medium text-[13px]">
                    {v.parameterName}
                  </td>
                  <td
                    className={`py-3 px-3 font-bold text-[13px] ${v.isAbnormal ? "text-destructive" : "text-foreground"}`}
                  >
                    {v.value}
                  </td>
                  <td className="py-3 px-3 text-[13px] text-muted-foreground">
                    {v.unit || "—"}
                  </td>
                  <td className="py-3 px-3 text-[13px] text-muted-foreground">
                    {v.referenceRange || "—"}
                  </td>
                  <td className="py-3 pl-3 pr-5 text-center">
                    {v.isAbnormal ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-destructive/12 text-destructive border border-destructive/25">
                        {flag ?? "!"}
                      </span>
                    ) : (
                      <Check className="w-3.5 h-3.5 text-success mx-auto" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Timeline ── */}
      {timelines.length > 0 && (
        <div className="rounded-xl border border-border bg-card px-5 py-5">
          <p className="text-[13px] font-semibold text-muted-foreground mb-4">
            Timeline
          </p>
          <div className="flex flex-col">
            {timelines.map((entry, idx) => {
              const actor = timelineActor(entry);
              const isLast = idx === timelines.length - 1;
              return (
                <div key={idx} className="flex gap-3.5">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${TIMELINE_DOT[entry.status] ?? "bg-muted-foreground"}`}
                    />
                    {!isLast && (
                      <span className="w-0.5 flex-1 min-h-[20px] bg-border mt-0.5" />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`flex-1 min-w-0 ${isLast ? "" : "pb-5"}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-semibold">
                        {TIMELINE_LABEL[entry.status] ?? entry.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {actor.name}
                        {actor.role && ` · ${actor.role}`}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground/80 mt-0.5">
                      {new Date(entry.at).toLocaleString()}
                    </p>
                    {entry.note && (
                      <div className="mt-2 rounded-md bg-destructive/[0.06] border border-destructive/20 px-3 py-2.5">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-destructive mb-1">
                          Note
                        </p>
                        <p className="text-[12.5px] leading-relaxed text-foreground">
                          {entry.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2">
        {result.status === "released" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={downloading}
            onClick={handleDownload}
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Downloading…" : "Download PDF"}
          </Button>
        )}
        {canReturn && (
          <Button
            variant="outline"
            className="gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => { setReturnNote(""); setReturnOpen(true); }}
          >
            <Undo2 className="w-4 h-4" />
            Return
          </Button>
        )}
        {canApprove && (
          <Button className="gap-1.5" onClick={handleApprove} disabled={isApproving}>
            <CheckCircle2 className="w-4 h-4" />
            {isApproving ? "Approving…" : "Approve"}
          </Button>
        )}
        {canRelease && (
          <Button className="gap-1.5" onClick={handleRelease} disabled={isReleasing}>
            <Send className="w-4 h-4" />
            {isReleasing ? "Releasing…" : "Release to Patient"}
          </Button>
        )}
      </div>

      {/* ── Return dialog ── */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Return Result</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">
            Send this result back to the lab scientist for correction.
          </p>
          <div className="space-y-2 py-1">
            <Label>
              Note <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Explain what needs to be corrected before resubmission…"
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReturn}
              disabled={isReturning}
              className="gap-2"
            >
              <Undo2 className="w-4 h-4" />
              {isReturning ? "Returning…" : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
