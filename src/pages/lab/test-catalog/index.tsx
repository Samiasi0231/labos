import { useState, useMemo } from "react";
import { useSWRConfig } from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  MoreHorizontal,
  TestTube,
  Library,
} from "lucide-react";
import { PresetLibrarySheet } from "@/components/lab/PresetLibrarySheet";
import { useApi, useMutation } from "@/hooks/use-api";
import { unslugify } from "@/lib/utils";
import type { TestCatalogEntry, ReferenceRange, TestCatalogListResponse } from "@/api/types/test-catalog";
import endpoint from "@/api/endpoints";
import { AddWizard } from "./add-wizard";
import { EditDialog } from "./edit-dialog";
import { DeleteDialog } from "./delete-dialog";

function formatRefRange(range?: ReferenceRange, key: "male" | "female" = "male") {
  const v = range?.[key] || range?.general;
  if (!v) return "—";
  return `${v.min}–${v.max}`;
}

export default function TestCatalog() {
  const { mutate } = useSWRConfig();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (catFilter !== "All") params.set("category", catFilter);
    params.set("page", "1");
    params.set("limit", "100");
    return `${endpoint.lab.testCatalog.list}?${params.toString()}`;
  }, [search, catFilter]);

  const { data, isLoading } = useApi<TestCatalogListResponse>(listUrl);
  const tests = data?.data?.docs ?? [];

  const { trigger: triggerUpdateStatus } = useMutation<
    TestCatalogEntry,
    { isActive: boolean }
  >("test-catalog/update-status", {
    method: "PATCH",
    successToast: "Test status updated",
    invalidate: [],
  });

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [presetOpen, setPresetOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TestCatalogEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestCatalogEntry | null>(null);

  const categoriesInUse = useMemo(() => {
    const set = new Set(tests.map((t) => t.category));
    return Array.from(set);
  }, [tests]);

  const avgParams =
    tests.length > 0
      ? Math.round(
          tests.reduce((s, t) => s + t.parameters.length, 0) / tests.length,
        )
      : 0;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const handleToggleActive = async (t: TestCatalogEntry) => {
    const res = await triggerUpdateStatus(
      { isActive: !t.isActive },
      endpoint.lab.testCatalog.updateStatus(t._id),
    );
    if (!res) return;
    mutate(
      (key: unknown) =>
        typeof key === "string" &&
        key.startsWith(endpoint.lab.testCatalog.list),
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Test Catalog</h2>
        <p className="text-sm text-muted-foreground">
          View and manage your laboratory test offering with reference parameters
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-primary">{tests.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Tests</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-success">
            {tests.filter((t) => t.isActive).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Active Tests</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold">{categoriesInUse.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Categories</p>
        </Card>
        <Card className="shadow-card p-4">
          <p className="text-2xl font-bold text-info">{avgParams}</p>
          <p className="text-xs text-muted-foreground mt-1">Avg Parameters</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search test name or code..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categoriesInUse.map((c) => (
              <SelectItem key={c} value={c}>
                {unslugify(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="gap-2 flex-shrink-0"
          onClick={() => setPresetOpen(true)}
        >
          <Library className="w-4 h-4" />
          Import Presets
        </Button>
        <Button
          className="gap-2 flex-shrink-0"
          onClick={() => setWizardOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Test
        </Button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "All", slug: "All", count: tests.length },
          ...categoriesInUse.map((c) => ({
            label: unslugify(c),
            slug: c,
            count: tests.filter((t) => t.category === c).length,
          })),
        ].map(({ label, slug, count }) => (
          <button
            key={slug}
            onClick={() => setCatFilter(slug)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
              catFilter === slug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
            }`}
          >
            {label}{" "}
            <span
              className={`text-[10px] ${catFilter === slug ? "opacity-70" : "opacity-60"}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Test Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (₦)</TableHead>
              <TableHead>Parameters</TableHead>
              <TableHead>TAT</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-4 hidden lg:table-cell">
                Source
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  Loading catalog…
                </TableCell>
              </TableRow>
            ) : tests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  No tests found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <>
                  <TableRow
                    key={test._id}
                    className="cursor-pointer hover:bg-muted/20"
                    onClick={() => toggleExpand(test._id)}
                  >
                    <TableCell className="py-3">
                      {expanded.has(test._id) ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-medium text-sm">{test.name}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        {test.code}
                      </code>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className="text-xs">
                        {unslugify(test.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-sm">
                      ₦
                      {test.parameters
                        .reduce((sum, p) => sum + (p.price ?? 0), 0)
                        .toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {test.parameters.length} params
                    </TableCell>
                    <TableCell className="py-3 text-sm text-muted-foreground">
                      {test.turnaroundTime}h
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${test.isActive ? "border-success/30 text-success" : "border-muted text-muted-foreground"}`}
                      >
                        {test.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right pr-4 text-xs text-muted-foreground hidden lg:table-cell">
                      {test.presetId ? "Preset" : "Manual"}
                    </TableCell>
                    <TableCell
                      className="py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => setEditTarget(test)}
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleToggleActive(test)}
                          >
                            {test.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => setDeleteTarget(test)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expanded.has(test._id) && (
                    <TableRow
                      key={`${test._id}-params`}
                      className="bg-muted/10"
                    >
                      <TableCell colSpan={10} className="pb-4 pt-2 px-6">
                        <div className="flex items-center gap-6 mb-3 flex-wrap">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Reference Parameters & Pricing
                          </p>
                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                            <TestTube className="w-3 h-3 text-primary/70" />
                            <span className="font-medium text-foreground">
                              {(test.samples ?? []).join(", ")}
                            </span>
                          </span>
                        </div>
                        {test.parameters.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-4 text-center">
                            No parameters added yet.
                          </p>
                        ) : (
                          <div className="border border-border rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 bg-muted/40 px-3 py-2 text-xs font-semibold text-muted-foreground">
                              <span className="col-span-3">Parameter</span>
                              <span className="col-span-1">Type</span>
                              <span className="col-span-1">Unit</span>
                              <span className="col-span-3">Male Ref.</span>
                              <span className="col-span-3">Female Ref.</span>
                              <span className="col-span-1 text-right">
                                Price (₦)
                              </span>
                            </div>
                            <div className="divide-y divide-border">
                              {test.parameters.map((p) => (
                                <div
                                  key={p._id}
                                  className="grid grid-cols-12 px-3 py-2 text-xs hover:bg-muted/10 items-center"
                                >
                                  <span className="col-span-3 font-medium">
                                    {p.name}
                                  </span>
                                  <span className="col-span-1">
                                    <Badge
                                      variant="outline"
                                      className={`text-[9px] px-1 h-4 ${p.type === "numeric" ? "border-info/40 text-info" : p.type === "select" ? "border-accent/40 text-accent" : "border-muted text-muted-foreground"}`}
                                    >
                                      {p.type}
                                    </Badge>
                                  </span>
                                  <span className="col-span-1 text-muted-foreground font-mono">
                                    {p.unit || "—"}
                                  </span>
                                  <span className="col-span-3 text-muted-foreground">
                                    {p.type === "select" && p.options?.length
                                      ? p.options.join(", ")
                                      : formatRefRange(
                                          p.referenceRange,
                                          "male",
                                        )}
                                  </span>
                                  <span className="col-span-3 text-muted-foreground">
                                    {p.type === "select"
                                      ? "—"
                                      : formatRefRange(
                                          p.referenceRange,
                                          "female",
                                        )}
                                  </span>
                                  <span className="col-span-1 text-right font-medium text-primary">
                                    ₦{(p.price ?? 0).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AddWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      <EditDialog target={editTarget} onClose={() => setEditTarget(null)} />
      <DeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} />

      <PresetLibrarySheet
        type="testCatalog"
        open={presetOpen}
        onOpenChange={setPresetOpen}
      />
    </div>
  );
}
