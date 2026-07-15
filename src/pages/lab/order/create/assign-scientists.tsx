import { useState } from "react";
import { ChevronRight, ChevronDown, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStaffSearch } from "@/hooks/use-staff";
import type { AssignScientistsSectionProps, AssigneeInfo } from "./types";

export function AssignScientistsSection({
  selectedTests,
  sampleChips,
  value,
  onChange,
}: AssignScientistsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);
  const [staffQuery, setStaffQuery] = useState("");

  const { staff, isLoading: isLoadingStaff } = useStaffSearch(staffQuery);
  const scientists = staff.filter(
    (s) => s.role === "scientist" || s.role === "manager",
  );

  // Assign section is disabled if no samples have been entered for any test
  const anySamplesEntered = selectedTests.some(
    (t) => (sampleChips[t.testCatalogId] ?? []).length > 0,
  );
  const isDisabled = !anySamplesEntered;

  function handleToggle() {
    if (isDisabled) return;
    setExpanded((v) => !v);
    setPickerOpenFor(null);
    setStaffQuery("");
  }

  function openPicker(testId: string) {
    setPickerOpenFor((prev) => (prev === testId ? null : testId));
    setStaffQuery("");
  }

  function selectScientist(testId: string, assignee: AssigneeInfo) {
    onChange({ ...value, [testId]: assignee });
    setPickerOpenFor(null);
    setStaffQuery("");
  }

  function clearAssignee(testId: string) {
    onChange({ ...value, [testId]: null });
  }

  return (
    <div className="border-t border-border pt-4">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isDisabled}
        title={
          isDisabled ? "Collect samples first to enable assignment" : undefined
        }
        className={`flex w-full items-center justify-between gap-3 text-left transition-opacity ${
          isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className="text-[13px] font-semibold">
          Assign scientists{" "}
          <span className="font-normal text-muted-foreground">
            — optional, can be done from order detail later
          </span>
        </span>
        {expanded && !isDisabled ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && !isDisabled && (
        <div className="mt-3 space-y-2">
          {selectedTests.map((test) => {
            const assignee = value[test.testCatalogId] ?? null;
            const pickerOpen = pickerOpenFor === test.testCatalogId;
            // Only show tests that have samples collected
            const hasSample = (sampleChips[test.testCatalogId] ?? []).length > 0;
            if (!hasSample) return null;

            return (
              <div
                key={test.testCatalogId}
                className="rounded-lg border border-border px-3 py-2.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold truncate">{test.testName}</p>

                  {assignee ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-primary">
                            {assignee.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[12.5px] font-semibold text-primary">
                          {assignee.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPicker(test.testCatalogId)}
                        className="text-[11.5px] font-semibold text-muted-foreground underline hover:text-foreground transition-colors"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => clearAssignee(test.testCatalogId)}
                        className="text-[11.5px] font-semibold text-destructive/70 underline hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 flex-shrink-0"
                      onClick={() => openPicker(test.testCatalogId)}
                    >
                      <Plus className="w-3 h-3" />
                      Assign
                    </Button>
                  )}
                </div>

                {/* Inline staff picker */}
                {pickerOpen && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="relative border-b border-border">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        autoFocus
                        className="h-8 border-0 rounded-none pl-8 text-xs focus-visible:ring-0"
                        placeholder="Search by name…"
                        value={staffQuery}
                        onChange={(e) => setStaffQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {isLoadingStaff && (
                        <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>
                      )}
                      {!isLoadingStaff && staffQuery.trim().length === 0 && (
                        <p className="px-3 py-2 text-xs text-muted-foreground">
                          Type a name to search…
                        </p>
                      )}
                      {!isLoadingStaff &&
                        staffQuery.trim().length > 0 &&
                        scientists.length === 0 && (
                          <p className="px-3 py-2 text-xs text-muted-foreground">
                            No scientists found.
                          </p>
                        )}
                      {scientists.map((s) => {
                        const name = `${s.user.firstName} ${s.user.lastName}`;
                        const isSelected = assignee?.id === s._id;
                        return (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() =>
                              selectScientist(test.testCatalogId, {
                                id: s._id,
                                name,
                              })
                            }
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted/30 ${
                              isSelected ? "bg-primary/8" : ""
                            }`}
                          >
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold text-primary">
                                {s.user.firstName[0]}
                                {s.user.lastName[0]}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{name}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">
                                {s.role}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-primary flex-shrink-0">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-border px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPickerOpenFor(null);
                          setStaffQuery("");
                        }}
                        className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
