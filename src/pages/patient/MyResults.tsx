import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { FlaskConical, Download, Loader2 } from "lucide-react";
import { notify } from "@/lib/notify";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { PatientResultListResponse } from "@/api/types";
import { downloadPDF } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] +
    " " + d.getDate() + ", " + d.getFullYear();
}

function getTestName(testOrderItem: unknown): string {
  if (testOrderItem && typeof testOrderItem === "object" && "testName" in testOrderItem) {
    return (testOrderItem as { testName?: string }).testName ?? "Test Result";
  }
  return "Test Result";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MyResults() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);

  const listUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
    });
    return `${endpoint.patient.results}?${params.toString()}`;
  }, [page]);

  const { data: resultsData, isLoading } = useApi<PatientResultListResponse>(listUrl);
  const results = resultsData?.data?.docs ?? [];
  const pagination = resultsData?.data
    ? {
        page: resultsData.data.page,
        totalPages: resultsData.data.totalPages,
        totalDocs: resultsData.data.totalDocs,
        hasNext: resultsData.data.hasNextPage,
        hasPrev: resultsData.data.hasPrevPage,
      }
    : null;

  const handleDownload = async (e: React.MouseEvent, resultId: string, testName: string) => {
    e.stopPropagation();
    setDownloading(resultId);
    try {
      await downloadPDF(
        endpoint.patient.downloadResult(resultId),
        `result-${testName}.pdf`
      );
    } catch {
      notify.error("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">My Results</h2>
        <p className="text-sm text-muted-foreground">
          Released test results{pagination ? ` — ${pagination.totalDocs} total` : ""}
        </p>
      </div>

      <Card className="shadow-card p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-6">Test Name</TableHead>
              <TableHead className="hidden sm:table-cell">Order Date</TableHead>
              <TableHead className="hidden md:table-cell">Released Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-6 text-right">Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="pr-6 text-right"><Skeleton className="h-7 w-16 ml-auto rounded" /></TableCell>
                </TableRow>
              ))
            ) : results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-14 text-muted-foreground text-sm">
                  No results released yet.
                </TableCell>
              </TableRow>
            ) : (
              results.map((r) => {
                const testName = getTestName(r.testOrderItem);
                const orderDate =
                  r.testOrder && typeof r.testOrder === "object" && "date" in r.testOrder
                    ? (r.testOrder as { date?: string }).date
                    : undefined;
                return (
                  <TableRow
                    key={r._id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/patient/results/${r._id}`)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FlaskConical className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-semibold">{testName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {orderDate ? fmtDate(orderDate) : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {r.releasedAt ? fmtDate(r.releasedAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-success/15 text-success border-success/30 border text-xs">
                        Released
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1.5"
                        disabled={downloading === r._id}
                        onClick={(e) => handleDownload(e, r._id, testName)}
                      >
                        {downloading === r._id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Download className="w-3 h-3" />}
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline" size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline" size="sm"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
