import { useState, useEffect } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Pencil, Check, X, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useUpdateTest,
  useAddParameter,
  useRemoveParameter,
} from "@/hooks/use-test-catalog";
import endpoint from "@/api/endpoints";
import { unslugify } from "@/lib/utils";
import type { TestCatalogEntry, ParamType } from "@/api/types/test-catalog";
import {
  CATEGORY_SUGGESTIONS,
  SAMPLE_TYPES,
  EditFormState,
  EditParamState,
  emptyEditParam,
  buildRangeForEdit,
} from "./shared";

interface EditDialogProps {
  target: TestCatalogEntry | null;
  onClose: () => void;
}

export function EditDialog({ target, onClose }: EditDialogProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { updateTest } = useUpdateTest([]);
  const { addParameter } = useAddParameter([]);
  const { removeParameter } = useRemoveParameter([]);

  const [editForm, setEditForm] = useState<EditFormState>({
    name: "",
    code: "",
    category: "",
    turnaroundTime: "",
    samples: [],
    parameters: [],
  });
  const [newParam, setNewParam] = useState<EditParamState>(emptyEditParam);

  useEffect(() => {
    if (target) {
      setEditForm({
        name: target.name,
        code: target.code,
        category: unslugify(target.category),
        turnaroundTime: String(target.turnaroundTime),
        samples: target.samples ?? [],
        parameters: target.parameters,
      });
      setNewParam(emptyEditParam);
    }
  }, [target]);

  const invalidateList = () =>
    mutate(
      (key: unknown) =>
        typeof key === "string" &&
        key.startsWith(endpoint.lab.testCatalog.list),
    );

  const handleEditSave = async () => {
    if (
      !target ||
      !editForm.name ||
      !editForm.category ||
      !editForm.turnaroundTime ||
      editForm.samples.length === 0
    ) {
      toast({ title: "Required fields missing", variant: "destructive" });
      return;
    }
    try {
      await updateTest(target._id, {
        name: editForm.name,
        category: editForm.category,
        turnaroundTime: Number(editForm.turnaroundTime),
        samples: editForm.samples,
      });
      await invalidateList();
      toast({
        title: "Test updated",
        description: `${editForm.name} has been updated.`,
      });
      onClose();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const addParamToExistingTest = async () => {
    if (!target) return;
    if (!newParam.name) {
      toast({ title: "Parameter name required", variant: "destructive" });
      return;
    }
    try {
      const updated = await addParameter(target._id, {
        name: newParam.name,
        unit:
          newParam.type !== "select" ? newParam.unit || undefined : undefined,
        type: newParam.type,
        options:
          newParam.type === "select"
            ? newParam.options
                .split(",")
                .map((o) => o.trim())
                .filter(Boolean)
            : undefined,
        referenceRange: buildRangeForEdit(newParam),
        price: Number(newParam.price) || 0,
      });
      if (updated) {
        setEditForm((prev) => ({ ...prev, parameters: updated.parameters }));
      }
      setNewParam(emptyEditParam);
      await invalidateList();
      toast({ title: "Parameter added" });
    } catch {
      toast({ title: "Failed to add parameter", variant: "destructive" });
    }
  };

  const handleRemoveExistingParam = async (paramId: string) => {
    if (!target) return;
    try {
      const updated = await removeParameter(target._id, paramId);
      if (updated) {
        setEditForm((prev) => ({ ...prev, parameters: updated.parameters }));
      }
      await invalidateList();
      toast({ title: "Parameter removed" });
    } catch {
      toast({ title: "Failed to remove parameter", variant: "destructive" });
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            Edit Test
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Test Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Full Blood Count"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Code{" "}
                <span className="text-muted-foreground text-xs">(locked)</span>
              </Label>
              <Input value={editForm.code} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Input
                list="edit-category-suggestions"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, category: e.target.value }))
                }
                placeholder="e.g. Haematology"
              />
              <datalist id="edit-category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label>Turnaround Time (hours) *</Label>
              <Input
                type="number"
                min="0"
                value={editForm.turnaroundTime}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, turnaroundTime: e.target.value }))
                }
                placeholder="e.g. 24"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Sample Type *</Label>
            <Select
              value=""
              onValueChange={(v) => {
                if (!editForm.samples.includes(v))
                  setEditForm((p) => ({ ...p, samples: [...p.samples, v] }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Add sample type…" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_TYPES.filter((s) => !editForm.samples.includes(s)).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
            {editForm.samples.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {editForm.samples.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-muted border border-border rounded-full py-0.5 pl-2.5 pr-1"
                  >
                    {s}
                    <button
                      type="button"
                      className="flex items-center text-muted-foreground hover:text-foreground p-0.5"
                      onClick={() =>
                        setEditForm((p) => ({
                          ...p,
                          samples: p.samples.filter((x) => x !== s),
                        }))
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-sm font-semibold">Parameters</p>
            {editForm.parameters.length > 0 && (
              <div className="space-y-1.5">
                {editForm.parameters.map((p) => (
                  <div
                    key={p._id}
                    className="p-2 bg-muted/30 rounded-lg flex items-center gap-2 text-xs"
                  >
                    <span className="font-medium flex-1 truncate">{p.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1 h-4 shrink-0 ${p.type === "numeric" ? "border-info/40 text-info" : p.type === "select" ? "border-accent/40 text-accent" : "border-muted text-muted-foreground"}`}
                    >
                      {p.type}
                    </Badge>
                    <span className="text-muted-foreground shrink-0">
                      {p.unit || "—"}
                    </span>
                    <span className="text-primary shrink-0 font-medium">
                      ₦{(p.price ?? 0).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleRemoveExistingParam(p._id)}
                      className="text-destructive hover:opacity-70 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 bg-muted/20 rounded-xl space-y-3 border border-dashed border-border">
              <p className="text-xs font-semibold text-foreground">
                Add Parameter
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Parameter name *"
                  className="text-xs h-8"
                  value={newParam.name}
                  onChange={(e) =>
                    setNewParam((p) => ({ ...p, name: e.target.value }))
                  }
                />
                {newParam.type !== "select" ? (
                  <Input
                    placeholder="Unit (e.g. g/dL)"
                    className="text-xs h-8"
                    value={newParam.unit}
                    onChange={(e) =>
                      setNewParam((p) => ({ ...p, unit: e.target.value }))
                    }
                  />
                ) : (
                  <div className="h-8 flex items-center px-2 rounded-md bg-muted/40 text-xs text-muted-foreground/50 border border-border/50">
                    No unit for select
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Input Type *</Label>
                <Select
                  value={newParam.type}
                  onValueChange={(v) =>
                    setNewParam((p) => ({
                      ...emptyEditParam,
                      name: p.name,
                      unit: p.unit,
                      price: p.price,
                      type: v as ParamType,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric">
                      Numeric — number input with reference range
                    </SelectItem>
                    <SelectItem value="text">Text — free text input</SelectItem>
                    <SelectItem value="select">
                      Select — dropdown with predefined options
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newParam.type === "numeric" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">
                      Male range
                    </p>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Min"
                        type="number"
                        className="text-xs h-8"
                        value={newParam.refMaleMin}
                        onChange={(e) =>
                          setNewParam((p) => ({
                            ...p,
                            refMaleMin: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        className="text-xs h-8"
                        value={newParam.refMaleMax}
                        onChange={(e) =>
                          setNewParam((p) => ({
                            ...p,
                            refMaleMax: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">
                      Female range
                    </p>
                    <div className="flex gap-1">
                      <Input
                        placeholder="Min"
                        type="number"
                        className="text-xs h-8"
                        value={newParam.refFemaleMin}
                        onChange={(e) =>
                          setNewParam((p) => ({
                            ...p,
                            refFemaleMin: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        className="text-xs h-8"
                        value={newParam.refFemaleMax}
                        onChange={(e) =>
                          setNewParam((p) => ({
                            ...p,
                            refFemaleMax: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
              {newParam.type === "select" && (
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">
                    Options *{" "}
                    <span className="opacity-60">(comma-separated)</span>
                  </p>
                  <Input
                    placeholder="e.g. Positive, Negative"
                    className="text-xs h-8"
                    value={newParam.options}
                    onChange={(e) =>
                      setNewParam((p) => ({ ...p, options: e.target.value }))
                    }
                  />
                  {newParam.options && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {newParam.options
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean)
                        .map((opt) => (
                          <Badge
                            key={opt}
                            variant="outline"
                            className="text-[10px] px-1.5"
                          >
                            {opt}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Price (₦)</Label>
                  <Input
                    type="number"
                    min="0"
                    className="text-xs h-8"
                    value={newParam.price}
                    onChange={(e) =>
                      setNewParam((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs w-full"
                onClick={addParamToExistingTest}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Parameter
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Parameters on an existing test save immediately when added or
                removed.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleEditSave} className="gap-2">
            <Check className="w-4 h-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
