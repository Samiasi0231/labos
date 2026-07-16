import { useState, useMemo, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  CheckCircle2,
  SearchX,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { TestCatalogPreset, InventoryPreset, ImportPresetsPayload } from "@/api/types/presets";

// ── Types ──────────────────────────────────────────────────────────────────────

export type PresetLibraryType = "testCatalog" | "inventory";

export interface PresetLibrarySheetProps {
  type: PresetLibraryType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Category pill ──────────────────────────────────────────────────────────────

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30 whitespace-nowrap">
      {label}
    </span>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="border border-border rounded-lg p-3.5">
      <div className="h-3.5 w-3/5 bg-muted rounded animate-pulse mb-2" />
      <div className="h-3 w-2/5 bg-muted rounded animate-pulse" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function PresetLibrarySheet({ type, open, onOpenChange }: PresetLibrarySheetProps) {
  const isCatalog = type === "testCatalog";

  // ── Fetch presets ────────────────────────────────────────────────────────────
  const presetsUrl = isCatalog
    ? endpoint.lab.testCatalog.listPresets
    : endpoint.lab.inventory.listPresets;

  const { data: presetsRes, isLoading: presetsLoading } = useApi<
    TestCatalogPreset[] | InventoryPreset[]
  >(open ? presetsUrl : null);

  const allPresets = (presetsRes?.data ?? []) as (TestCatalogPreset | InventoryPreset)[];

  // ── Import mutation ──────────────────────────────────────────────────────────
  const importUrl = isCatalog
    ? endpoint.lab.testCatalog.importPresets
    : endpoint.lab.inventory.importPresets;

  const invalidateUrl = isCatalog
    ? endpoint.lab.testCatalog.list
    : endpoint.lab.inventory.list;

  const { trigger: triggerImport, isLoading: importing } = useMutation<null, ImportPresetsPayload>(
    importUrl,
    { successToast: "Presets imported", invalidate: [invalidateUrl, presetsUrl] },
  );

  // ── Local state ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [importError, setImportError] = useState("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setCategoryFilter("all");
      setSelectedIds([]);
      setImportError("");
    }
  }, [open]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const categoryOptions = useMemo(
    () => [...new Set(allPresets.map((p) => p.category))].sort(),
    [allPresets],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allPresets.filter((p) => {
      const code = isCatalog ? (p as TestCatalogPreset).code : (p as InventoryPreset).sku;
      const matchesQ =
        !q || p.name.toLowerCase().includes(q) || code.toLowerCase().includes(q);
      const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchesQ && matchesCat;
    });
  }, [allPresets, search, categoryFilter, isCatalog]);

  const selectableCount = allPresets.filter((p) => !p.alreadyImported).length;
  const allImported = !presetsLoading && allPresets.length > 0 && selectableCount === 0;
  const noSearchResults = !presetsLoading && filtered.length === 0 && !allImported;
  const showRows = !presetsLoading && filtered.length > 0;

  const toggle = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleImport = async () => {
    if (selectedIds.length === 0 || importing) return;
    setImportError("");
    const res = await triggerImport({ ids: selectedIds });
    if (!res) {
      setImportError("Something went wrong while importing presets. Please try again.");
      return;
    }
    onOpenChange(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <SheetContent
        className="sm:max-w-[560px] w-full p-0 flex flex-col gap-0"
        style={{ height: "100vh" }}
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <SheetTitle className="text-[18px] font-semibold">Preset Library</SheetTitle>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {isCatalog ? "Test Catalog" : "Inventory"}
          </p>
        </SheetHeader>

        {/* Search + filter */}
        <div className="px-6 flex-shrink-0 flex gap-2.5 mb-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={isCatalog ? "Search by name, code…" : "Search by name, SKU…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[170px] flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection counter — fixed height to avoid layout shift */}
        <div className="px-6 h-[26px] flex-shrink-0 flex items-center mb-2">
          {selectedIds.length > 0 && (
            <p className="text-[12.5px] font-semibold text-primary">
              {selectedIds.length} selected
            </p>
          )}
        </div>

        {/* Scrollable preset list */}
        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-2.5 pb-2 pr-[22px]">

          {/* Loading skeletons */}
          {presetsLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* No search results */}
          {noSearchResults && (
            <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
              <SearchX className="w-7 h-7" />
              <p className="text-[13.5px]">No presets match your search</p>
            </div>
          )}

          {/* All already imported */}
          {allImported && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
              <CheckCircle2 className="w-7 h-7 text-success" />
              <p className="text-[13.5px]">You've already imported everything available</p>
            </div>
          )}

          {/* Preset cards */}
          {showRows &&
            filtered.map((preset) => {
              const code = isCatalog
                ? (preset as TestCatalogPreset).code
                : (preset as InventoryPreset).sku;
              const checked = selectedIds.includes(preset.id);

              // Meta chips per type
              const metaChips = isCatalog
                ? [
                    `⏱ ${(preset as TestCatalogPreset).turnaroundTime} hrs`,
                    `🧪 ${(preset as TestCatalogPreset).parameterCount} parameters`,
                  ]
                : [
                    (preset as InventoryPreset).unit,
                    `Reorder ${(preset as InventoryPreset).reorderLevel}`,
                    `₦${(preset as InventoryPreset).unitCost.toLocaleString()}`,
                    ...((preset as InventoryPreset).supplier
                      ? [(preset as InventoryPreset).supplier!]
                      : []),
                  ];

              // Sample tags (catalog only)
              const tags = isCatalog ? ((preset as TestCatalogPreset).samples ?? []) : [];

              return (
                <div
                  key={preset.id}
                  style={{
                    opacity: preset.alreadyImported ? 0.55 : 1,
                    background: preset.alreadyImported
                      ? "hsl(var(--muted) / 0.2)"
                      : "hsl(var(--card))",
                  }}
                  className="flex gap-3 items-start border border-border rounded-lg px-4 py-3.5"
                >
                  {/* Left: Added badge or Checkbox */}
                  {preset.alreadyImported ? (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-success bg-success/12 border border-success/30 rounded-full px-2 py-[2px] flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                      Added
                    </span>
                  ) : (
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(preset.id)}
                      className="mt-0.5 flex-shrink-0"
                    />
                  )}

                  {/* Right: content */}
                  <div className="flex-1 min-w-0">
                    {/* Name + code */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-[14px] font-bold">{preset.name}</p>
                      <span className="text-[11px] font-mono text-muted-foreground">{code}</span>
                    </div>

                    {/* Category pill + meta chips */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <CategoryPill label={preset.category} />
                      {metaChips.map((chip, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/50 rounded-full px-2.5 py-[2px]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    {/* Sample tags (catalog only) */}
                    {tags.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10.5px] font-semibold text-muted-foreground border border-border rounded-[5px] px-1.5 py-[1px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Error banner */}
        {importError && (
          <div className="mx-6 mt-3 flex-shrink-0 flex gap-2 items-start px-3.5 py-2.5 bg-destructive/[0.08] border border-destructive/25 rounded-lg">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-destructive">{importError}</p>
          </div>
        )}

        {/* Sticky footer */}
        <div className="px-6 py-4 mt-3.5 border-t border-border flex-shrink-0 flex items-center justify-between gap-3">
          <p className="text-[12.5px] text-muted-foreground">
            {selectedIds.length} of {selectableCount} selected
          </p>
          <div className="flex items-center gap-3.5">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={selectedIds.length === 0 || importing}
              onClick={handleImport}
              className="gap-1.5"
            >
              {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {importing ? "Importing…" : "Import Selected"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
