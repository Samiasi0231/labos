import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  MoreHorizontal,
  PackagePlus,
  Pencil,
  Trash2,
  Activity,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMyPermissions } from "@/hooks/use-permissions";
import {
  useInventoryList,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useRemoveInventoryItem,
  useRestockItem,
  useAdjustStock,
  useStockMovements,
} from "@/hooks/use-inventory";
import type {
  InventoryCategory,
  InventoryItem,
  InventoryStatus,
  MovementType,
  StockMovement,
} from "@/api/types/inventory";

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

const MOVEMENT_CONFIG: Record<
  MovementType,
  { label: string; cls: string }
> = {
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
    if (ref.includes("test"))  return { label: "Consumed – Test",          cls: MOVEMENT_CONFIG.consumption.cls };
    if (ref.includes("order")) return { label: "Consumed – Order Created", cls: MOVEMENT_CONFIG.consumption.cls };
    return { label: "Consumed", cls: MOVEMENT_CONFIG.consumption.cls };
  }
  return MOVEMENT_CONFIG[m.type];
}

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
      {soon && (
        <span className="ml-1 text-[10px] font-semibold">(Soon)</span>
      )}
    </span>
  );
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
    [m.recordedBy.firstName, m.recordedBy.lastName].filter(Boolean).join(" ") ||
    "—"
  );
}

function stockLevel(item: InventoryItem): number {
  if (item.reorderLevel <= 0) return item.quantityOnHand > 0 ? 100 : 0;
  return Math.min((item.quantityOnHand / (item.reorderLevel * 2)) * 100, 100);
}

// ── Empty form states ─────────────────────────────────────────────────────────

const EMPTY_ITEM_FORM = {
  name: "",
  sku: "",
  category: "" as InventoryCategory | "",
  unit: "",
  quantity: "",
  reorderLevel: "",
  unitCost: "",
  supplier: "",
  expiryDate: "",
  status: "active" as InventoryStatus,
};

const EMPTY_RESTOCK_FORM = {
  quantity: "",
  unitCost: "",
  supplier: "",
  expiryDate: "",
  note: "",
};

const EMPTY_ADJUST_FORM = {
  type: "adjustment" as "adjustment" | "expired",
  direction: "add" as "add" | "remove",
  quantity: "",
  reason: "",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Inventory() {
  const { toast } = useToast();
  const { can } = useMyPermissions();

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<"items" | "movements">("items");

  // ── Items filters ──
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "All" | InventoryCategory
  >("All");
  const [statusFilter, setStatusFilter] = useState<"All" | InventoryStatus>(
    "All",
  );
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [expiringSoon, setExpiringSoon] = useState(false);

  // ── Dialog states ──
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItemId, setAdjustItemId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);

  // ── Form states ──
  const [itemForm, setItemForm] = useState({ ...EMPTY_ITEM_FORM });
  const [restockForm, setRestockForm] = useState({ ...EMPTY_RESTOCK_FORM });
  const [adjustForm, setAdjustForm] = useState({ ...EMPTY_ADJUST_FORM });

  // ── Movements filters ──
  const [movType, setMovType] = useState<"all" | MovementType>("all");
  const [movSearch, setMovSearch] = useState("");
  const [movPage, setMovPage] = useState(1);

  // ── Expiring soon date ──
  const expiringSoonDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  }, []);

  // ── Data ──
  const { items, isLoading, listUrl } = useInventoryList({
    search: search || undefined,
    category: categoryFilter === "All" ? undefined : categoryFilter,
    status: statusFilter === "All" ? undefined : statusFilter,
    lowStock: lowStockOnly ? true : undefined,
    expiringBefore: expiringSoon ? expiringSoonDate : undefined,
    limit: 100,
  });

  // Unfiltered list for stats + adjust product picker
  const { items: allItems } = useInventoryList({ limit: 100 });

  const { movements, pagination: movPagination, isLoading: movLoading } =
    useStockMovements({
      type: movType !== "all" ? movType : undefined,
      page: movPage,
      limit: 20,
    });

  // ── Hooks ──
  const { createItem, isLoading: isCreating } =
    useCreateInventoryItem([listUrl]);
  const { updateItem, isLoading: isUpdating } =
    useUpdateInventoryItem([listUrl]);
  const { removeItem, isLoading: isRemoving } =
    useRemoveInventoryItem([listUrl]);
  const { restock, isLoading: isRestocking } = useRestockItem([listUrl]);
  const { adjust, isLoading: isAdjusting } = useAdjustStock([listUrl]);

  // ── Computed ──
  const lowStockItems = allItems.filter((i) => i.quantityOnHand <= i.reorderLevel);

  const visibleMovements = movSearch.trim()
    ? movements.filter((m) =>
        movementItemName(m).toLowerCase().includes(movSearch.toLowerCase())
      )
    : movements;

  const adjustItem = allItems.find((i) => i._id === adjustItemId) ?? null;
  const adjustPreviewQty = adjustItem
    ? adjustItem.quantityOnHand +
      (adjustForm.direction === "add" ? 1 : -1) * (parseFloat(adjustForm.quantity) || 0)
    : null;

  // ── Handlers ──
  const handleAdd = async () => {
    if (!itemForm.name || !itemForm.category || !itemForm.unit) {
      toast({
        title: "Validation Error",
        description: "Name, category, and unit are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      const created = await createItem({
        name: itemForm.name,
        category: itemForm.category as InventoryCategory,
        unit: itemForm.unit,
        reorderLevel: parseInt(itemForm.reorderLevel) || 0,
        unitCost: parseFloat(itemForm.unitCost) || 0,
        supplier: itemForm.supplier || undefined,
      });

      const initialQty = parseFloat(itemForm.quantity) || 0;
      if (initialQty > 0 && created?._id) {
        await restock(created._id, { quantity: initialQty });
        toast({
          title: "Item added & stocked",
          description: `${itemForm.name} added with ${initialQty} ${itemForm.unit} in stock.`,
        });
      } else {
        toast({
          title: "Item added",
          description: `${itemForm.name} added. Use Restock to add quantity.`,
        });
      }

      setAddOpen(false);
      setItemForm({ ...EMPTY_ITEM_FORM });
    } catch {
      toast({
        title: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const openEdit = (item: InventoryItem) => {
    setItemForm({
      name: item.name,
      sku: item.sku ?? "",
      category: item.category,
      unit: item.unit,
      quantity: "",
      reorderLevel: String(item.reorderLevel),
      unitCost: String(item.unitCost),
      supplier: item.supplier ?? "",
      expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "",
      status: item.status,
    });
    setEditTarget(item);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!itemForm.name || !itemForm.category || !itemForm.unit) {
      toast({
        title: "Validation Error",
        description: "Name, category, and unit are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateItem(editTarget._id, {
        name: itemForm.name,
        sku: itemForm.sku || undefined,
        category: itemForm.category as InventoryCategory,
        unit: itemForm.unit,
        reorderLevel: parseInt(itemForm.reorderLevel) || 0,
        unitCost: parseFloat(itemForm.unitCost) || 0,
        supplier: itemForm.supplier || undefined,
        expiryDate: itemForm.expiryDate || undefined,
        status: itemForm.status,
      });
      setEditTarget(null);
      toast({ title: "Item updated" });
    } catch {
      toast({
        title: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const openRestock = (item: InventoryItem) => {
    setRestockTarget(item);
    setRestockForm({
      quantity: "",
      unitCost: String(item.unitCost || ""),
      supplier: item.supplier ?? "",
      expiryDate: "",
      note: "",
    });
  };

  const handleRestock = async () => {
    if (!restockTarget) return;
    const qty = parseFloat(restockForm.quantity);
    if (!qty || qty <= 0) {
      toast({ title: "Enter a valid quantity", variant: "destructive" });
      return;
    }
    try {
      await restock(restockTarget._id, {
        quantity: qty,
        unitCost: restockForm.unitCost
          ? parseFloat(restockForm.unitCost)
          : undefined,
        supplier: restockForm.supplier || undefined,
        expiryDate: restockForm.expiryDate || undefined,
        note: restockForm.note || undefined,
      });
      toast({
        title: "Item restocked",
        description: `${restockTarget.name} +${qty} ${restockTarget.unit}`,
      });
      setRestockTarget(null);
    } catch {
      toast({ title: "Restock failed", variant: "destructive" });
    }
  };

  const openAdjust = (item?: InventoryItem) => {
    setAdjustItemId(item?._id ?? "");
    setAdjustForm({ ...EMPTY_ADJUST_FORM });
    setAdjustOpen(true);
  };

  const handleAdjust = async () => {
    if (!adjustItemId) {
      toast({ title: "Select a product", variant: "destructive" });
      return;
    }
    const qty = parseFloat(adjustForm.quantity);
    if (!qty || qty <= 0) {
      toast({ title: "Enter a valid quantity", variant: "destructive" });
      return;
    }
    if (adjustPreviewQty !== null && adjustPreviewQty < 0) {
      toast({ title: "Result cannot be negative", variant: "destructive" });
      return;
    }
    if (!adjustForm.reason.trim() || adjustForm.reason.trim().length < 2) {
      toast({ title: "Reason is required (min 2 characters)", variant: "destructive" });
      return;
    }
    const quantityChange = adjustForm.direction === "add" ? qty : -qty;
    try {
      await adjust(adjustItemId, {
        quantityChange,
        reason: adjustForm.reason.trim(),
        type: adjustForm.type,
      });
      toast({
        title: "Stock adjusted",
        description: adjustItem
          ? `${adjustItem.name} adjusted to ${adjustPreviewQty} ${adjustItem.unit}.`
          : "Stock adjusted.",
      });
      setAdjustOpen(false);
    } catch {
      toast({ title: "Adjustment failed", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeItem(deleteTarget._id);
      toast({ title: "Item removed", description: `${deleteTarget.name} deleted.` });
    } catch {
      toast({
        title: "Cannot delete",
        description: "Item still has stock on hand. Adjust to zero first.",
        variant: "destructive",
      });
    }
    setDeleteTarget(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {allItems.length} items tracked
          </p>
        </div>
        {activeTab === "items"
          ? can("inventory.create") && (
              <Button
                className="gap-2"
                onClick={() => { setItemForm({ ...EMPTY_ITEM_FORM }); setAddOpen(true); }}
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            )
          : can("inventory.update") && (
              <Button className="gap-2" onClick={() => openAdjust()}>
                <Plus className="w-4 h-4" />
                Record Adjustment
              </Button>
            )
        }
      </div>

      {/* Low stock banner — always visible */}
      {lowStockItems.length > 0 && (
        <Alert className="border-warning/30 bg-warning/10">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <AlertDescription className="text-warning-foreground font-medium">
            {lowStockItems.length} item(s) at or below reorder level:{" "}
            <span className="font-semibold">
              {lowStockItems.map((i) => i.name).join(", ")}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats cards — always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items",  value: allItems.length,                                        color: "" },
          { label: "Reagents",     value: allItems.filter((i) => i.category === "reagent").length, color: "text-primary" },
          { label: "Consumables",  value: allItems.filter((i) => i.category === "consumable").length, color: "text-amber-600" },
          { label: "Low Stock",    value: lowStockItems.length,                                    color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label} className="shadow-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "items" | "movements")}
      >
        <TabsList>
          <TabsTrigger value="items" className="gap-2">
            <Package className="w-3.5 h-3.5" />
            Items
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2">
            <Activity className="w-3.5 h-3.5" />
            Stock Movements
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── ITEMS TAB ─────────────────────────────────────────────────────── */}
      {activeTab === "items" && (
        <>
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
                      <TableHead className="hidden sm:table-cell">
                        Category
                      </TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="hidden md:table-cell w-36">
                        Stock Level
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Reorder At
                      </TableHead>
                      <TableHead className="hidden xl:table-cell">
                        Supplier
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Cost
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Expiry
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-12 text-muted-foreground"
                        >
                          Loading inventory…
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="text-center py-16 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Package className="w-8 h-8 text-muted-foreground/30" />
                            <span>No inventory items found.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => {
                        const isLow =
                          item.quantityOnHand <= item.reorderLevel;
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
                                  <span className="font-medium text-sm">
                                    {item.name}
                                  </span>
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
                                <Badge
                                  variant="outline"
                                  className="text-xs text-muted-foreground"
                                >
                                  Inactive
                                </Badge>
                              ) : isLow ? (
                                <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Low
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-success border-success/30"
                                >
                                  In Stock
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {canDoActions && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {can("inventory.restock") && (
                                      <DropdownMenuItem
                                        className="gap-2"
                                        onClick={() => openRestock(item)}
                                      >
                                        <PackagePlus className="w-3.5 h-3.5" />
                                        Restock
                                      </DropdownMenuItem>
                                    )}
                                    {can("inventory.update") && (
                                      <>
                                        <DropdownMenuItem
                                          className="gap-2"
                                          onClick={() => openEdit(item)}
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
        </>
      )}

      {/* ── MOVEMENTS TAB ─────────────────────────────────────────────────── */}
      {activeTab === "movements" && (
        <>
          {/* Movements filters */}
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
                  {movPagination?.totalDocs ?? movements.length} movements
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
                      <TableHead className="hidden md:table-cell">
                        Product
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        After
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Reference
                      </TableHead>
                      <TableHead className="hidden lg:table-cell pr-6">
                        Recorded By
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-12 text-muted-foreground"
                        >
                          Loading movements…
                        </TableCell>
                      </TableRow>
                    ) : visibleMovements.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-14 text-muted-foreground"
                        >
                          No stock movements found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleMovements.map((m: StockMovement) => {
                        const badge = getMovementBadge(m);
                        const isPositive = m.quantityChange > 0;
                        return (
                          <TableRow
                            key={m._id}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <TableCell className="pl-6 text-sm text-muted-foreground">
                              {new Date(m.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm font-medium">
                              {movementItemName(m)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${badge.cls}`}>
                                {badge.label}
                              </Badge>
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

            {/* Movements pagination */}
            {movPagination && movPagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-border text-sm text-muted-foreground">
                <span>
                  Page {movPagination.page} of {movPagination.totalPages} ·{" "}
                  {movPagination.totalDocs} movements
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!movPagination.hasPrevPage}
                    onClick={() => setMovPage((p) => p - 1)}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!movPagination.hasNextPage}
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
        </>
      )}

      {/* ── Add Item Dialog ───────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. EDTA Tubes 5mL"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={itemForm.category}
                  onValueChange={(v) =>
                    setItemForm((p) => ({ ...p, category: v as InventoryCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reagent">Reagent</SelectItem>
                    <SelectItem value="kit">Kit</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="pcs / ml / box"
                  value={itemForm.unit}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, unit: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={itemForm.quantity}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={itemForm.reorderLevel}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, reorderLevel: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Input
                  placeholder="Supplier name"
                  value={itemForm.supplier}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, supplier: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unit Cost (₦)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={itemForm.unitCost}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, unitCost: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isCreating || isRestocking}>
              {isCreating || isRestocking ? "Adding…" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Item Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. EDTA Tubes 5mL"
                  value={itemForm.name}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>SKU</Label>
                <Input
                  placeholder="e.g. EDTA-5ML"
                  value={itemForm.sku}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, sku: e.target.value.toUpperCase() }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={itemForm.category}
                  onValueChange={(v) =>
                    setItemForm((p) => ({ ...p, category: v as InventoryCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reagent">Reagent</SelectItem>
                    <SelectItem value="kit">Kit</SelectItem>
                    <SelectItem value="consumable">Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Unit <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="pcs / ml / box"
                  value={itemForm.unit}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, unit: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={itemForm.reorderLevel}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, reorderLevel: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unit Cost (₦)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={itemForm.unitCost}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, unitCost: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Input
                  placeholder="Supplier name"
                  value={itemForm.supplier}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, supplier: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={itemForm.expiryDate}
                  onChange={(e) =>
                    setItemForm((p) => ({ ...p, expiryDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={itemForm.status}
                onValueChange={(v) =>
                  setItemForm((p) => ({ ...p, status: v as InventoryStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isUpdating}>
              {isUpdating ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Restock Dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={!!restockTarget}
        onOpenChange={(v) => !v && setRestockTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock — {restockTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>
                Quantity to add <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={restockForm.quantity}
                onChange={(e) =>
                  setRestockForm((p) => ({ ...p, quantity: e.target.value }))
                }
              />
            </div>
            {restockTarget && restockForm.quantity && (
              <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                Current stock:{" "}
                <span className="font-semibold">
                  {restockTarget.quantityOnHand}
                </span>{" "}
                → After restock:{" "}
                <span className="font-semibold text-success">
                  {restockTarget.quantityOnHand +
                    (parseFloat(restockForm.quantity) || 0)}{" "}
                  {restockTarget.unit}
                </span>
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Unit Cost (₦)</Label>
                <Input
                  type="number"
                  value={restockForm.unitCost}
                  onChange={(e) =>
                    setRestockForm((p) => ({ ...p, unitCost: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  value={restockForm.expiryDate}
                  onChange={(e) =>
                    setRestockForm((p) => ({ ...p, expiryDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input
                value={restockForm.supplier}
                onChange={(e) =>
                  setRestockForm((p) => ({ ...p, supplier: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Textarea
                placeholder="e.g. Monthly delivery from supplier"
                rows={2}
                value={restockForm.note}
                onChange={(e) =>
                  setRestockForm((p) => ({ ...p, note: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestockTarget(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRestock}
              disabled={isRestocking}
              className="gap-2"
            >
              <PackagePlus className="w-4 h-4" />
              {isRestocking ? "Restocking…" : "Confirm Restock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Record Adjustment Dialog ──────────────────────────────────────── */}
      <Dialog
        open={adjustOpen}
        onOpenChange={(v) => !v && setAdjustOpen(false)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Adjustment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>
                Product <span className="text-destructive">*</span>
              </Label>
              <Select
                value={adjustItemId}
                onValueChange={setAdjustItemId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {allItems.map((i) => (
                    <SelectItem key={i._id} value={i._id}>
                      {i.name} — {i.quantityOnHand} {i.unit} in stock
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Direction</Label>
              <Select
                value={adjustForm.direction}
                onValueChange={(v) =>
                  setAdjustForm((p) => ({ ...p, direction: v as "add" | "remove" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add stock (+)</SelectItem>
                  <SelectItem value="remove">Remove stock (−)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g. 5"
                min={1}
                value={adjustForm.quantity}
                onChange={(e) =>
                  setAdjustForm((p) => ({ ...p, quantity: e.target.value }))
                }
              />
            </div>
            {adjustItem && adjustForm.quantity && (
              <p
                className={`text-xs rounded-lg px-3 py-2 ${
                  adjustPreviewQty !== null && adjustPreviewQty < 0
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted/30 text-muted-foreground"
                }`}
              >
                Current stock:{" "}
                <span className="font-semibold">{adjustItem.quantityOnHand}</span>{" "}
                → After adjustment:{" "}
                <span
                  className={`font-semibold ${
                    adjustPreviewQty !== null && adjustPreviewQty < 0
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {adjustPreviewQty} {adjustItem.unit}
                </span>
                {adjustPreviewQty !== null && adjustPreviewQty < 0 && (
                  <span className="block mt-0.5">Cannot go below zero.</span>
                )}
              </p>
            )}
            <div className="space-y-1.5">
              <Label>
                Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="e.g. 2 bottles damaged in transit"
                rows={3}
                value={adjustForm.reason}
                onChange={(e) =>
                  setAdjustForm((p) => ({ ...p, reason: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdjust}
              disabled={isAdjusting || (adjustPreviewQty !== null && adjustPreviewQty < 0)}
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              {isAdjusting ? "Adjusting…" : "Confirm Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ─────────────────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Item
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>
            ? This is only possible when stock on hand is zero.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isRemoving}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isRemoving ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
