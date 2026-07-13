import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  RefreshCw,
  Clock,
  FileText,
  ThumbsUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useResultsList } from "@/hooks/use-results";
import endpoint from "@/api/endpoints";
import { downloadPDF } from "@/lib/download-pdf";
import type {
  LabResult,
  ResultStatus,
  PopulatedRef,
} from "@/api/types/results";

function getRefId<T>(ref: PopulatedRef<T>): string {
  return typeof ref === "string" ? ref : ref._id;
}

function isPopulated<T>(ref: PopulatedRef<T>): ref is T & { _id: string } {
  return typeof ref !== "string";
}

function getPatientName(ref: LabResult["patient"]): string {
  if (!isPopulated(ref)) return "Unknown patient";
  const { firstName, lastName, code } = ref;
  return (
    [firstName, lastName].filter(Boolean).join(" ") || code || "Unknown patient"
  );
}

function getTestName(ref: LabResult["testOrderItem"]): string {
  if (!isPopulated(ref)) return "Unknown test";
  return ref.testName ?? "Unknown test";
}

function getSampleType(ref: LabResult["testOrderItem"]): string {
  if (!isPopulated(ref)) return "";
  return ref.samples?.join(", ") ?? "";
}

const TABS: (ResultStatus | "All")[] = [
  "All",
  "submitted",
  "approved",
  "released",
  "returned",
];
const TAB_LABEL: Record<string, string> = {
  All: "All",
  submitted: "Submitted",
  approved: "Approved",
  released: "Released",
  returned: "Returned",
};

const STATUS_CONFIG: Record<
  ResultStatus,
  { label: string; cls: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    cls: "bg-muted/60 text-muted-foreground border",
    icon: FileText,
  },
  submitted: {
    label: "Submitted",
    cls: "bg-info/15 text-info border-info/30 border",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    cls: "bg-success/15 text-success border-success/30 border",
    icon: ThumbsUp,
  },
  released: {
    label: "Released",
    cls: "bg-primary/15 text-primary border-primary/30 border",
    icon: CheckCircle,
  },
  returned: {
    label: "Returned",
    cls: "bg-destructive/15 text-destructive border-destructive/30 border",
    icon: RefreshCw,
  },
};

function StatusPill({ status }: { status: ResultStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <Badge className={`text-xs gap-1 ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

function refId(ref: string | { _id: string } | undefined | null) {
  if (!ref) return "";
  return typeof ref === "string" ? ref : ref._id;
}

export default function PendingReviews() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { results, isLoading, error, refetch } = useResultsList({ limit: 100 });
  const [activeTab, setActiveTab] = useState<ResultStatus | "All">("All");
  const [selected, setSelected] = useState<LabResult | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (result: LabResult) => {
    setDownloading(true);
    try {
      await downloadPDF(
        endpoint.lab.results.download(result._id),
        `result-${result._id}.pdf`,
      );
    } catch {
      toast({
        title: "Download failed",
        description: "Could not download the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const reviewable = useMemo(
    () => results.filter((r) => r.status !== "draft"),
    [results],
  );

  const tabCounts = TABS.map((t) => ({
    t,
    count:
      t === "All"
        ? reviewable.length
        : reviewable.filter((r) => r.status === t).length,
  }));

  const filtered = reviewable.filter(
    (r) => activeTab === "All" || r.status === activeTab,
  );

  const isAbnormal = (r: LabResult) => r.values.some((v) => v.isAbnormal);

  const goCorrect = (result: LabResult) => {
    navigate("/lab/result-entry", {
      state: {
        orderId: getRefId(result.testOrder),
        itemId: getRefId(result.testOrderItem),
        testName: getTestName(result.testOrderItem),
        patientName: getPatientName(result.patient),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading results…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center bg-card border border-border rounded-2xl">
        <AlertTriangle className="w-8 h-8 text-destructive/60" />
        <p className="text-sm text-muted-foreground">Couldn't load results.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Pending Reviews</h2>
        <p className="text-sm text-muted-foreground">
          Track submitted results and approval status
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Submitted",
            count: reviewable.filter((r) => r.status === "submitted").length,
            color: "text-info",
            bg: "bg-info/10",
          },
          {
            label: "Approved",
            count: reviewable.filter((r) => r.status === "approved").length,
            color: "text-success",
            bg: "bg-success/10",
          },
          {
            label: "Released",
            count: reviewable.filter((r) => r.status === "released").length,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Returned",
            count: reviewable.filter((r) => r.status === "returned").length,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className={`shadow-card p-4 ${item.bg} border-0`}
          >
            <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Returned alert */}
      {reviewable.filter((r) => r.status === "returned").length > 0 && (
        <Alert className="border-destructive/30 bg-destructive/10">
          <RefreshCw className="w-4 h-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            {reviewable.filter((r) => r.status === "returned").length} result(s)
            were returned for correction. Please review and resubmit.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 pt-4 px-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ResultStatus | "All")}
          >
            <TabsList className="flex-wrap h-auto gap-1">
              {tabCounts.map(({ t, count }) => (
                <TabsTrigger key={t} value={t} className="gap-2 text-xs">
                  {TAB_LABEL[t]}
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5 min-w-[20px]"
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Test</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Submitted
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Approved By
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((result) => (
                    <TableRow
                      key={result._id}
                      className={`hover:bg-muted/20 transition-colors ${
                        result.status === "returned"
                          ? "border-l-2 border-l-destructive"
                          : ""
                      }`}
                    >
                      <TableCell className="pl-6 font-medium">
                        {getPatientName(result.patient)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {getTestName(result.testOrderItem)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {result.submittedAt
                          ? new Date(result.submittedAt).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground font-mono">
                        {result.approvedBy ? (
                          refId(result.approvedBy).slice(-6)
                        ) : (
                          <span className="text-muted-foreground/50 italic font-sans">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex gap-1">
                          {isAbnormal(result) && (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Abnormal
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusPill status={result.status} />
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              setSelected(result);
                              setViewOpen(true);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Button>
                          {result.status === "returned" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => goCorrect(result)}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Correct
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog — read-only tracking view */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Result Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Patient:</span>{" "}
                  <span className="font-medium">
                    {getPatientName(selected.patient)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Test:</span>{" "}
                  <span className="font-medium">
                    {getTestName(selected.testOrderItem)}
                  </span>
                </div>
                {getSampleType(selected.testOrderItem) && (
                  <div>
                    <span className="text-muted-foreground">Sample:</span>{" "}
                    <span className="text-xs">
                      {getSampleType(selected.testOrderItem)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <StatusPill status={selected.status} />
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  <span className="text-muted-foreground">
                    {selected.submittedAt
                      ? new Date(selected.submittedAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>

              {selected.approvedBy && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg text-sm text-success">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Approved
                    {selected.approvedAt &&
                      ` at ${new Date(selected.approvedAt).toLocaleString()}`}
                  </span>
                </div>
              )}

              {selected.status === "returned" && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <RefreshCw className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {selected.comments ||
                      "This result was returned for correction. Please review and resubmit."}
                  </span>
                </div>
              )}

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground grid grid-cols-3">
                  <span>Parameter</span>
                  <span className="text-center">Result</span>
                  <span className="text-right">Reference</span>
                </div>
                {selected.values.map((v) => (
                  <div
                    key={v.parameterId}
                    className="px-4 py-2.5 text-sm grid grid-cols-3 border-t border-border"
                  >
                    <span className="text-muted-foreground">
                      {v.parameterName}
                    </span>
                    <span
                      className={`text-center font-medium ${v.isAbnormal ? "text-destructive" : ""}`}
                    >
                      {v.value}
                      {v.unit ? ` ${v.unit}` : ""}
                    </span>
                    <span className="text-right text-xs text-muted-foreground">
                      {v.referenceRange ?? "—"}
                    </span>
                  </div>
                ))}
              </div>

              {isAbnormal(selected) && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Abnormal values detected in this result.</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={selected?.status !== "released" || downloading}
              onClick={() => selected && handleDownload(selected)}
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? "Downloading…" : "Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
