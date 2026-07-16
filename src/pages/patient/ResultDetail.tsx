import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, CheckCircle2, Loader2 } from "lucide-react";
import { notify } from "@/lib/notify";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import { downloadPDF } from "@/lib/utils";
import type { ResultFlag, PatientResultDetail } from "@/api/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] +
    " " + d.getDate() + ", " + d.getFullYear();
}

function staffName(
  signatory?: { _id: string; role: string; user: { firstName?: string; lastName?: string } }
): string {
  if (!signatory) return "—";
  const { firstName, lastName } = signatory.user;
  return [firstName, lastName].filter(Boolean).join(" ") || "—";
}

function FlagBadge({ flag }: { flag: ResultFlag }) {
  if (!flag) return <CheckCircle2 className="w-4 h-4 text-success mx-auto" />;
  return (
    <Badge className="text-[11px] px-2 py-0 h-5 bg-destructive/12 text-destructive border-destructive/30 border font-bold">
      {flag}
    </Badge>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResultDetail() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const { data: resultData, isLoading } = useApi<PatientResultDetail>(
    resultId ? endpoint.patient.result(resultId) : null
  );
  const result = resultData?.data ?? null;

  const handleDownload = async () => {
    if (!resultId) return;
    setDownloading(true);
    try {
      await downloadPDF(
        endpoint.patient.downloadResult(resultId),
        `result-${resultId}.pdf`
      );
    } catch {
      notify.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground -ml-2"
          onClick={() => navigate("/patient/results")}>
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </Button>
        <p className="text-sm text-muted-foreground">Result not found.</p>
      </div>
    );
  }

  const testName =
    result.testOrderItem && typeof result.testOrderItem === "object" && "testName" in result.testOrderItem
      ? (result.testOrderItem as { testName?: string }).testName ?? "Test Result"
      : "Test Result";

  const patientObj = result.patient && typeof result.patient === "object" ? result.patient as Record<string, string> : null;
  const patientName = patientObj ? [patientObj.firstName, patientObj.lastName].filter(Boolean).join(" ") || "—" : "—";
  const patientCode = patientObj?.code ?? "—";

  return (
    <div className="space-y-5 animate-fade-in">
      <Button
        variant="ghost" size="sm"
        className="gap-1.5 text-muted-foreground -ml-2"
        onClick={() => navigate("/patient/results")}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Results
      </Button>

      {/* Header card */}
      <Card className="shadow-card">
        <CardContent className="pt-5 pb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Patient</p>
              <p className="font-semibold mt-0.5">{patientName}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Patient Code</p>
              <p className="font-semibold font-mono mt-0.5">{patientCode}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Test</p>
              <p className="font-semibold mt-0.5">{testName}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Released</p>
              <p className="font-semibold mt-0.5">{result.releasedAt ? fmtDate(result.releasedAt) : "—"}</p>
            </div>
          </div>
          <Button className="gap-1.5" disabled={downloading} onClick={handleDownload}>
            {downloading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
            Download PDF
          </Button>
        </CardContent>
      </Card>

      {/* Parameter table */}
      <Card className="shadow-card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="text-left px-6 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground w-[30%]">Parameter</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground w-[18%]">Result</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground w-[12%]">Unit</th>
              <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground w-[25%]">Reference Range</th>
              <th className="text-center px-6 py-3 font-semibold text-xs uppercase tracking-wide text-muted-foreground w-[15%]">Flag</th>
            </tr>
          </thead>
          <tbody>
            {result.values.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                  No parameter values available.
                </td>
              </tr>
            ) : (
              result.values.map((v, i) => (
                <tr
                  key={i}
                  className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}
                >
                  <td className="px-6 py-2.5 font-medium text-sm">{v.name}</td>
                  <td className={`px-4 py-2.5 font-bold ${v.flag ? "text-destructive" : "text-foreground"}`}>
                    {v.value}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{v.unit ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{v.referenceRange ?? "—"}</td>
                  <td className="px-6 py-2.5 text-center">
                    <FlagBadge flag={v.flag} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Signatories */}
      {(result.submittedBy || result.approvedBy) && (
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {result.submittedBy && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Submitted By
                </p>
                <p className="text-sm font-semibold">{staffName(result.submittedBy)}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {result.submittedBy.role}
                  {result.submittedAt ? ` · ${fmtDate(result.submittedAt)}` : ""}
                </p>
              </div>
            )}
            {result.approvedBy && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Approved By
                </p>
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  {staffName(result.approvedBy)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {result.approvedBy.role}
                  {result.approvedAt ? ` · ${fmtDate(result.approvedAt)}` : ""}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
