import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { cn, concatStrings } from "@/lib/utils";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { TestCatalogEntry, CatalogMaterial } from "@/api/types/test-catalog";
import type { SearchHit } from "@/api/types/search";
import { GlobalSearchSelect } from "@/components/lab/GlobalSearchSelect";

interface Props {
  test: TestCatalogEntry;
  onRefresh: () => void;
}

const LBL =
  "block text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-[5px]";

function PhaseBadge({ phase }: { phase: "collection" | "analysis" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-[10px] py-[2px] text-[11px] font-semibold whitespace-nowrap border",
        phase === "collection"
          ? "bg-info/15 text-info border-info/30"
          : "bg-primary/15 text-primary border-primary/30",
      )}
    >
      {phase === "collection" ? "Collection" : "Analysis"}
    </span>
  );
}

function MaterialRow({
  material,
  testId,
  onRefresh,
}: {
  material: CatalogMaterial;
  testId: string;
  onRefresh: () => void;
}) {
  const [swapping, setSwapping] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const updatePhase = useMutation<unknown, { phase: string }>(
    endpoint.lab.testCatalog.updateMaterial(testId, material._id),
    { method: "PATCH", onSuccess: onRefresh },
  );

  const remove = useMutation(
    endpoint.lab.testCatalog.removeMaterial(testId, material._id),
    { method: "DELETE", successToast: "Material removed", onSuccess: onRefresh },
  );

  async function handlePhaseChange(newPhase: string) {
    setSwapping(true);
    await updatePhase.trigger({ phase: newPhase });
    setSwapping(false);
  }

  const item = material.inventoryItem;
  const skuLine = concatStrings(item?.sku, item?.unit, `${item?.quantityOnHand} in stock`, " · ");

  return (
    <div className="border border-border rounded-[var(--radius)] p-[10px_12px]">
      <div className="flex items-center gap-[10px]">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold">{item.name}</p>
          <p className="text-[11px] text-muted-foreground capitalize mt-[1px]">{skuLine}</p>
        </div>

        <PhaseBadge phase={material.phase} />

        {swapping ? (
          <Loader2 className="w-[14px] h-[14px] animate-spin text-muted-foreground flex-shrink-0" />
        ) : (
          <Select value={material.phase} onValueChange={handlePhaseChange}>
            <SelectTrigger className="w-28 h-8 text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="collection">Collection</SelectItem>
              <SelectItem value="analysis">Analysis</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0 text-destructive hover:text-destructive"
          onClick={() => setRemoveOpen((v) => !v)}
        >
          <Trash2 className="w-[14px] h-[14px]" />
        </Button>
      </div>

      {removeOpen && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
          <p className="flex-1 text-[12px] text-foreground">Remove this material?</p>
          <Button variant="ghost" size="sm" onClick={() => setRemoveOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={remove.isLoading}
            onClick={() => remove.trigger()}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

function PhaseGroup({
  label,
  description,
  materials,
  testId,
  onRefresh,
}: {
  label: string;
  description: string;
  materials: CatalogMaterial[];
  testId: string;
  onRefresh: () => void;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-[10px]">
        <p className="text-[12.5px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {label}
        </p>
        <p className="text-[11.5px] text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-[6px]">
        {materials.length > 0 ? (
          materials.map((m) => (
            <MaterialRow key={m._id} material={m} testId={testId} onRefresh={onRefresh} />
          ))
        ) : (
          <div className="text-center py-[14px] px-[10px] border border-dashed border-border rounded-[var(--radius)] text-[12px] text-muted-foreground">
            No materials added
          </div>
        )}
      </div>
    </div>
  );
}

function AddMaterialDialog({
  testId,
  existingMaterials,
  open,
  onClose,
  onSuccess,
}: {
  testId: string;
  existingMaterials: CatalogMaterial[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selected, setSelected] = useState<SearchHit | null>(null);
  const [phase, setPhase] = useState<"collection" | "analysis">("collection");

  const addMaterial = useMutation<unknown, { inventoryItem: string; phase: string }>(
    endpoint.lab.testCatalog.addMaterial(testId),
    {
      method: "POST",
      successToast: "Material added",
      onSuccess: () => {
        setSelected(null);
        setPhase("collection");
        onSuccess();
      },
    },
  );

  const isDuplicate =
    selected !== null &&
    existingMaterials.some(
      (m) => m.inventoryItem._id === selected.id && m.phase === phase,
    );

  const isDisabled = !selected || isDuplicate || addMaterial.isLoading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold">Add Material</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[14px]">
          <div>
            <label className={LBL}>Inventory Item</label>
            <GlobalSearchSelect
              types={["inventory"]}
              placeholder="Search by name or code…"
              emptyMessage="No items found"
              value={selected}
              onSelect={(hit) => setSelected(hit)}
              onClear={() => setSelected(null)}
              className="w-full mt-1"
            />
          </div>

          <div>
            <label className={LBL}>Phase</label>
            <div className="flex flex-col gap-2 mt-1">
              {(["collection", "analysis"] as const).map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-[10px] border border-border rounded-[var(--radius)] p-[9px_12px] cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <input
                    type="radio"
                    name="mat-phase"
                    checked={phase === p}
                    onChange={() => setPhase(p)}
                    className="accent-primary"
                  />
                  <span>
                    <span className="text-[13.5px] font-semibold block capitalize">{p}</span>
                    <span className="text-[11.5px] text-muted-foreground">
                      {p === "collection"
                        ? "Used during sample collection"
                        : "Used during test processing"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {isDuplicate && (
            <div className="flex items-start gap-2 bg-warning/8 border border-warning/25 rounded-[var(--radius)] p-[10px_12px]">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-foreground">
                This item is already listed under{" "}
                {phase === "collection" ? "Collection" : "Analysis"}.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-[14px]">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={isDisabled}
              onClick={() =>
                addMaterial.trigger({ inventoryItem: selected!.id, phase })
              }
            >
              {addMaterial.isLoading ? "Adding…" : "Add Material"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MaterialsCard({ test, onRefresh }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const materials = test.materials ?? [];
  const collectionMats = materials.filter((m) => m.phase === "collection");
  const analysisMats = materials.filter((m) => m.phase === "analysis");

  return (
    <>
      <Card className="shadow-card overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-[14px] font-semibold">Materials</p>
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="w-[14px] h-[14px]" />
            Add Material
          </Button>
        </div>

        {materials.length === 0 ? (
          <div className="mx-5 my-[18px] flex items-start gap-3 bg-warning/10 border border-warning/30 rounded-[var(--radius)] p-[14px_16px]">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] text-foreground">
                No materials configured. Add the inventory items needed to collect
                samples and run this test.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-[10px] gap-1.5"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Material
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-[18px] flex flex-col gap-5">
            <PhaseGroup
              label="Collection"
              description="Items needed when collecting the patient sample"
              materials={collectionMats}
              testId={test._id}
              onRefresh={onRefresh}
            />
            <PhaseGroup
              label="Analysis"
              description="Items consumed during test processing"
              materials={analysisMats}
              testId={test._id}
              onRefresh={onRefresh}
            />
          </div>
        )}
      </Card>

      <AddMaterialDialog
        testId={test._id}
        existingMaterials={materials}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          setAddOpen(false);
          onRefresh();
        }}
      />
    </>
  );
}
