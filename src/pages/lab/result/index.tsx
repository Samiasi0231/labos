import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import { asPopulated, refId } from "@/lib/utils";
import type { LabResult, ResultStatus, ResultListResponse } from "@/api/types/results";

const STATUS_CONFIG: Record<ResultStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground border" },
  submitted: { label: "Submitted", cls: "bg-info/15 text-info border-info/30 border" },
  returned: { label: "Returned", cls: "bg-destructive/15 text-destructive border-destructive/30 border" },
  approved: { label: "Approved", cls: "bg-success/15 text-success border-success/30 border" },
  released: { label: "Released", cls: "bg-primary/15 text-primary border-primary/30 border" },
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
    ? `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || p.code || refId(result.patient)
    : refId(result.patient);
}

function submittedByLabel(result: LabResult): string {
  const entry = [...(result.timelines ?? [])].reverse().find((t) => t.status === "submitted");
  if (!entry) return "—";
  const by = entry.by;
  if (typeof by === "object") {
    if (by.user && typeof by.user === "object") {
      const name = `${by.user.firstName ?? ""} ${by.user.lastName ?? ""}`.trim();
      return name || by.role || "—";
    }
    if (by.role) return by.role;
  }
  return "—";
}

function submittedAtLabel(result: LabResult): string {
  const entry = [...(result.timelines ?? [])].reverse().find((t) => t.status === "submitted");
  return entry ? fmtDate(entry.at) : "—";
}

function testLabel(result: LabResult): string {
  const item = asPopulated(result.testOrderItem);
  return item?.testName ?? refId(result.testOrderItem);
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

const TABS: (ResultStatus | "All")[] = ["All", "submitted", "returned", "approved", "released"];
const TAB_LABEL: Record<string, string> = {
  All: "All",
  submitted: "Submitted",
  returned: "Returned",
  approved: "Approved",
  released: "Released",
};

export default function Results() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ResultStatus | "All">("All");

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({ page: "1", limit: "100" });
    if (activeTab !== "All") params.set("status", activeTab);
    return `${endpoint.lab.results.list}?${params}`;
  }, [activeTab]);

  const { data: resultsData, isLoading } = useApi<ResultListResponse>(listUrl);
  const results = resultsData?.data?.docs ?? [];

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
                  <TableHead className="hidden sm:table-cell">Submitted By</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted At</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Loading results…
                    </TableCell>
                  </TableRow>
                ) : results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No results found.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => (
                    <TableRow
                      key={result._id}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => navigate(`/lab/results/${result._id}`)}
                    >
                      <TableCell className="pl-6 font-medium">
                        {patientLabel(result)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {testLabel(result)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {submittedByLabel(result)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {submittedAtLabel(result)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {fmtDate(result.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ResultStatusBadge status={result.status} />
                      </TableCell>
                      <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="link"
                          className="h-auto py-0 px-1 text-[12px] gap-1"
                          onClick={() => navigate(`/lab/results/${result._id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
