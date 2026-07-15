import { useState } from "react";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CollectSamplesSectionProps } from "./types";

export function CollectSamplesSection({
  selectedTests,
  value,
  onChange,
}: CollectSamplesSectionProps) {
  const [expanded, setExpanded] = useState(false);
  // In-progress draft per test (before the user presses Enter)
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function setDraft(testId: string, v: string) {
    setDrafts((prev) => ({ ...prev, [testId]: v }));
  }

  function addChip(testId: string) {
    const draft = (drafts[testId] ?? "").trim();
    if (!draft) return;
    const existing = value[testId] ?? [];
    if (!existing.includes(draft)) {
      onChange({ ...value, [testId]: [...existing, draft] });
    }
    setDraft(testId, "");
  }

  function removeChip(testId: string, idx: number) {
    const existing = value[testId] ?? [];
    onChange({ ...value, [testId]: existing.filter((_, i) => i !== idx) });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, testId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      addChip(testId);
    }
  }

  return (
    <div className="border-t border-border pt-4">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[13px] font-semibold">
          Collect samples now{" "}
          <span className="font-normal text-muted-foreground">
            — optional, can be done from order detail later
          </span>
        </span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2.5">
          {selectedTests.length === 0 && (
            <p className="text-[12px] text-muted-foreground">
              Add tests above to record samples for them.
            </p>
          )}

          {selectedTests.map((test) => {
            const chips = value[test.testCatalogId] ?? [];
            const draft = drafts[test.testCatalogId] ?? "";

            return (
              <div
                key={test.testCatalogId}
                className="rounded-lg border border-border px-3 py-2.5 space-y-2"
              >
                <p className="text-[12.5px] font-bold">{test.testName}</p>

                <Input
                  className="h-8 text-xs"
                  placeholder={
                    test.sampleHint
                      ? `${test.sampleHint} (press Enter to add)`
                      : "Type a sample and press Enter to add"
                  }
                  value={draft}
                  onChange={(e) => setDraft(test.testCatalogId, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, test.testCatalogId)}
                  onBlur={() => addChip(test.testCatalogId)}
                />

                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {chips.map((chip, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium"
                      >
                        {chip}
                        <button
                          type="button"
                          onClick={() => removeChip(test.testCatalogId, idx)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={`Remove ${chip}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
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
