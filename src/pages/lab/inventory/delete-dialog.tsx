import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { InventoryItem } from "@/api/types/inventory";

interface DeleteItemDialogProps {
  target: InventoryItem | null;
  onClose: () => void;
}

export function DeleteItemDialog({ target, onClose }: DeleteItemDialogProps) {
  const { mutate } = useSWRConfig();
  const { trigger: triggerRemove, isLoading: isRemoving } = useMutation<unknown, void>(
    "inventory/remove",
    { method: "DELETE", successToast: "Item removed", invalidate: [] },
  );

  const handleConfirm = async () => {
    if (!target) return;
    const res = await triggerRemove(undefined, endpoint.lab.inventory.remove(target._id));
    if (!res) return;
    mutate((key: unknown) =>
      typeof key === "string" && key.startsWith(endpoint.lab.inventory.list),
    );
    onClose();
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
          <PermissionButton
            variant="destructive"
            permission="inventory.delete"
            fallback="hide"
            isLoading={isRemoving}
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleConfirm}
          >
            Delete
          </PermissionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
