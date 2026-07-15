import { useState, useEffect } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
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
import { useUpdateInventoryItem } from "@/hooks/use-inventory";
import endpoint from "@/api/endpoints";
import type {
  InventoryItem,
  InventoryCategory,
  InventoryStatus,
} from "@/api/types/inventory";

interface EditItemDialogProps {
  target: InventoryItem | null;
  onClose: () => void;
}

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "" as InventoryCategory | "",
  unit: "",
  reorderLevel: "",
  unitCost: "",
  supplier: "",
  expiryDate: "",
  status: "active" as InventoryStatus,
};

export function EditItemDialog({ target, onClose }: EditItemDialogProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { updateItem, isLoading: isUpdating } = useUpdateInventoryItem([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (target) {
      setForm({
        name: target.name,
        sku: target.sku ?? "",
        category: target.category,
        unit: target.unit,
        reorderLevel: String(target.reorderLevel),
        unitCost: String(target.unitCost),
        supplier: target.supplier ?? "",
        expiryDate: target.expiryDate ? target.expiryDate.slice(0, 10) : "",
        status: target.status,
      });
    }
  }, [target]);

  const handleSave = async () => {
    if (!target) return;
    if (!form.name || !form.category || !form.unit) {
      toast({
        title: "Validation Error",
        description: "Name, category, and unit are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateItem(target._id, {
        name: form.name,
        sku: form.sku || undefined,
        category: form.category as InventoryCategory,
        unit: form.unit,
        reorderLevel: parseInt(form.reorderLevel) || 0,
        unitCost: parseFloat(form.unitCost) || 0,
        supplier: form.supplier || undefined,
        expiryDate: form.expiryDate || undefined,
        status: form.status,
      });
      mutate((key: unknown) =>
        typeof key === "string" && key.startsWith(endpoint.lab.inventory.list),
      );
      toast({ title: "Item updated" });
      onClose();
    } catch {
      toast({ title: "Failed to update item", variant: "destructive" });
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit — {target?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. EDTA Tubes 5mL"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input
                placeholder="e.g. EDTA-5ML"
                value={form.sku}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sku: e.target.value.toUpperCase() }))
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
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, expiryDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, status: v as InventoryStatus }))
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
