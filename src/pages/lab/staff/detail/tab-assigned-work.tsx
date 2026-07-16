import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { assignmentsUrl, ITEM_STATUS_LABELS, ITEM_STATUS_COLORS } from "./shared";
import type { TestOrderItemStatus, TestOrderItem } from "@/api/types/test-order";
import { cn } from "@/lib/utils";

interface AssignmentsResponse {
  docs: TestOrderItem[];
  totalDocs: number;
  totalPages: number;
  page: number;
}

const FILTERS: { label: string; value: TestOrderItemStatus | "all" }[] = [
  { label: "All",         value: "all" },
  { label: "Assigned",    value: "assigned" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed",   value: "completed" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_BADGE: Record<TestOrderItemStatus, string> = {
  pending:     "bg-muted text-muted-foreground border border-border",
  assigned:    "bg-info/15 text-info border border-info/30",
  in_progress: "bg-warning/15 text-warning border border-warning/30",
  completed:   "bg-success/15 text-success border border-success/30",
};

export function TabAssignedWork() {
  const [filter, setFilter] = useState<TestOrderItemStatus | "all">("all");
  const [page, setPage] = useState(1);

  const url = useMemo(
    () => assignmentsUrl(filter, page, 10),
    [filter, page],
  );
  const { data, isLoading } = useApi<AssignmentsResponse>(url);
  const items      = data?.data?.docs ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-3.5">
      {/* ── Filter sub-tabs ── */}
      <div className="flex gap-1 border-b border-border">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              filter === f.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <Card className="shadow-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-[18px] py-3">Test</th>
              <th className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Patient</th>
              <th className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Order Date</th>
              <th className="text-left text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-3 py-3">Status</th>
              <th className="text-right text-[11.5px] font-semibold text-muted-foreground uppercase tracking-wide px-[18px] py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-[18px] py-3"><Skeleton className="h-4 w-32 rounded" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-24 rounded" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                  <td className="px-3 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-[18px] py-3"><Skeleton className="h-8 w-20 rounded ml-auto" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Inbox className="w-8 h-8 opacity-40" />
                    <p className="text-sm">No assignments found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-[18px] py-3 font-semibold text-[13.5px]">{item.testName}</td>
                  <td className="px-3 py-3 text-[12.5px] text-muted-foreground">
                    {typeof item.patient === "string"
                      ? "—"
                      : (item.patient as { name?: string })?.name ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-[12.5px] text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap",
                        STATUS_BADGE[item.status],
                      )}
                    >
                      {ITEM_STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-[18px] py-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/lab/tests/${item.testOrder}`}>View Order</Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
