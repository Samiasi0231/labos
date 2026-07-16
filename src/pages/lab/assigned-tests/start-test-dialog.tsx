import { useState } from "react";
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
import { Play, FlaskConical } from "lucide-react";
import { useApi, useMutation } from "@/hooks/use-api";
import type {
  AssignmentItem,
  TestOrderItem,
  StartTestPayload,
} from "@/api/types/test-order";
import type { TestCatalogEntry } from "@/api/types/test-catalog";
import endpoint from "@/api/endpoints";
import { concatStrings } from "@/lib/utils";

interface StartTestDialogProps {
  item: AssignmentItem | null;
  onClose: () => void;
  onStarted: () => void;
}

export function StartTestDialog({
  item,
  onClose,
  onStarted,
}: StartTestDialogProps) {
  const [materialQtys, setMaterialQtys] = useState<Record<string, string>>({});

  const { trigger: startTest, isLoading: isStarting } = useMutation<
    TestOrderItem,
    StartTestPayload
  >("test-orders/start-test", {
    successToast: "Test started",
    invalidate: [endpoint.lab.testOrders.assignments],
  });

  const { data: catalogData, isLoading: isLoadingCatalog } =
    useApi<TestCatalogEntry>(
      item ? endpoint.lab.testCatalog.get(item.testCatalog) : null,
    );
  const analysisMaterials = (catalogData?.data?.materials ?? []).filter(
    (m) => m.phase === "analysis" && m.inventoryItem != null && typeof m.inventoryItem === "object",
  );

  const handleClose = () => {
    setMaterialQtys({});
    onClose();
  };

  const handleStart = async () => {
    if (!item) return;
    const materials = analysisMaterials
      .map((m) => ({
        catalogMaterialId: m._id,
        quantity: parseFloat(materialQtys[m._id] ?? "0"),
      }))
      .filter((m) => m.quantity > 0);

    const res = await startTest(
      { materials },
      endpoint.lab.testOrders.startTest(item.testOrder._id, item._id),
    );
    if (!res) return;
    setMaterialQtys({});
    onStarted();
  };

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            Start Test
          </DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Starting:{" "}
              <span className="font-medium text-foreground">
                {item.testName}
              </span>
            </p>
            <p className="text-xs capitalize text-muted-foreground">
              Patient: {concatStrings(item?.testOrder?.patient?.firstName, item?.testOrder?.patient?.lastName, " ")}
            </p>
          </div>
        )}

        <div className="space-y-3 py-1">
          {isLoadingCatalog && (
            <p className="text-sm text-muted-foreground">
              Loading materials…
            </p>
          )}

          {!isLoadingCatalog && analysisMaterials.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No analysis materials required. Click Start to proceed.
            </p>
          )}

          {!isLoadingCatalog && analysisMaterials.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Analysis Materials Used
              </Label>
              {analysisMaterials.map((m) => (
                <div key={m._id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {m.inventoryItem.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.inventoryItem.unit} · {m.inventoryItem.quantityOnHand}{" "}
                      on hand
                    </p>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="Qty"
                    className="w-20 h-8 text-sm text-right"
                    value={materialQtys[m._id] ?? ""}
                    onChange={(e) =>
                      setMaterialQtys((prev) => ({
                        ...prev,
                        [m._id]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={isStarting || isLoadingCatalog}
            className="gap-1.5"
          >
            <Play className="w-4 h-4" />
            {isStarting ? "Starting…" : "Start Test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
