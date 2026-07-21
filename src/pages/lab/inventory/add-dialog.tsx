import { useState } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { PermissionButton } from "@/components/button";
=======
>>>>>>> origin/main
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
<<<<<<< HEAD
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  InventoryCategory,
  InventoryItem,
  InventoryStatus,
  CreateInventoryItemPayload,
  RestockPayload,
  StockMutationResponse,
} from "@/api/types/inventory";
=======
import { useCreateInventoryItem, useRestockItem } from "@/hooks/use-inventory";
import endpoint from "@/api/endpoints";
import type { InventoryCategory, InventoryStatus } from "@/api/types/inventory";
>>>>>>> origin/main

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "" as InventoryCategory | "",
  unit: "",
  quantity: "",
  reorderLevel: "",
  unitCost: "",
  supplier: "",
  status: "active" as InventoryStatus,
};

export function AddItemDialog({ open, onClose }: AddItemDialogProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
<<<<<<< HEAD
  const { trigger: triggerCreate, isLoading: isCreating } = useMutation<
    InventoryItem,
    CreateInventoryItemPayload
  >(endpoint.lab.inventory.create, { successToast: "Item added", invalidate: [] });
  const { trigger: triggerRestock, isLoading: isRestocking } = useMutation<
    StockMutationResponse,
    RestockPayload
  >("inventory/restock", { successToast: "Stock restocked", invalidate: [] });
=======
  const { createItem, isLoading: isCreating } = useCreateInventoryItem([]);
  const { restock, isLoading: isRestocking } = useRestockItem([]);
>>>>>>> origin/main
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const handleAdd = async () => {
    if (!form.name || !form.category || !form.unit) {
      toast({
        title: "Validation Error",
        description: "Name, category, and unit are required.",
        variant: "destructive",
      });
      return;
    }
<<<<<<< HEAD
    const res = await triggerCreate({
      name: form.name,
      category: form.category as InventoryCategory,
      unit: form.unit,
      reorderLevel: parseInt(form.reorderLevel) || 0,
      unitCost: parseFloat(form.unitCost) || 0,
      supplier: form.supplier || undefined,
    });
    if (!res) return;
    const created = res.data;

    const initialQty = parseFloat(form.quantity) || 0;
    if (initialQty > 0 && created._id) {
      const restockRes = await triggerRestock(
        { quantity: initialQty },
        endpoint.lab.inventory.restock(created._id),
      );
      if (!restockRes) return;
    }

    mutate((key: unknown) =>
      typeof key === "string" && key.startsWith(endpoint.lab.inventory.list),
    );
    setForm({ ...EMPTY_FORM });
    onClose();
=======
    try {
      const created = await createItem({
        name: form.name,
        category: form.category as InventoryCategory,
        unit: form.unit,
        reorderLevel: parseInt(form.reorderLevel) || 0,
        unitCost: parseFloat(form.unitCost) || 0,
        supplier: form.supplier || undefined,
      });

      const initialQty = parseFloat(form.quantity) || 0;
      if (initialQty > 0 && created?._id) {
        await restock(created._id, { quantity: initialQty });
        toast({
          title: "Item added & stocked",
          description: `${form.name} added with ${initialQty} ${form.unit} in stock.`,
        });
      } else {
        toast({
          title: "Item added",
          description: `${form.name} added. Use Restock to add quantity.`,
        });
      }

      mutate((key: unknown) =>
        typeof key === "string" && key.startsWith(endpoint.lab.inventory.list),
      );
      setForm({ ...EMPTY_FORM });
      onClose();
    } catch {
      toast({ title: "Failed to add item", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setForm({ ...EMPTY_FORM });
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, category: v as InventoryCategory }))
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
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reorder Level</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reorderLevel: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
<<<<<<< HEAD
          <PermissionButton
            permission="inventory.create"
            fallback="hide"
            isLoading={isCreating || isRestocking}
            onClick={handleAdd}
          >
            Add Item
          </PermissionButton>
=======
          <Button onClick={handleAdd} disabled={isCreating || isRestocking}>
            {isCreating || isRestocking ? "Adding…" : "Add Item"}
          </Button>
>>>>>>> origin/main
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
