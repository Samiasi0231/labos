import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Printer,
  Share2,
} from "lucide-react";
import { useResultsList, useResult } from "@/hooks/use-results";
import type { LabResult, PopulatedRef } from "@/api/types/results";


function getRef<T>(ref: PopulatedRef<T> | undefined): T | null {
  if (!ref || typeof ref === "string") return null;
  return ref;
}

function getTestName(result: LabResult): string {
  const item = getRef<{ testName?: string; sampleType?: string }>(
    result.testOrderItem,
  );
  return item?.testName ?? "Test result";
}

function getPatientName(result: LabResult): string {
  const patient = getRef<{
    firstName?: string;
    lastName?: string;
    code?: string;
  }>(result.patient);
  if (!patient) return "";
  return [patient.firstName, patient.lastName].filter(Boolean).join(" ");
}

function getResultDate(result: LabResult): string {
  const iso =
    result.releasedAt ??
    result.approvedAt ??
    result.submittedAt ??
    result.createdAt;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isAbnormalResult(result: LabResult): boolean {
  return result.values.some((v) => v.isAbnormal);
}

export default function MyResults() {
  const [activeTab, setActiveTab] = useState<"All" | "Abnormal">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Patients only ever see released results
  const { results, isLoading } = useResultsList({
    status: "released",
    limit: 100,
  });

  const { result: selected, isLoading: isSelectedLoading } =
    useResult(selectedId);

  const filtered = results.filter((r) => {
    if (activeTab === "Abnormal") return isAbnormalResult(r);
    return true;
  });

  const abnormalCount = results.filter(isAbnormalResult).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Test Results</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${results.length} results on record`}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{results.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Results</p>
        </Card>
        <Card className="shadow-card p-4 text-center border-warning/30">
          <p className="text-2xl font-bold text-warning">{abnormalCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Need Attention</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList className="gap-1">
          <TabsTrigger value="All" className="gap-2 text-xs">
            All{" "}
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {results.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="Abnormal" className="gap-2 text-xs">
            Abnormal{" "}
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {abnormalCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Results list */}
      <div className="space-y-3">
        {isLoading ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Loading results…
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No results found.
            </CardContent>
          </Card>
        ) : (
          filtered.map((r) => {
            const abnormal = isAbnormalResult(r);
            return (
              <Card
                key={r._id}
                className="shadow-card cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => setSelectedId(r._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        abnormal
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">
                          {getTestName(r)}
                        </p>
                        {abnormal && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 border-warning/40 text-warning gap-1"
                          >
                            <AlertCircle className="w-2.5 h-2.5" />
                            Attention
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getResultDate(r)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className="text-xs border-success/30 text-success"
                      >
                        <CheckCircle className="w-3 h-3 mr-1 inline" />
                        Released
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail dialog */}
      <Dialog
        open={!!selectedId}
        onOpenChange={(v) => !v && setSelectedId(null)}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {selected ? getTestName(selected) : "Loading…"}
            </DialogTitle>
          </DialogHeader>

          {isSelectedLoading && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading result…
            </p>
          )}

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Released</p>
                  <p className="font-medium">{getResultDate(selected)}</p>
                </div>
                <div className="space-y-1 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium text-xs">
                    {getPatientName(selected) || "—"}
                  </p>
                </div>
              </div>

              {isAbnormalResult(selected) && (
                <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/30 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-warning">
                      Attention Needed
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      One or more values are outside the reference range. Please
                      consult your doctor.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  Parameters
                </p>
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="grid grid-cols-4 gap-0 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <span className="col-span-2">Parameter</span>
                    <span>Value</span>
                    <span>Reference</span>
                  </div>
                  <div className="divide-y divide-border">
                    {selected.values.map((v) => (
                      <div
                        key={v.parameterId}
                        className={`grid grid-cols-4 gap-0 px-3 py-2.5 text-sm ${v.isAbnormal ? "bg-warning/5" : ""}`}
                      >
                        <span className="col-span-2 text-xs">
                          {v.parameterName}
                        </span>
                        <span
                          className={`font-semibold text-xs flex items-center gap-1 ${
                            v.isAbnormal ? "text-warning" : "text-foreground"
                          }`}
                        >
                          {v.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {v.referenceRange ?? "—"}{" "}
                          <span className="text-[10px]">{v.unit ?? ""}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selected.comments && (
                <div className="p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Comments
                  </p>
                  <p className="text-sm leading-relaxed">{selected.comments}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" size="sm">
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
