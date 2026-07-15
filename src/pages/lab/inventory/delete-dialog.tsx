import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRemoveInventoryItem } from "@/hooks/use-inventory";
import endpoint from "@/api/endpoints";
import type { InventoryItem } from "@/api/types/inventory";

interface DeleteItemDialogProps {
  target: InventoryItem | null;
  onClose: () => void;
}

export function DeleteItemDialog({ target, onClose }: DeleteItemDialogProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { removeItem, isLoading: isRemoving } = useRemoveInventoryItem([]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await removeItem(target._id);
      mutate((key: unknown) =>
        typeof key === "string" && key.startsWith(endpoint.lab.inventory.list),
      );
      toast({ title: "Item removed", description: `${target.name} deleted.` });
      onClose();
    } catch {
      toast({
        title: "Cannot delete",
        description: "Item still has stock on hand. Adjust to zero first.",
        variant: "destructive",
      });
      onClose();
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Item
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Delete{" "}
          <span className="font-semibold text-foreground">{target?.name}</span>?
          This is only possible when stock on hand is zero.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isRemoving}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isRemoving ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
