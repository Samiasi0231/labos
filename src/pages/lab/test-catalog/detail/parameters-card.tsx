import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  TestCatalogEntry,
  TestCatalogParameter,
  UpdateParameterPayload,
} from "@/api/types/test-catalog";
import { ConfigureParamDialog } from "./configure-param-dialog";
import { BulkConfigureSheet } from "./bulk-configure-sheet";

interface Props {
  test: TestCatalogEntry;
  onRefresh: () => void;
}

function PriceCell({
  param,
  testId,
  onSaved,
}: {
  param: TestCatalogParameter;
  testId: string;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const save = useMutation<unknown, UpdateParameterPayload>(
    endpoint.lab.testCatalog.updateParameter(testId, param._id),
    { method: "PATCH", onSuccess: onSaved },
  );

  function startEdit() {
    setDraft(String(param.price ?? 0));
    setEditing(true);
  }

  function commit() {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) {
      save.trigger({ price: val });
    }
    setEditing(false);
  }

  const zeroPrice = (param.price ?? 0) === 0;

  if (editing) {
    return (
      <div className="relative w-[110px] flex-shrink-0">
        <span className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground pointer-events-none">
          ₦
        </span>
        <Input
          type="number"
          min="0"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-8 pl-[22px] w-full text-[13px]"
        />
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className={cn(
        "w-[110px] flex-shrink-0 text-right text-[13px] font-bold rounded-[6px] px-[10px] py-[5px] border-none cursor-pointer transition-colors",
        zeroPrice
          ? "bg-warning/12 text-warning"
          : "bg-transparent text-foreground hover:bg-muted/40",
      )}
    >
      {zeroPrice ? "₦0 — Set price" : `₦${(param.price ?? 0).toLocaleString()}`}
    </button>
  );
}

export function ParametersCard({ test, onRefresh }: Props) {
  const [configureParam, setConfigureParam] = useState<TestCatalogParameter | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const removeParam = useMutation(
    // Stable key — URL supplied dynamically per call
    endpoint.lab.testCatalog.list,
    { method: "DELETE", successToast: "Parameter removed", onSuccess: onRefresh },
  );

  function handleRemove(paramId: string) {
    removeParam.trigger(
      undefined,
      endpoint.lab.testCatalog.removeParameter(test._id, paramId),
    );
  }

  function openSingleFromBulk(param: TestCatalogParameter) {
    setBulkOpen(false);
    setConfigureParam(param);
  }

  return (
    <>
      <Card className="shadow-card overflow-hidden p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-[14px] font-semibold">Parameters</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setBulkOpen(true)}
            >
              <SlidersHorizontal className="w-[14px] h-[14px]" />
              Configure All Parameters
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="w-[14px] h-[14px]" />
              Add Parameter
            </Button>
          </div>
        </div>

        <div className="flex flex-col">
          {test.parameters.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-8">
              No parameters configured.
            </p>
          ) : (
            test.parameters.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold">{p.name}</p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    {[p.type, p.unit].filter(Boolean).join(" · ")}
                  </p>
                </div>

                <PriceCell param={p} testId={test._id} onSaved={onRefresh} />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-[30px] w-[30px] flex-shrink-0"
                  onClick={() => setConfigureParam(p)}
                >
                  <Pencil className="w-[13px] h-[13px]" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-[30px] w-[30px] flex-shrink-0 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(p._id)}
                >
                  <Trash2 className="w-[13px] h-[13px]" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Add new parameter */}
      <ConfigureParamDialog
        testId={test._id}
        param={null}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => { setAddOpen(false); onRefresh(); }}
      />

      {/* Edit existing parameter */}
      <ConfigureParamDialog
        testId={test._id}
        param={configureParam}
        open={!!configureParam}
        onClose={() => setConfigureParam(null)}
        onSuccess={() => { setConfigureParam(null); onRefresh(); }}
      />

      <BulkConfigureSheet
        test={test}
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onExpand={openSingleFromBulk}
        onSaved={onRefresh}
      />
    </>
  );
}
