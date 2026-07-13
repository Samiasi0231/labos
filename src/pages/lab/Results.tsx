import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  QrCode,
  ThumbsUp,
  Send,
  TrendingUp,
  Undo2,
} from "lucide-react";
import {
  useResultsList,
  useApproveResult,
  useReturnResult,
  useReleaseResult,
} from "@/hooks/use-results";
import { asPopulated, refId } from "@/lib/pouplated-ref";
import { useToast } from "@/hooks/use-toast";
import { useMyPermissions } from "@/hooks/use-permissions";
import endpoint from "@/api/endpoints";
import { downloadPDF } from "@/lib/download-pdf";
import type { LabResult, ResultStatus } from "@/api/types/results";
const STATUS_CONFIG: Record<ResultStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground border" },
  submitted: {
    label: "Submitted",
    cls: "bg-info/15 text-info border-info/30 border",
  },
  returned: {
    label: "Returned",
    cls: "bg-destructive/15 text-destructive border-destructive/30 border",
  },
  approved: {
    label: "Approved",
    cls: "bg-success/15 text-success border-success/30 border",
  },
  released: {
    label: "Released",
    cls: "bg-primary/15 text-primary border-primary/30 border",
  },
};

function ResultStatusBadge({ status }: { status: ResultStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-xs ${cfg.cls}`}>
      {cfg.label}
    </Badge>
  );
}


function patientLabel(result: LabResult): string {
  const p = asPopulated(result.patient);
  return p
    ? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() ||
        p.code ||
        refId(result.patient)
    : refId(result.patient);
}

function staffLabel(ref?: LabResult["submittedBy"]): string {
  if (!ref) return "—";
  const staff = asPopulated(ref);
  if (!staff) return refId(ref); 
  const user = staff.user ? asPopulated(staff.user) : undefined;
  const name = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";
  return name || staff.role || refId(ref);
}


function testLabel(result: LabResult): string {
  const item = asPopulated(result.testOrderItem);
  return item?.testName ?? refId(result.testOrderItem);
}

const TABS: (ResultStatus | "All")[] = [
  "All",
  "submitted",
  "returned",
  "approved",
  "released",
];
const TAB_LABEL: Record<string, string> = {
  All: "All",
  submitted: "Submitted",
  returned: "Returned",
  approved: "Approved",
  released: "Released",
};

export default function Results() {
  const [activeTab, setActiveTab] = useState<ResultStatus | "All">("All");
  const [selected, setSelected] = useState<LabResult | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  const { can } = useMyPermissions();

  const { results, isLoading, listUrl } = useResultsList({
    status: activeTab === "All" ? undefined : activeTab,
    limit: 100,
  });
  const { approve } = useApproveResult([listUrl]);
  const { returnResult } = useReturnResult([listUrl]);
  const { release } = useReleaseResult([listUrl]);


  const handleApprove = async (result: LabResult) => {
    try {
      await approve(result._id);
      setViewOpen(false);
      toast({
        title: "Result Approved",
        description: "Result approved and ready for release.",
      });
    } catch {
      toast({
        title: "Approve failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleRelease = async (result: LabResult) => {
    try {
      await release(result._id);
      setViewOpen(false);
      toast({
        title: "Result Released",
        description: "Result released to the patient.",
      });
    } catch {
      toast({
        title: "Release failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const openReturn = (result: LabResult) => {
    setSelected(result);
    setReturnComment("");
    setReturnOpen(true);
  };

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

  const handleReturn = async () => {
    if (!selected) return;
    if (!returnComment.trim()) {
      toast({
        title: "Comment required",
        description: "Explain what needs to be corrected.",
        variant: "destructive",
      });
      return;
    }
    try {
      await returnResult(selected._id, returnComment.trim());
      setReturnOpen(false);
      setViewOpen(false);
      toast({
        title: "Result returned",
        description: "Sent back to the scientist for correction.",
      });
    } catch {
      toast({
        title: "Return failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Results Management</h2>
        <p className="text-sm text-muted-foreground">
          Review, approve, and release laboratory results
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2 pt-4 px-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ResultStatus | "All")}
          >
            <TabsList className="flex-wrap h-auto gap-1">
              {TABS.map((t) => (
                <TabsTrigger key={t} value={t} className="gap-2 text-xs">
                  {TAB_LABEL[t]}
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
                    Submitted By
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Submitted At
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Loading results…
                    </TableCell>
                  </TableRow>
                ) : results.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => {
                    const hasAbnormal = result.values.some((v) => v.isAbnormal);
                    return (
                      <TableRow
                        key={result._id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="pl-6 font-medium">
                          {patientLabel(result)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {testLabel(result)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {staffLabel(result.submittedBy)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {result.submittedAt
                            ? new Date(result.submittedAt).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {hasAbnormal ? (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Abnormal
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs gap-1 text-success border-success/30"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Normal
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <ResultStatusBadge status={result.status} />
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="link"
                              className="h-auto py-0 px-1 text-[12px]"
                              onClick={() => {
                                setSelected(result);
                                setViewOpen(true);
                              }}
                            >
                              View
                            </Button>
                            {result.status === "submitted" && can("results.approve") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-success border-success/30 hover:bg-success/10"
                                onClick={() => handleApprove(result)}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                Approve
                              </Button>
                            )}
                            {result.status === "submitted" && can("results.return") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => openReturn(result)}
                              >
                                <Undo2 className="w-3.5 h-3.5" />
                                Return
                              </Button>
                            )}
                            {result.status === "approved" && can("results.release") && (
                              <Button
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => handleRelease(result)}
                              >
                                <Send className="w-3.5 h-3.5" />
                                Release
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Result Detail Dialog ── */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Result Details
            </DialogTitle>
          </DialogHeader>

          {selected &&
            (() => {
              const hasAbnormal = selected.values.some((v) => v.isAbnormal);
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm p-4 bg-muted/20 rounded-lg">
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Patient
                      </span>
                      <p className="font-semibold">{patientLabel(selected)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Test
                      </span>
                      <p className="font-semibold">{testLabel(selected)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Status
                      </span>
                      <div className="mt-0.5">
                        <ResultStatusBadge status={selected.status} />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Submitted by
                      </span>
                      <p className="font-medium">
                        {staffLabel(selected.submittedBy)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Submitted at
                      </span>
                      <p className="font-medium">
                        {selected.submittedAt
                          ? new Date(selected.submittedAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                    {selected.approvedBy && (
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Approved by
                        </span>
                        <p className="font-medium">
                          {staffLabel(selected.approvedBy)}
                        </p>
                      </div>
                    )}
                    {selected.comments && selected.status === "returned" && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground text-xs">
                          Return comment
                        </span>
                        <p className="font-medium italic">
                          "{selected.comments}"
                        </p>
                      </div>
                    )}
                  </div>

                  {hasAbnormal && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive border border-destructive/20">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {selected.values.filter((v) => v.isAbnormal).length}{" "}
                        parameter(s) outside reference range. Review carefully
                        before approving.
                      </span>
                    </div>
                  )}

                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 bg-muted/40 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <div className="col-span-4">Parameter</div>
                      <div className="col-span-2 text-center">Result</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-3">Reference</div>
                      <div className="col-span-1 text-center">Flag</div>
                    </div>
                    {selected.values.map((v) => (
                      <div
                        key={v.parameterId}
                        className={`grid grid-cols-12 px-3 py-2.5 text-sm border-t border-border ${v.isAbnormal ? "bg-destructive/5" : ""}`}
                      >
                        <div className="col-span-4 text-muted-foreground font-medium text-xs">
                          {v.parameterName}
                        </div>
                        <div
                          className={`col-span-2 text-center font-semibold ${v.isAbnormal ? "text-destructive" : ""}`}
                        >
                          {v.value}
                        </div>
                        <div className="col-span-2 text-xs text-muted-foreground">
                          {v.unit || "—"}
                        </div>
                        <div className="col-span-3 text-xs text-muted-foreground">
                          {v.referenceRange || "—"}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {v.isAbnormal ? (
                            <Badge className="text-[10px] px-1 py-0 h-4 gap-0.5 bg-destructive/10 text-destructive border-destructive/30">
                              <TrendingUp className="w-2.5 h-2.5" />!
                            </Badge>
                          ) : (
                            <Badge className="text-[10px] px-1 py-0 h-4 bg-success/10 text-success border-success/30">
                              N
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Result ID: {selected._id}</span>
                  </div>
                </div>
              );
            })()}

          <DialogFooter className="gap-2">
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
            {selected?.status === "submitted" && can("results.return") && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => selected && openReturn(selected)}
              >
                <Undo2 className="w-3.5 h-3.5" />
                Return
              </Button>
            )}
            {selected?.status === "submitted" && can("results.approve") && (
              <Button
                size="sm"
                className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => selected && handleApprove(selected)}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Approve Result
              </Button>
            )}
            {selected?.status === "approved" && can("results.release") && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => selected && handleRelease(selected)}
              >
                <Send className="w-3.5 h-3.5" />
                Release to Patient
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Return-for-correction dialog ── */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Return for Correction</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>
              Comments <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Explain what needs to be corrected..."
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
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
              className="gap-2"
            >
              <Undo2 className="w-4 h-4" />
              Return Result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
