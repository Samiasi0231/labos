import { useState, useEffect } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PackagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
<<<<<<< HEAD
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { InventoryItem, RestockPayload, StockMutationResponse } from "@/api/types/inventory";
=======
import { useRestockItem } from "@/hooks/use-inventory";
import endpoint from "@/api/endpoints";
import type { InventoryItem } from "@/api/types/inventory";
>>>>>>> origin/main

interface RestockDialogProps {
  target: InventoryItem | null;
  onClose: () => void;
}

const EMPTY_FORM = {
  quantity: "",
  unitCost: "",
  supplier: "",
  expiryDate: "",
  note: "",
};

export function RestockDialog({ target, onClose }: RestockDialogProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
<<<<<<< HEAD
  const { trigger: triggerRestock, isLoading: isRestocking } = useMutation<
    StockMutationResponse,
    RestockPayload
  >("inventory/restock", { successToast: "Stock restocked", invalidate: [] });
=======
  const { restock, isLoading: isRestocking } = useRestockItem([]);
>>>>>>> origin/main
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (target) {
      setForm({
        quantity: "",
        unitCost: String(target.unitCost || ""),
        supplier: target.supplier ?? "",
        expiryDate: "",
        note: "",
      });
    }
  }, [target]);

  const handleConfirm = async () => {
    if (!target) return;
    const qty = parseFloat(form.quantity);
    if (!qty || qty <= 0) {
      toast({ title: "Enter a valid quantity", variant: "destructive" });
      return;
    }
<<<<<<< HEAD
    const res = await triggerRestock(
      {
=======
    try {
      await restock(target._id, {
>>>>>>> origin/main
        quantity: qty,
        unitCost: form.unitCost ? parseFloat(form.unitCost) : undefined,
        supplier: form.supplier || undefined,
        expiryDate: form.expiryDate || undefined,
        note: form.note || undefined,
<<<<<<< HEAD
      },
      endpoint.lab.inventory.restock(target._id),
    );
    if (!res) return;
    mutate((key: unknown) =>
      typeof key === "string" && key.startsWith(endpoint.lab.inventory.list),
    );
    onClose();
=======
      });
      mutate((key: unknown) =>
        typeof key === "string" && key.startsWith(endpoint.lab.inventory.list),
      );
      toast({
        title: "Item restocked",
        description: `${target.name} +${qty} ${target.unit}`,
      });
      onClose();
    } catch {
      toast({ title: "Restock failed", variant: "destructive" });
    }
>>>>>>> origin/main
  };

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Restock — {target?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>
              Quantity to add <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              placeholder="e.g. 50"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
            />
          </div>
          {target && form.quantity && (
            <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
              Current stock:{" "}
              <span className="font-semibold">{target.quantityOnHand}</span> →
              After restock:{" "}
              <span className="font-semibold text-success">
                {target.quantityOnHand + (parseFloat(form.quantity) || 0)}{" "}
                {target.unit}
              </span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Unit Cost (₦)</Label>
              <Input
                type="number"
                value={form.unitCost}
                onChange={(e) => setForm((p) => ({ ...p, unitCost: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Supplier</Label>
            <Input
              value={form.supplier}
              onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Note</Label>
            <Textarea
              placeholder="e.g. Monthly delivery from supplier"
              rows={2}
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isRestocking} className="gap-2">
            <PackagePlus className="w-4 h-4" />
            {isRestocking ? "Restocking…" : "Confirm Restock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
