import { useState } from "react";
import { StatCard } from "@/components/lab/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, AlertTriangle, Package } from "lucide-react";
import { type InventoryItem } from "@/data/mockData";
import { useInventory } from "@/context/useInventory";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { items, addItem } = useInventory();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    product: "", category: "", quantity: "", unit: "", reorderLevel: "", supplier: "", unitCost: ""
  });

  const lowStock = items.filter(i => i.quantity <= i.reorderLevel);
  const filtered = items.filter(i => {
    const matchSearch = i.product.toLowerCase().includes(search.toLowerCase()) || i.supplier.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || i.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const stockLevel = (item: InventoryItem) => {
    const pct = Math.min((item.quantity / (item.reorderLevel * 2)) * 100, 100);
    return pct;
  };

  const handleAdd = () => {
    if (!form.product || !form.category || !form.quantity) {
      toast({ title: "Validation Error", description: "Product, category, and quantity are required.", variant: "destructive" });
      return;
    }
    const newItem: InventoryItem = {
      id: `INV-${String(items.length + 1).padStart(3, '0')}`,
      product: form.product,
      category: form.category as InventoryItem['category'],
      quantity: parseInt(form.quantity),
      unit: form.unit || 'pcs',
      reorderLevel: parseInt(form.reorderLevel) || 10,
      supplier: form.supplier,
      lastRestocked: new Date().toISOString().split('T')[0],
      unitCost: parseFloat(form.unitCost) || 0,
    };
    addItem(newItem);
    setOpen(false);
    setForm({ product: "", category: "", quantity: "", unit: "", reorderLevel: "", supplier: "", unitCost: "" });
    toast({ title: "Item Added", description: `${newItem.product} added to inventory.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">{items.length} items tracked</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Add Item</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Product Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. EDTA Tubes (5mL)" value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reagent">Reagent</SelectItem>
                      <SelectItem value="Consumable">Consumable</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Input placeholder="pcs / bottles" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Quantity <span className="text-destructive">*</span></Label>
                  <Input type="number" placeholder="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Reorder Level</Label>
                  <Input type="number" placeholder="10" value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Supplier</Label>
                  <Input placeholder="Supplier name" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit Cost (₦)</Label>
                  <Input type="number" placeholder="0" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: e.target.value }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <Alert className="border-warning/30 bg-warning/10">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <AlertDescription className="text-warning-foreground font-medium">
            {lowStock.length} item(s) are at or below reorder level:{' '}
            <span className="font-semibold">{lowStock.map(i => i.product).join(', ')}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold mt-1">{items.length}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Reagents</p>
          <p className="text-2xl font-bold mt-1 text-primary">{items.filter(i => i.category === 'Reagent').length}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Consumables</p>
          <p className="text-2xl font-bold mt-1 text-info">{items.filter(i => i.category === 'Consumable').length}</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-xs text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{lowStock.length}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by product or supplier..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Reagent">Reagent</SelectItem>
                <SelectItem value="Consumable">Consumable</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
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
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="hidden md:table-cell w-40">Stock Level</TableHead>
                  <TableHead className="hidden lg:table-cell">Reorder At</TableHead>
                  <TableHead className="hidden xl:table-cell">Supplier</TableHead>
                  <TableHead className="hidden lg:table-cell">Unit Cost</TableHead>
                  <TableHead className="pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.reorderLevel;
                  return (
                    <TableRow key={item.id} className={`hover:bg-muted/20 transition-colors ${isLow ? 'bg-destructive/5' : ''}`}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <Package className={`w-4 h-4 flex-shrink-0 ${isLow ? 'text-destructive' : 'text-muted-foreground'}`} />
                          <span className="font-medium text-sm">{item.product}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Progress value={stockLevel(item)} className={`h-2 ${isLow ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{item.reorderLevel} {item.unit}</TableCell>
                      <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{item.supplier}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">₦{item.unitCost.toLocaleString()}</TableCell>
                      <TableCell className="pr-6">
                        {isLow ? (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
                            <AlertTriangle className="w-3 h-3" />Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-success border-success/30">In Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
