import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { TestCatalogEntry, UpdateTestCatalogPayload } from "@/api/types/test-catalog";

interface Props {
  test: TestCatalogEntry;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LBL =
  "block text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-[5px]";

export function EditTestDialog({ test, open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    sampleType: "",
    turnaround: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: test.name,
        category: test.category,
        sampleType: (test.samples ?? []).join(", "),
        turnaround: String(test.turnaroundTime),
      });
    }
  }, [open, test]);

  const save = useMutation<TestCatalogEntry, UpdateTestCatalogPayload>(
    endpoint.lab.testCatalog.update(test._id),
    { method: "PATCH", successToast: "Test updated", onSuccess },
  );

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSave() {
    save.trigger({
      name: form.name,
      category: form.category,
      turnaroundTime: parseFloat(form.turnaround) || 0,
      samples: form.sampleType
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold">Edit Test</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-[14px]">
          <div>
            <label className={LBL}>Test Name</label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-[14px]">
            <div>
              <label className={LBL}>Test Code</label>
              <Input
                value={test.code}
                readOnly
                className="w-full font-mono opacity-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className={LBL}>Category</label>
              <Input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className={LBL}>Sample Type</label>
            <Input
              placeholder="e.g. Whole Blood, Urine"
              value={form.sampleType}
              onChange={(e) => set("sampleType", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="max-w-[180px]">
            <label className={LBL}>Turnaround Time (hrs)</label>
            <Input
              type="number"
              min="0"
              value={form.turnaround}
              onChange={(e) => set("turnaround", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-[14px]">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={save.isLoading} onClick={handleSave}>
              {save.isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
