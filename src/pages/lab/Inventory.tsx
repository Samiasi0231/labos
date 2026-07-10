import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useInventoryList,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useRemoveInventoryItem,
  useRestockItem,
} from "@/hooks/use-inventory";
import type { InventoryCategory, InventoryItem } from "@/api/types";

const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  reagent: "Reagent",
  kit: "Kit",
  consumable: "Consumable",
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "All" | InventoryCategory
  >("All");
  const [open, setOpen] = useState(false);
  const [restockTarget, setRestockTarget] = useState<InventoryItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const { items, isLoading, listUrl } = useInventoryList({
    search: search || undefined,
    category: categoryFilter === "All" ? undefined : categoryFilter,
  });
  const { createItem } = useCreateInventoryItem([listUrl]);
  const { removeItem } = useRemoveInventoryItem([listUrl]);
  const { restock, isLoading: isRestocking } = useRestockItem([listUrl]);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "" as InventoryCategory | "",
    unit: "",
    reorderLevel: "",
    supplier: "",
    unitCost: "",
  });
  const [restockForm, setRestockForm] = useState({
    quantity: "",
    unitCost: "",
    supplier: "",
    expiryDate: "",
    note: "",
  });

  const lowStock = items.filter((i) => i.quantityOnHand <= i.reorderLevel);

  const stockLevel = (item: InventoryItem) => {
    if (item.reorderLevel <= 0) return item.quantityOnHand > 0 ? 100 : 0;
    return Math.min((item.quantityOnHand / (item.reorderLevel * 2)) * 100, 100);
  };

  const handleAdd = async () => {
    if (!form.name || !form.sku || !form.category) {
      toast({
        title: "Validation Error",
        description: "Name, SKU, and category are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      await createItem({
        name: form.name,
        sku: form.sku,
        category: form.category,
        unit: form.unit || "pcs",
        reorderLevel: parseInt(form.reorderLevel) || 10,
        unitCost: parseFloat(form.unitCost) || 0,
        supplier: form.supplier || undefined,
      });
      setOpen(false);
      setForm({
        name: "",
        sku: "",
        category: "",
        unit: "",
        reorderLevel: "",
        supplier: "",
        unitCost: "",
      });
      toast({
        title: "Item Added",
        description: `${form.name} added to inventory. Stock starts at zero — restock to add quantity.`,
      });
    } catch {
      toast({
        title: "Failed to add item",
        description: "SKU may already exist. Please try again.",
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
    const qty = parseInt(restockForm.quantity);
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
        description: `${restockTarget.name} +${qty} ${restockTarget.unit}.`,
      });
      setRestockTarget(null);
    } catch {
      toast({
        title: "Restock failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeItem(deleteTarget._id);
      toast({
        title: "Item removed",
        description: `${deleteTarget.name} deleted.`,
      });
    } catch {
      toast({
        title: "Cannot delete item",
        description:
          "This item still has stock on hand. Adjust it to zero before deleting.",
        variant: "destructive",
      });
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} items tracked
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. EDTA Tubes (5mL)"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    SKU <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. EDTA-5ML"
                    value={form.sku}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sku: e.target.value }))
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
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((p) => ({
                        ...p,
                        category: v as InventoryCategory,
                      }))
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
                  <Label>Unit</Label>
                  <Input
                    placeholder="pcs / bottles"
                    value={form.unit}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, unit: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Reorder Level</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={form.reorderLevel}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, reorderLevel: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit Cost (₦)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.unitCost}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, unitCost: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Input
                  placeholder="Supplier name"
                  value={form.supplier}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supplier: e.target.value }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Stock starts at zero. Use "Restock" after creating to add
                quantity.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {lowStock.length > 0 && (
        <Alert className="border-warning/30 bg-warning/10">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <AlertDescription className="text-warning-foreground font-medium">
            {lowStock.length} item(s) are at or below reorder level:{" "}
            <span className="font-semibold">
              {lowStock.map((i) => i.name).join(", ")}
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold mt-1">{items.length}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Reagents</p>
          <p className="text-2xl font-bold mt-1 text-primary">
            {items.filter((i) => i.category === "reagent").length}
          </p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Consumables</p>
          <p className="text-2xl font-bold mt-1 text-info">
            {items.filter((i) => i.category === "consumable").length}
          </p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold mt-1 text-destructive">
            {lowStock.length}
          </p>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or supplier..."
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
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="reagent">Reagent</SelectItem>
                <SelectItem value="kit">Kit</SelectItem>
                <SelectItem value="consumable">Consumable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Quantity</TableHead>
                  <TableHead className="hidden md:table-cell w-40">
                    Stock Level
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Reorder At
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Supplier
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Unit Cost
                  </TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Loading inventory…
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const isLow = item.quantityOnHand <= item.reorderLevel;
                    return (
                      <TableRow
                        key={item._id}
                        className={`hover:bg-muted/20 transition-colors ${isLow ? "bg-destructive/5" : ""}`}
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
                              <p className="text-[10px] text-muted-foreground font-mono">
                                {item.sku}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[item.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${isLow ? "text-destructive" : "text-foreground"}`}
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
                        <TableCell className="pr-6">
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
                              Low Stock
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
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => openRestock(item)}
                              >
                                <PackagePlus className="w-3.5 h-3.5" />
                                Restock
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() => setDeleteTarget(item)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* ── Restock dialog ── */}
      <Dialog
        open={!!restockTarget}
        onOpenChange={(v) => !v && setRestockTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock {restockTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g. 10"
                value={restockForm.quantity}
                onChange={(e) =>
                  setRestockForm((p) => ({ ...p, quantity: e.target.value }))
                }
              />
            </div>
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
                    setRestockForm((p) => ({
                      ...p,
                      expiryDate: e.target.value,
                    }))
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
              <Input
                placeholder="e.g. Monthly delivery"
                value={restockForm.note}
                onChange={(e) =>
                  setRestockForm((p) => ({ ...p, note: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRestock}
              disabled={isRestocking}
              className="gap-2"
            >
              <PackagePlus className="w-4 h-4" />
              {isRestocking ? "Restocking..." : "Restock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            ? This is only allowed when stock on hand is zero.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// import { useState } from "react";
// import { StatCard } from "@/components/lab/StatCard";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
// } from "@/components/ui/dialog";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue
// } from "@/components/ui/select";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from "@/components/ui/table";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Progress } from "@/components/ui/progress";
// import { Search, Plus, AlertTriangle, Package } from "lucide-react";
// import { type InventoryItem } from "@/data/mockData";
// import { useInventory } from "@/context/useInventory";
// import { useToast } from "@/hooks/use-toast";

// export default function Inventory() {
//   const { items, addItem } = useInventory();
//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("All");
//   const [open, setOpen] = useState(false);
//   const { toast } = useToast();

//   const [form, setForm] = useState({
//     product: "", category: "", quantity: "", unit: "", reorderLevel: "", supplier: "", unitCost: ""
//   });

//   const lowStock = items.filter(i => i.quantity <= i.reorderLevel);
//   const filtered = items.filter(i => {
//     const matchSearch = i.product.toLowerCase().includes(search.toLowerCase()) || i.supplier.toLowerCase().includes(search.toLowerCase());
//     const matchCat = categoryFilter === "All" || i.category === categoryFilter;
//     return matchSearch && matchCat;
//   });

//   const stockLevel = (item: InventoryItem) => {
//     const pct = Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100);
//     return pct;
//   };

//   const handleAdd = () => {
//     if (!form.product || !form.category || !form.quantity) {
//       toast({ title: "Validation Error", description: "Product, category, and quantity are required.", variant: "destructive" });
//       return;
//     }
//     const newItem: InventoryItem = {
//       id: `INV-${String(items.length + 1).padStart(3, '0')}`,
//       product: form.product,
//       category: form.category as InventoryItem['category'],
//       quantity: parseInt(form.quantity),
//       unit: form.unit || 'pcs',
//       reorderLevel: parseInt(form.reorderLevel) || 10,
//       supplier: form.supplier,
//       lastRestocked: new Date().toISOString().split('T')[0],
//       unitCost: parseFloat(form.unitCost) || 0,
//     };
//     addItem(newItem);
//     setOpen(false);
//     setForm({ product: "", category: "", quantity: "", unit: "", reorderLevel: "", supplier: "", unitCost: "" });
//     toast({ title: "Item Added", description: `${newItem.product} added to inventory.` });
//   };

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-xl font-semibold">Inventory</h2>
//           <p className="text-sm text-muted-foreground">{items.length} items tracked</p>
//         </div>
//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild>
//             <Button className="gap-2"><Plus className="w-4 h-4" />Add Item</Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
//             <div className="space-y-4 py-2">
//               <div className="space-y-1.5">
//                 <Label>Product Name <span className="text-destructive">*</span></Label>
//                 <Input placeholder="e.g. EDTA Tubes (5mL)" value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Category <span className="text-destructive">*</span></Label>
//                   <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
//                     <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Reagent">Reagent</SelectItem>
//                       <SelectItem value="Consumable">Consumable</SelectItem>
//                       <SelectItem value="Equipment">Equipment</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Unit</Label>
//                   <Input placeholder="pcs / bottles" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Quantity <span className="text-destructive">*</span></Label>
//                   <Input type="number" placeholder="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Reorder Level</Label>
//                   <Input type="number" placeholder="10" value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: e.target.value }))} />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1.5">
//                   <Label>Supplier</Label>
//                   <Input placeholder="Supplier name" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
//                 </div>
//                 <div className="space-y-1.5">
//                   <Label>Unit Cost (₦)</Label>
//                   <Input type="number" placeholder="0" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} />
//                 </div>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
//               <Button onClick={handleAdd}>Add Item</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Low stock alert */}
//       {lowStock.length > 0 && (
//         <Alert className="border-warning/30 bg-warning/10">
//           <AlertTriangle className="w-4 h-4 text-warning" />
//           <AlertDescription className="text-warning-foreground font-medium">
//             {lowStock.length} item(s) are at or below reorder level:{' '}
//             <span className="font-semibold">{lowStock.map(i => i.product).join(', ')}</span>
//           </AlertDescription>
//         </Alert>
//       )}

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <Card className="shadow-card p-4">
//           <p className="text-xs text-muted-foreground">Total Items</p>
//           <p className="text-2xl font-bold mt-1">{items.length}</p>
//         </Card>
//         <Card className="shadow-card p-4">
//           <p className="text-xs text-muted-foreground">Reagents</p>
//           <p className="text-2xl font-bold mt-1 text-primary">{items.filter(i => i.category === 'Reagent').length}</p>
//         </Card>
//         <Card className="shadow-card p-4">
//           <p className="text-xs text-muted-foreground">Consumables</p>
//           <p className="text-2xl font-bold mt-1 text-info">{items.filter(i => i.category === 'Consumable').length}</p>
//         </Card>
//         <Card className="shadow-card p-4">
//           <p className="text-xs text-muted-foreground">Low Stock</p>
//           <p className="text-2xl font-bold mt-1 text-destructive">{lowStock.length}</p>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card className="shadow-card">
//         <CardContent className="pt-4 pb-4">
//           <div className="flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input placeholder="Search by product or supplier..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
//             </div>
//             <Select value={categoryFilter} onValueChange={setCategoryFilter}>
//               <SelectTrigger className="w-40">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="All">All Categories</SelectItem>
//                 <SelectItem value="Reagent">Reagent</SelectItem>
//                 <SelectItem value="Consumable">Consumable</SelectItem>
//                 <SelectItem value="Equipment">Equipment</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="shadow-card">
//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-muted/30">
//                   <TableHead className="pl-6">Product</TableHead>
//                   <TableHead className="hidden sm:table-cell">Category</TableHead>
//                   <TableHead>Quantity</TableHead>
//                   <TableHead className="hidden md:table-cell w-40">Stock Level</TableHead>
//                   <TableHead className="hidden lg:table-cell">Reorder At</TableHead>
//                   <TableHead className="hidden xl:table-cell">Supplier</TableHead>
//                   <TableHead className="hidden lg:table-cell">Unit Cost</TableHead>
//                   <TableHead className="pr-6">Status</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {filtered.map((item) => {
//                   const isLow = item.quantity <= item.reorderLevel;
//                   return (
//                     <TableRow key={item.id} className={`hover:bg-muted/20 transition-colors ${isLow ? 'bg-destructive/5' : ''}`}>
//                       <TableCell className="pl-6">
//                         <div className="flex items-center gap-2">
//                           <Package className={`w-4 h-4 flex-shrink-0 ${isLow ? 'text-destructive' : 'text-muted-foreground'}`} />
//                           <span className="font-medium text-sm">{item.product}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell className="hidden sm:table-cell">
//                         <Badge variant="outline" className="text-xs">{item.category}</Badge>
//                       </TableCell>
//                       <TableCell>
//                         <span className={`font-semibold ${isLow ? 'text-destructive' : 'text-foreground'}`}>
//                           {item.quantity} {item.unit}
//                         </span>
//                       </TableCell>
//                       <TableCell className="hidden md:table-cell">
//                         <Progress value={stockLevel(item)} className={`h-2 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
//                       </TableCell>
//                       <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{item.reorderLevel} {item.unit}</TableCell>
//                       <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{item.supplier}</TableCell>
//                       <TableCell className="hidden lg:table-cell text-sm">₦{item.unitCost.toLocaleString()}</TableCell>
//                       <TableCell className="pr-6">
//                         {isLow ? (
//                           <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
//                             <AlertTriangle className="w-3 h-3" />Low Stock
//                           </Badge>
//                         ) : (
//                           <Badge variant="outline" className="text-xs text-success border-success/30">In Stock</Badge>
//                         )}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
