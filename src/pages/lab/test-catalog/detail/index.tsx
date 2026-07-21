import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSWRConfig } from "swr";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { TestCatalogEntry } from "@/api/types/test-catalog";
import { HeaderCard } from "./header-card";
import { MaterialsCard } from "./materials-card";
import { ParametersCard } from "./parameters-card";
import { EditTestDialog } from "./edit-test-dialog";

export default function TestCatalogDetail() {
  const { testId } = useParams<{ testId: string }>();
  const { mutate: globalMutate } = useSWRConfig();

  const url = testId ? endpoint.lab.testCatalog.get(testId) : null;
  const { data, isLoading } = useApi<TestCatalogEntry>(url);
  const test = data?.data;

  const [editOpen, setEditOpen] = useState(false);

  function refresh() {
    if (url) globalMutate(url);
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in max-w-[820px] mx-auto py-12 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="animate-fade-in max-w-[820px] mx-auto flex flex-col gap-[18px]">
      <p className="text-[13px] text-muted-foreground">
        Test Catalog{" "}
        <span className="mx-[6px] opacity-60">→</span>
        <span className="text-foreground font-semibold">{test.name}</span>
      </p>

      <HeaderCard test={test} onEdit={() => setEditOpen(true)} />
      <MaterialsCard test={test} onRefresh={refresh} />
      <ParametersCard test={test} onRefresh={refresh} />

      <EditTestDialog
        test={test}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => { setEditOpen(false); refresh(); }}
      />
    </div>
  );
}
