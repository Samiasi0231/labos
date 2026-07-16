import { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronDown, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { TestCatalogListResponse } from "@/api/types/test-catalog";
import type { TestSelectionSectionProps, StagedItem } from "./types";

export function TestSelectionSection({
  selectedTests,
  showTestsError,
  onTestsChange,
}: TestSelectionSectionProps) {
  const [catalogQuery, setCatalogQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // testCatalogId → Set of selected parameterIds
  const [paramSel, setParamSel] = useState<Record<string, Set<string>>>({});

  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("isActive", "true");
    params.set("page", "1");
    params.set("limit", "100");
    return `${endpoint.lab.testCatalog.list}?${params.toString()}`;
  }, []);

  const { data, isLoading } = useApi<TestCatalogListResponse>(listUrl);
  const catalog = data?.data?.docs ?? [];

  const selectedIds = useMemo(() => new Set(selectedTests.map((t) => t.testCatalogId)), [selectedTests]);

  const filtered = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    return q ? catalog.filter((t) => t.name.toLowerCase().includes(q)) : catalog;
  }, [catalog, catalogQuery]);

  const grandTotal = useMemo(
    () => selectedTests.reduce((s, t) => s + t.subtotal, 0),
    [selectedTests],
  );

  function toggleExpand(testId: string) {
    if (selectedIds.has(testId)) return;
    setExpandedId((prev) => (prev === testId ? null : testId));
    // Auto-check all params on first expand
    setParamSel((prev) => {
      if (prev[testId]) return prev;
      const test = catalog.find((t) => t._id === testId);
      if (!test) return prev;
      return { ...prev, [testId]: new Set(test.parameters.map((p) => p._id)) };
    });
  }

  function toggleParam(testId: string, paramId: string) {
    setParamSel((prev) => {
      const s = new Set(prev[testId] ?? []);
      if (s.has(paramId)) s.delete(paramId);
      else s.add(paramId);
      return { ...prev, [testId]: s };
    });
  }

  function addToOrder(testId: string) {
    const test = catalog.find((t) => t._id === testId);
    if (!test) return;
    const ids = [...(paramSel[testId] ?? [])];
    if (ids.length === 0) return;
    const selectedParams = test.parameters.filter((p) => ids.includes(p._id));
    const newItem: StagedItem = {
      testCatalogId: test._id,
      testName: test.name,
      sampleHint: test.samples?.join(", ") ?? "",
      parameterIds: ids,
      paramNames: selectedParams.map((p) => p.name),
      subtotal: selectedParams.reduce((s, p) => s + (p.price ?? 0), 0),
    };
    onTestsChange([...selectedTests, newItem]);
    setExpandedId(null);
  }

  function removeTest(testCatalogId: string) {
    onTestsChange(selectedTests.filter((t) => t.testCatalogId !== testCatalogId));
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          Tests <span className="text-destructive">*</span>
        </label>
        {showTestsError && selectedTests.length === 0 && (
          <span className="flex items-center gap-1 text-[11px] text-destructive">
            <AlertCircle className="w-3 h-3" />
            Add at least one test
          </span>
        )}
      </div>

      {/* Catalog search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search test catalog…"
          value={catalogQuery}
          onChange={(e) => setCatalogQuery(e.target.value)}
        />
      </div>

      {/* Catalog list */}
      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto rounded-lg border border-border p-1.5">
        {isLoading && (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading catalog…</p>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No tests found.</p>
        )}
        {filtered.map((test) => {
          const added = selectedIds.has(test._id);
          const expanded = expandedId === test._id && !added;
          const sel = paramSel[test._id] ?? new Set();
          const priceMin = Math.min(...test.parameters.map((p) => p.price ?? 0));
          const priceMax = Math.max(...test.parameters.map((p) => p.price ?? 0));
          const priceRange =
            priceMin === priceMax
              ? `₦${priceMin.toLocaleString()}`
              : `₦${priceMin.toLocaleString()} – ₦${priceMax.toLocaleString()}`;

          return (
            <div
              key={test._id}
              className={`rounded-md border transition-colors ${
                expanded
                  ? "border-primary/30 bg-primary/[0.02]"
                  : "border-transparent"
              } ${added ? "opacity-50" : ""}`}
            >
              {/* Row header */}
              <button
                type="button"
                disabled={added}
                onClick={() => toggleExpand(test._id)}
                className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left disabled:cursor-not-allowed"
              >
                {expanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{test.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {test.category} · {priceRange}
                  </p>
                </div>
                {added && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-success flex-shrink-0">
                    ✓ Added
                  </span>
                )}
              </button>

              {/* Expanded params */}
              {expanded && (
                <div className="px-3 pb-3 pt-0.5 space-y-2">
                  <div className="space-y-1.5">
                    {test.parameters.map((param) => (
                      <label
                        key={param._id}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        <Checkbox
                          id={`${test._id}-${param._id}`}
                          checked={sel.has(param._id)}
                          onCheckedChange={() => toggleParam(test._id, param._id)}
                        />
                        <span className="flex flex-1 items-center justify-between text-[12.5px]">
                          <span>
                            {param.name}
                            {param.unit && (
                              <span className="text-muted-foreground"> ({param.unit})</span>
                            )}
                          </span>
                          <span className="ml-3 font-medium text-primary text-xs">
                            ₦{(param.price ?? 0).toLocaleString()}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-end border-t border-border/50 pt-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1"
                      disabled={sel.size === 0}
                      title={sel.size === 0 ? "Select at least one parameter" : undefined}
                      onClick={() => addToOrder(test._id)}
                    >
                      Add to Order
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected tests summary */}
      {selectedTests.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden mt-2">
          {selectedTests.map((item) => (
            <div
              key={item.testCatalogId}
              className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-border last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate">{item.testName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {item.parameterIds.length} parameter{item.parameterIds.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="text-[13px] font-bold">
                  ₦{item.subtotal.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => removeTest(item.testCatalogId)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${item.testName}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {/* Grand total row */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30">
            <span className="text-[13px] font-bold">Total</span>
            <span className="text-sm font-bold">₦{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
