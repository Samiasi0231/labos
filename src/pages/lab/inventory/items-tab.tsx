import { useMemo, useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  AlertTriangle,
  Package,
  MoreHorizontal,
  PackagePlus,
  Pencil,
  Trash2,
  Activity,
  TrendingDown,
  Plus,
  Library,
} from "lucide-react";
import { PresetLibrarySheet } from "@/components/lab/PresetLibrarySheet";
import { useMyPermissions } from "@/hooks/use-api";
import { useInventoryList } from "@/hooks/use-inventory";
import type {
  InventoryCategory,
  InventoryItem,
  InventoryStatus,
} from "@/api/types/inventory";
import { AddItemDialog } from "./add-dialog";
import { EditItemDialog } from "./edit-dialog";
import { RestockDialog } from "./restock-dialog";
import { AdjustDialog } from "./adjust-dialog";
import { DeleteItemDialog } from "./delete-dialog";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  InventoryCategory,
  { label: string; cls: string }
> = {
  reagent: {
    label: "Reagent",
    cls: "bg-primary/15 text-primary border-primary/30 border",
  },
  kit: {
    label: "Kit",
    cls: "bg-purple-500/15 text-purple-600 border-purple-500/30 border",
  },
  consumable: {
    label: "Consumable",
    cls: "bg-amber-500/15 text-amber-700 border-amber-500/30 border",
  },
};

function ExpiryCell({ date }: { date?: string }) {
  if (!date) return <span className="text-muted-foreground text-sm">—</span>;
  const d = new Date(date);
  const now = new Date();
  const in30 = new Date();
  in30.setDate(now.getDate() + 30);
  const expired = d < now;
  const soon = !expired && d <= in30;
  return (
    <span
      className={`text-sm font-medium ${expired ? "text-destructive" : soon ? "text-warning" : "text-foreground"}`}
    >
      {d.toLocaleDateString()}
      {expired && (
        <span className="ml-1 text-[10px] font-semibold">(Expired)</span>
      )}
      {soon && <span className="ml-1 text-[10px] font-semibold">(Soon)</span>}
    </span>
  );
}

function stockLevel(item: InventoryItem): number {
  if (item.reorderLevel <= 0) return item.quantityOnHand > 0 ? 100 : 0;
  return Math.min((item.quantityOnHand / (item.reorderLevel * 2)) * 100, 100);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ItemsTab() {
  const { can } = useMyPermissions();

  // ── Filter state ──
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | InventoryCategory>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | InventoryStatus>("All");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [expiringSoon, setExpiringSoon] = useState(false);

  // ── Dialog state ──
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItemId, setAdjustItemId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [presetOpen, setPresetOpen] = useState(false);

  // ── Expiring soon date ──
  const expiringSoonDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  // ── Data ──
  const { items, isLoading } = useInventoryList({
    search: search || undefined,
    category: categoryFilter === "All" ? undefined : categoryFilter,
    status: statusFilter === "All" ? undefined : statusFilter,
    lowStock: lowStockOnly ? true : undefined,
    expiringBefore: expiringSoon ? expiringSoonDate : undefined,
    limit: 100,
  });

  const openAdjust = (item: InventoryItem) => {
    setAdjustItemId(item._id);
    setAdjustOpen(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {can("inventory.create") && (
          <>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setPresetOpen(true)}
            >
              <Library className="w-4 h-4" />
              Import Presets
            </Button>
            <Button className="gap-2" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, supplier…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(v) =>
                setCategoryFilter(v as "All" | InventoryCategory)
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="reagent">Reagent</SelectItem>
                <SelectItem value="kit">Kit</SelectItem>
                <SelectItem value="consumable">Consumable</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as "All" | InventoryStatus)
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={lowStockOnly ? "default" : "outline"}
              size="sm"
              className="gap-1.5 text-xs h-9"
              onClick={() => setLowStockOnly((p) => !p)}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Low Stock
            </Button>
            <Button
              variant={expiringSoon ? "default" : "outline"}
              size="sm"
              className="gap-1.5 text-xs h-9"
              onClick={() => setExpiringSoon((p) => !p)}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Expiring Soon
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items table */}
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="hidden md:table-cell w-36">Stock Level</TableHead>
                  <TableHead className="hidden lg:table-cell">Reorder At</TableHead>
                  <TableHead className="hidden xl:table-cell">Supplier</TableHead>
                  <TableHead className="hidden lg:table-cell">Cost</TableHead>
                  <TableHead className="hidden md:table-cell">Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-4 hidden xl:table-cell">Source</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      Loading inventory…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-16 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                        <span>No inventory items found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const isLow = item.quantityOnHand <= item.reorderLevel;
                    const catCfg = CATEGORY_CONFIG[item.category];
                    const canDoActions =
                      can("inventory.restock") ||
                      can("inventory.update") ||
                      can("inventory.delete");
                    return (
                      <TableRow
                        key={item._id}
                        className={`hover:bg-muted/20 transition-colors ${isLow ? "border-l-2 border-l-destructive" : ""}`}
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2">
                            <Package
                              className={`w-4 h-4 flex-shrink-0 ${isLow ? "text-destructive" : "text-muted-foreground"}`}
                            />
                            <div>
                              <span className="font-medium text-sm">{item.name}</span>
                              {item.sku && (
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {item.sku}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge className={`text-xs ${catCfg.cls}`}>
                            {catCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold text-sm ${isLow ? "text-destructive" : "text-foreground"}`}
                          >
                            {item.quantityOnHand} {item.unit}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Progress
                            value={stockLevel(item)}
                            className={`h-2 ${isLow ? "[&>div]:bg-destructive" : "[&>div]:bg-success"}`}
                          />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {item.reorderLevel} {item.unit}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                          {item.supplier || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          ₦{item.unitCost.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <ExpiryCell date={item.expiryDate} />
                        </TableCell>
                        <TableCell>
                          {item.status === "inactive" ? (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Inactive
                            </Badge>
                          ) : isLow ? (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Low
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-success border-success/30">
                              In Stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-4 text-xs text-muted-foreground hidden xl:table-cell">
                          {item.presetId ? "Preset" : "Manual"}
                        </TableCell>
                        <TableCell>
                          {canDoActions && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {can("inventory.restock") && (
                                  <DropdownMenuItem
                                    className="gap-2"
                                    onClick={() => setRestockTarget(item)}
                                  >
                                    <PackagePlus className="w-3.5 h-3.5" />
                                    Restock
                                  </DropdownMenuItem>
                                )}
                                {can("inventory.update") && (
                                  <>
                                    <DropdownMenuItem
                                      className="gap-2"
                                      onClick={() => setEditTarget(item)}
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="gap-2"
                                      onClick={() => openAdjust(item)}
                                    >
                                      <Activity className="w-3.5 h-3.5" />
                                      Adjust Stock
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {can("inventory.delete") && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="gap-2 text-destructive"
                                      onClick={() => setDeleteTarget(item)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
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

      {/* Dialogs */}
      <AddItemDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <EditItemDialog target={editTarget} onClose={() => setEditTarget(null)} />

      <RestockDialog target={restockTarget} onClose={() => setRestockTarget(null)} />

      <AdjustDialog
        open={adjustOpen}
        defaultItemId={adjustItemId}
        onClose={() => setAdjustOpen(false)}
      />

      <DeleteItemDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} />

      <PresetLibrarySheet
        type="inventory"
        open={presetOpen}
        onOpenChange={setPresetOpen}
      />
    </>
  );
}
