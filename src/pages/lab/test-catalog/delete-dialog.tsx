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
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { TestCatalogEntry } from "@/api/types/test-catalog";

interface DeleteDialogProps {
  target: TestCatalogEntry | null;
  onClose: () => void;
}

export function DeleteDialog({ target, onClose }: DeleteDialogProps) {
  const { mutate } = useSWRConfig();
  const { trigger: triggerRemove } = useMutation<unknown, void>(
    "test-catalog/remove",
    { method: "DELETE", successToast: "Test deleted", invalidate: [] },
  );

  const handleConfirm = async () => {
    if (!target) return;
    const res = await triggerRemove(undefined, endpoint.lab.testCatalog.remove(target._id));
    if (!res) return;
    mutate((key: unknown) =>
      typeof key === "string" && key.startsWith(endpoint.lab.testCatalog.list),
    );
    onClose();
  };

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete Test
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{target?.name}</span>?
          This will remove it from your catalog. If this test has existing
          orders, deletion will be blocked — deactivate it instead.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} className="gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
