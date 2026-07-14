import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePatientOrders } from "@/hooks/use-patient-portal";
import endpoint from "@/api/endpoints";
import { downloadPDF } from "@/lib/utils";
import type { TestOrderStatus, TestOrderPriority } from "@/api/types";

// ── Config ────────────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<TestOrderStatus, { label: string; cls: string }> = {
  pending:          { label: "Pending",          cls: "bg-muted text-muted-foreground border" },
  sample_collected: { label: "Sample Collected", cls: "bg-info/15 text-info border-info/30 border" },
  in_progress:      { label: "In Progress",      cls: "bg-info/15 text-info border-info/30 border" },
  completed:        { label: "Completed",         cls: "bg-success/15 text-success border-success/30 border" },
  cancelled:        { label: "Cancelled",         cls: "bg-muted/50 text-muted-foreground border" },
};

const PRIORITY_CLS: Record<TestOrderPriority, string> = {
  routine: "bg-muted text-muted-foreground border",
  urgent:  "bg-warning/15 text-warning border-warning/30 border",
  stat:    "bg-destructive/15 text-destructive border-destructive/30 border",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] +
    " " + d.getDate() + ", " + d.getFullYear();
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MyOrders() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { orders, pagination, isLoading } = usePatientOrders({ page, limit: 10 });

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const handleDownload = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    setDownloading(orderId);
    try {
      await downloadPDF(
        endpoint.patient.downloadOrder(orderId),
        `results-order-${orderId}.pdf`
      );
    } catch {
      toast.error("No released results available yet, or download failed.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">My Orders</h2>
        <p className="text-sm text-muted-foreground">
          All test orders placed for you — read only
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const expanded  = expandedId === order._id;
            const orderCfg  = ORDER_STATUS[order.status];
            const prioCls   = PRIORITY_CLS[order.priority];

            return (
              <Card key={order._id} className="shadow-card p-0 overflow-hidden">
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggle(order._id)}
                >
                  <ChevronRight
                    className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-150"
                    style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-mono">
                      {order._id.slice(-8).toUpperCase()}{" "}
                      <span className="font-normal font-sans text-muted-foreground">
                        · {fmtDate(order.date)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.length} test{order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge className={`text-xs ${prioCls}`}>{capitalize(order.priority)}</Badge>
                  <Badge className={`text-xs ${orderCfg.cls}`}>{orderCfg.label}</Badge>
                  {(order.status === "completed" || order.status === "in_progress") && (
                    <Button
                      variant="outline" size="sm"
                      className="h-7 text-xs gap-1.5 flex-shrink-0"
                      disabled={downloading === order._id}
                      onClick={(e) => handleDownload(e, order._id)}
                    >
                      {downloading === order._id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Download className="w-3 h-3" />}
                      Download Results
                    </Button>
                  )}
                </div>

                {expanded && (
                  <div className="border-t border-border bg-muted/20 px-5 py-2">
                    {order.items.map((item, i) => {
                      const itemCfg = ORDER_STATUS[item.status as TestOrderStatus] ??
                        { label: capitalize(item.status as string), cls: "bg-muted text-muted-foreground border" };
                      return (
                        <div
                          key={item._id}
                          className={`flex items-center justify-between py-2.5 ${
                            i < order.items.length - 1 ? "border-b border-border" : ""
                          }`}
                        >
                          <span className="text-sm">{item.testName}</span>
                          <Badge className={`text-xs ${itemCfg.cls}`}>{itemCfg.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
