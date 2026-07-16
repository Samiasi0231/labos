import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2, CheckCircle2, RotateCw } from "lucide-react";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  TestCatalogEntry,
  TestCatalogParameter,
  UpdateParameterPayload,
} from "@/api/types/test-catalog";

type RowSaveState = "idle" | "saving" | "saved" | "error";

interface Draft {
  price: string;
  unit: string;
}

interface Props {
  test: TestCatalogEntry;
  open: boolean;
  onClose: () => void;
  onExpand: (param: TestCatalogParameter) => void;
  onSaved: () => void;
}

export function BulkConfigureSheet({ test, open, onClose, onExpand, onSaved }: Props) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [rowStates, setRowStates] = useState<Record<string, RowSaveState>>({});
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const init: Record<string, Draft> = {};
      test.parameters.forEach((p) => {
        init[p._id] = { price: String(p.price ?? 0), unit: p.unit ?? "" };
      });
      setDrafts(init);
      setRowStates({});
    }
  }, [open, test.parameters]);

  // Stable key for useMutation — URL overridden per-call
  const saveParam = useMutation<unknown, UpdateParameterPayload>(
    endpoint.lab.testCatalog.list,
    { method: "PATCH", skipErrorHandling: true },
  );

  function changedParams() {
    return test.parameters.filter((p) => {
      const d = drafts[p._id];
      return d && (String(p.price ?? 0) !== d.price || (p.unit ?? "") !== d.unit);
    });
  }

  async function saveAll() {
    const changed = changedParams();
    if (changed.length === 0) return;

    setBulkSaving(true);
    setRowStates((prev) => {
      const next = { ...prev };
      changed.forEach((p) => { next[p._id] = "saving"; });
      return next;
    });

    await Promise.all(
      changed.map(async (p) => {
        const d = drafts[p._id];
        try {
          await saveParam.trigger(
            { price: parseFloat(d.price) || 0, unit: d.unit || undefined },
            endpoint.lab.testCatalog.updateParameter(test._id, p._id),
          );
          setRowStates((prev) => ({ ...prev, [p._id]: "saved" }));
        } catch {
          setRowStates((prev) => ({ ...prev, [p._id]: "error" }));
        }
      }),
    );

    setBulkSaving(false);
    onSaved();
  }

  async function retryRow(p: TestCatalogParameter) {
    const d = drafts[p._id];
    setRowStates((prev) => ({ ...prev, [p._id]: "saving" }));
    try {
      await saveParam.trigger(
        { price: parseFloat(d.price) || 0, unit: d.unit || undefined },
        endpoint.lab.testCatalog.updateParameter(test._id, p._id),
      );
      setRowStates((prev) => ({ ...prev, [p._id]: "saved" }));
      onSaved();
    } catch {
      setRowStates((prev) => ({ ...prev, [p._id]: "error" }));
    }
  }

  function setDraft(paramId: string, field: keyof Draft, value: string) {
    setDrafts((prev) => ({ ...prev, [paramId]: { ...prev[paramId], [field]: value } }));
    setRowStates((prev) => ({ ...prev, [paramId]: "idle" }));
  }

  const changedCount = changedParams().length;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="sm:max-w-[640px] flex flex-col p-6 gap-0"
      >
        <SheetHeader className="flex-shrink-0 mb-[14px] space-y-0">
          <SheetTitle className="text-[18px] font-bold">
            Configure All Parameters
          </SheetTitle>
          <p className="text-[13px] text-muted-foreground mt-[3px]">{test.name}</p>
        </SheetHeader>

        {/* Scrollable rows */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 min-h-0">
          {test.parameters.map((p) => {
            const draft = drafts[p._id] ?? { price: String(p.price ?? 0), unit: p.unit ?? "" };
            const rowState: RowSaveState = rowStates[p._id] ?? "idle";

            return (
              <div
                key={p._id}
                className="border border-border rounded-[var(--radius)] overflow-hidden"
              >
                <div className="flex items-center gap-[10px] p-[10px_12px]">
                  <p className="flex-1 min-w-0 text-[13px] font-semibold truncate">
                    {p.name}
                  </p>

                  {/* Price input */}
                  <div className="relative w-[100px] flex-shrink-0">
                    <span className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground pointer-events-none">
                      ₦
                    </span>
                    <Input
                      type="number"
                      min="0"
                      value={draft.price}
                      onChange={(e) => setDraft(p._id, "price", e.target.value)}
                      className="h-8 pl-[22px] w-full text-[12.5px]"
                    />
                  </div>

                  {/* Unit input */}
                  <Input
                    placeholder="Unit"
                    value={draft.unit}
                    onChange={(e) => setDraft(p._id, "unit", e.target.value)}
                    className="h-8 w-[100px] flex-shrink-0 text-[12.5px]"
                  />

                  {/* Expand to single configure */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-[30px] w-[30px] flex-shrink-0"
                    onClick={() => onExpand(p)}
                    title="Configure parameter"
                  >
                    <Pencil className="w-[13px] h-[13px]" />
                  </Button>

                  {/* Row save state */}
                  <div className="w-5 flex-shrink-0 flex justify-center">
                    {rowState === "saving" && (
                      <Loader2 className="w-[14px] h-[14px] animate-spin text-muted-foreground" />
                    )}
                    {rowState === "saved" && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                    {rowState === "error" && (
                      <button
                        title="Retry"
                        onClick={() => retryRow(p)}
                        className="border-none bg-transparent cursor-pointer text-destructive hover:opacity-70 flex"
                      >
                        <RotateCw className="w-[14px] h-[14px]" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 mt-[14px] pt-[14px] border-t border-border flex items-center justify-between">
          <p className="text-[12.5px] text-muted-foreground">
            {changedCount} parameter{changedCount !== 1 ? "s" : ""} changed
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button disabled={changedCount === 0 || bulkSaving} onClick={saveAll}>
              {bulkSaving ? (
                <>
                  <Loader2 className="w-[14px] h-[14px] animate-spin mr-[6px]" />
                  Saving…
                </>
              ) : (
                "Save All"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
