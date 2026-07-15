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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdjustStock, useInventoryList } from "@/hooks/use-inventory";
import endpoint from "@/api/endpoints";

interface AdjustDialogProps {
  open: boolean;
  defaultItemId?: string;
  onClose: () => void;
}

const EMPTY_FORM = {
  type: "adjustment" as "adjustment" | "expired",
  direction: "add" as "add" | "remove",
  quantity: "",
  reason: "",
};

export function AdjustDialog({ open, defaultItemId = "", onClose }: AdjustDialogProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { adjust, isLoading: isAdjusting } = useAdjustStock([]);
  const { items: allItems } = useInventoryList({ limit: 100 });

  const [adjustItemId, setAdjustItemId] = useState(defaultItemId);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    if (open) {
      setAdjustItemId(defaultItemId);
      setForm({ ...EMPTY_FORM });
    }
  }, [open, defaultItemId]);

  const adjustItem = allItems.find((i) => i._id === adjustItemId) ?? null;
  const adjustPreviewQty = adjustItem
    ? adjustItem.quantityOnHand +
      (form.direction === "add" ? 1 : -1) * (parseFloat(form.quantity) || 0)
    : null;

  const handleConfirm = async () => {
    if (!adjustItemId) {
      toast({ title: "Select a product", variant: "destructive" });
      return;
    }
    const qty = parseFloat(form.quantity);
    if (!qty || qty <= 0) {
      toast({ title: "Enter a valid quantity", variant: "destructive" });
      return;
    }
    if (adjustPreviewQty !== null && adjustPreviewQty < 0) {
      toast({ title: "Result cannot be negative", variant: "destructive" });
      return;
    }
    if (!form.reason.trim() || form.reason.trim().length < 2) {
      toast({
        title: "Reason is required (min 2 characters)",
        variant: "destructive",
      });
      return;
    }
    const quantityChange = form.direction === "add" ? qty : -qty;
    try {
      await adjust(adjustItemId, {
        quantityChange,
        reason: form.reason.trim(),
        type: form.type,
      });
      mutate((key: unknown) =>
        typeof key === "string" && key.startsWith(endpoint.lab.inventory.list),
      );
      toast({
        title: "Stock adjusted",
        description: adjustItem
          ? `${adjustItem.name} adjusted to ${adjustPreviewQty} ${adjustItem.unit}.`
          : "Stock adjusted.",
      });
      onClose();
    } catch {
      toast({ title: "Adjustment failed", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Adjustment</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>
              Product <span className="text-destructive">*</span>
            </Label>
            <Select value={adjustItemId} onValueChange={setAdjustItemId}>
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
              value={form.direction}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, direction: v as "add" | "remove" }))
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
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
            />
          </div>
          {adjustItem && form.quantity && (
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
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              isAdjusting ||
              (adjustPreviewQty !== null && adjustPreviewQty < 0)
            }
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            {isAdjusting ? "Adjusting…" : "Confirm Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
