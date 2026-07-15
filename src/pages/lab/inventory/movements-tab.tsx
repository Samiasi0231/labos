import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMyPermissions } from "@/hooks/use-api";
import { useStockMovements } from "@/hooks/use-inventory";
import type { MovementType, StockMovement } from "@/api/types/inventory";
import { AdjustDialog } from "./adjust-dialog";

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOVEMENT_CONFIG: Record<MovementType, { label: string; cls: string }> = {
  restock: {
    label: "Restock",
    cls: "bg-success/15 text-success border-success/30 border",
  },
  consumption: {
    label: "Consumed",
    cls: "bg-destructive/15 text-destructive border-destructive/30 border",
  },
  adjustment: {
    label: "Adjustment",
    cls: "bg-info/15 text-info border-info/30 border",
  },
  expired: {
    label: "Expired",
    cls: "bg-muted/60 text-muted-foreground border",
  },
};

function getMovementBadge(m: StockMovement): { label: string; cls: string } {
  if (m.type === "consumption") {
    const ref = (m.referenceType ?? "").toLowerCase();
    if (ref.includes("test"))
      return { label: "Consumed – Test", cls: MOVEMENT_CONFIG.consumption.cls };
    if (ref.includes("order"))
      return { label: "Consumed – Order Created", cls: MOVEMENT_CONFIG.consumption.cls };
    return { label: "Consumed", cls: MOVEMENT_CONFIG.consumption.cls };
  }
  return MOVEMENT_CONFIG[m.type];
}

function movementItemName(m: StockMovement): string {
  return typeof m.inventoryItem === "string"
    ? `…${m.inventoryItem.slice(-6)}`
    : m.inventoryItem.name;
}

function movementRecordedBy(m: StockMovement): string {
  if (!m.recordedBy) return "—";
  if (typeof m.recordedBy === "string") return `…${m.recordedBy.slice(-6)}`;
  return (
    [m.recordedBy.firstName, m.recordedBy.lastName].filter(Boolean).join(" ") || "—"
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MovementsTab() {
  const { can } = useMyPermissions();

  // ── Movements state ──
  const [movType, setMovType] = useState<"all" | MovementType>("all");
  const [movSearch, setMovSearch] = useState("");
  const [movPage, setMovPage] = useState(1);

  // ── Adjust dialog state ──
  const [adjustOpen, setAdjustOpen] = useState(false);

  // ── Data ──
  const { movements, pagination, isLoading } = useStockMovements({
    type: movType !== "all" ? movType : undefined,
    page: movPage,
    limit: 20,
  });

  const visibleMovements = movSearch.trim()
    ? movements.filter((m) =>
      movementItemName(m).toLowerCase().includes(movSearch.toLowerCase()),
    )
    : movements;

  const hasPrevPage = (pagination?.page ?? 1) > 1;
  const hasNextPage = (pagination?.page ?? 1) < (pagination?.totalPages ?? 1);

  return (
    <>
      {/* Action button */}
      {can("inventory.update") && (
        <div className="flex justify-end">
          <Button className="gap-2" onClick={() => setAdjustOpen(true)}>
            <Plus className="w-4 h-4" />
            Record Adjustment
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Select
              value={movType}
              onValueChange={(v) => {
                setMovType(v as "all" | MovementType);
                setMovPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Movement Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movement Types</SelectItem>
                <SelectItem value="restock">Restock</SelectItem>
                <SelectItem value="consumption">Consumed</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by product…"
                className="pl-9"
                value={movSearch}
                onChange={(e) => setMovSearch(e.target.value)}
              />
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap ml-auto">
              {pagination?.totalDocs ?? movements.length} movements
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Movements table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Date & Time</TableHead>
                  <TableHead className="hidden md:table-cell">Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead className="hidden sm:table-cell">After</TableHead>
                  <TableHead className="hidden lg:table-cell">Reference</TableHead>
                  <TableHead className="hidden lg:table-cell pr-6">Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Loading movements…
                    </TableCell>
                  </TableRow>
                ) : visibleMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-14 text-muted-foreground">
                      No stock movements found.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleMovements.map((m: StockMovement) => {
                    const badge = getMovementBadge(m);
                    const isPositive = m.quantityChange > 0;
                    return (
                      <TableRow key={m._id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="pl-6 text-sm text-muted-foreground">
                          {new Date(m.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm font-medium">
                          {movementItemName(m)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${badge.cls}`}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold text-sm ${isPositive ? "text-success" : "text-destructive"}`}
                          >
                            {isPositive ? "+" : ""}
                            {m.quantityChange}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {m.quantityAfter}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {m.referenceId ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground pr-6">
                          {movementRecordedBy(m)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border text-sm text-muted-foreground">
            <span>
              Page {pagination.page} of {pagination.totalPages} ·{" "}
              {pagination.totalDocs} movements
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevPage}
                onClick={() => setMovPage((p) => p - 1)}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                onClick={() => setMovPage((p) => p + 1)}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Adjust dialog */}
      <AdjustDialog open={adjustOpen} onClose={() => setAdjustOpen(false)} />
    </>
  );
}
