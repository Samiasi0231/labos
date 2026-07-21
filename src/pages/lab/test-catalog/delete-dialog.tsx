import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import { PermissionButton } from "@/components/button";
=======
>>>>>>> origin/main
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
<<<<<<< HEAD
import { useMutation } from "@/hooks/use-api";
=======
import { useToast } from "@/hooks/use-toast";
import { useRemoveTest } from "@/hooks/use-test-catalog";
>>>>>>> origin/main
import endpoint from "@/api/endpoints";
import type { TestCatalogEntry } from "@/api/types/test-catalog";

interface DeleteDialogProps {
  target: TestCatalogEntry | null;
  onClose: () => void;
}

export function DeleteDialog({ target, onClose }: DeleteDialogProps) {
<<<<<<< HEAD
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
=======
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { removeTest } = useRemoveTest([]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await removeTest(target._id);
      mutate((key: unknown) =>
        typeof key === "string" && key.startsWith(endpoint.lab.testCatalog.list),
      );
      toast({ title: "Test deleted", description: `${target.name} removed.` });
      onClose();
    } catch {
      toast({
        title: "Cannot delete test",
        description: "This test has existing orders. Deactivate it instead.",
        variant: "destructive",
      });
      onClose();
    }
>>>>>>> origin/main
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
<<<<<<< HEAD
          <PermissionButton
            variant="destructive"
            permission="test_catalog.delete"
            fallback="hide"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleConfirm}
          >
            Delete
          </PermissionButton>
=======
          <Button variant="destructive" onClick={handleConfirm} className="gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
>>>>>>> origin/main
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
