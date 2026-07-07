import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/lab/StatusBadge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle, CheckCircle, Eye, RefreshCw, Clock,
  FileText, ThumbsUp, MessageSquare
} from "lucide-react";
import { results, type Result, type ResultStatus } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function PendingReviews() {
  const [activeTab, setActiveTab] = useState("All");
  const [resultList, setResultList] = useState<Result[]>(results);
  const [selected, setSelected] = useState<Result | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [returnNote, setReturnNote] = useState("");
  const [returnOpen, setReturnOpen] = useState(false);
  const { toast } = useToast();

  const tabs: (ResultStatus | 'All')[] = ['All', 'Submitted', 'Approved', 'Released', 'Returned'];
  const tabCounts = tabs.map(tab => ({
    tab,
    count: tab === 'All' ? resultList.length : resultList.filter(r => r.status === tab).length
  }));

  const filtered = resultList.filter(r =>
    activeTab === 'All' || r.status === activeTab
  );

  const returnResult = () => {
    if (!selected) return;
    setResultList(prev => prev.map(r =>
      r.id === selected.id ? { ...r, status: 'Returned' as ResultStatus } : r
    ));
    setReturnOpen(false);
    setViewOpen(false);
    setReturnNote("");
    toast({ title: "Result Returned", description: "The result has been returned for correction with your notes." });
  };

  const statusIcon = (status: ResultStatus) => {
    if (status === 'Submitted') return <Clock className="w-4 h-4 text-info" />;
    if (status === 'Approved') return <ThumbsUp className="w-4 h-4 text-success" />;
    if (status === 'Released') return <CheckCircle className="w-4 h-4 text-success" />;
    if (status === 'Returned') return <RefreshCw className="w-4 h-4 text-destructive" />;
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Pending Reviews</h2>
        <p className="text-sm text-muted-foreground">Track your submitted results and approval status</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Submitted', count: resultList.filter(r => r.status === 'Submitted').length, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Approved', count: resultList.filter(r => r.status === 'Approved').length, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Released', count: resultList.filter(r => r.status === 'Released').length, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Returned', count: resultList.filter(r => r.status === 'Returned').length, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map(item => (
          <Card key={item.label} className={`shadow-card p-4 ${item.bg} border-0`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </Card>
        ))}
      </div>

      {/* Returned alert */}
      {resultList.filter(r => r.status === 'Returned').length > 0 && (
        <Alert className="border-destructive/30 bg-destructive/10">
          <RefreshCw className="w-4 h-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            {resultList.filter(r => r.status === 'Returned').length} result(s) were returned for correction. Please review and resubmit.
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-2 pt-4 px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto gap-1">
              {tabCounts.map(({ tab, count }) => (
                <TabsTrigger key={tab} value={tab} className="gap-2 text-xs">
                  {tab}
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 min-w-[20px]">{count}</Badge>
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
                  <TableHead className="pl-6">Sample ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden md:table-cell">Test Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Submitted</TableHead>
                  <TableHead className="hidden lg:table-cell">Approved By</TableHead>
                  <TableHead className="hidden sm:table-cell">Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">No results found.</TableCell>
                  </TableRow>
                ) : filtered.map((result) => (
                  <TableRow
                    key={result.id}
                    className={`hover:bg-muted/20 transition-colors ${result.status === 'Returned' ? 'border-l-2 border-l-destructive' : ''}`}
                  >
                    <TableCell className="pl-6 font-mono text-xs text-muted-foreground">{result.sampleId}</TableCell>
                    <TableCell className="font-medium">{result.patientName}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{result.testType}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{result.submittedAt}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {result.approvedBy ?? <span className="text-muted-foreground/50 italic">Pending</span>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex gap-1">
                        {result.isAbnormal && (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
                            <AlertTriangle className="w-3 h-3" />Abnormal
                          </Badge>
                        )}
                        {result.hasAttachment && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <FileText className="w-3 h-3" />File
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(result.status)}
                        <StatusBadge status={result.status} />
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm" variant="ghost" className="h-7 text-xs gap-1"
                          onClick={() => { setSelected(result); setViewOpen(true); }}
                        >
                          <Eye className="w-3.5 h-3.5" />View
                        </Button>
                        {result.status === 'Returned' && (
                          <Button
                            size="sm" className="h-7 text-xs gap-1"
                            onClick={() => toast({ title: "Edit Result", description: "Navigate to Result Entry to correct this result." })}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />Correct
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />Result Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> <span className="font-medium">{selected.patientName}</span></div>
                <div><span className="text-muted-foreground">Test:</span> <span className="font-medium">{selected.testType}</span></div>
                <div><span className="text-muted-foreground">Sample:</span> <span className="font-mono text-xs">{selected.sampleId}</span></div>
                <div className="flex items-center gap-1.5"><span className="text-muted-foreground">Status:</span> <StatusBadge status={selected.status} /></div>
                <div><span className="text-muted-foreground">Submitted by:</span> <span className="font-medium">{selected.submittedBy}</span></div>
                <div><span className="text-muted-foreground">Submitted:</span> <span className="text-muted-foreground">{selected.submittedAt}</span></div>
              </div>

              {selected.approvedBy && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg text-sm text-success">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Approved by <span className="font-semibold">{selected.approvedBy}</span> at {selected.approvedAt}</span>
                </div>
              )}

              {selected.status === 'Returned' && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <RefreshCw className="w-4 h-4 flex-shrink-0" />
                  <span>This result was returned for correction. Please review and resubmit.</span>
                </div>
              )}

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground grid grid-cols-3">
                  <span>Parameter</span><span className="text-center">Result</span><span className="text-right">Reference</span>
                </div>
                {Object.entries(selected.values).map(([key, value]) => (
                  <div key={key} className="px-4 py-2.5 text-sm grid grid-cols-3 border-t border-border">
                    <span className="text-muted-foreground">{key}</span>
                    <span className={`text-center font-medium ${selected.isAbnormal ? 'text-destructive' : ''}`}>{value}</span>
                    <span className="text-right text-xs text-muted-foreground">{selected.referenceRange[key]}</span>
                  </div>
                ))}
              </div>

              {selected.isAbnormal && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Abnormal values detected in this result.</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selected?.status === 'Submitted' && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => { setReturnOpen(true); }}
              >
                <MessageSquare className="w-3.5 h-3.5" />Request Correction
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Correction</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Returning result for <span className="font-medium text-foreground">{selected?.patientName} – {selected?.testType}</span>. Please add notes for correction.
            </p>
            <div className="space-y-1.5">
              <Label>Correction Notes <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Describe what needs to be corrected..."
                value={returnNote}
                onChange={e => setReturnNote(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={returnResult}
              disabled={!returnNote.trim()}
            >
              Return for Correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
