import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { PatientListItem } from "@/api/types/patients";
import type { TestOrderPriority } from "@/api/types/test-order";
import type { PatientPrioritySectionProps } from "./types";

const PRIORITIES: { value: TestOrderPriority; label: string }[] = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
  { value: "stat", label: "STAT" },
];

function priorityStyle(value: TestOrderPriority, selected: boolean): string {
  const base =
    "flex-1 py-2 rounded-lg border text-xs font-bold transition-colors cursor-pointer";
  if (!selected) return `${base} border-border text-muted-foreground hover:bg-muted/30`;
  if (value === "stat")
    return `${base} bg-destructive/15 text-destructive border-destructive/50`;
  if (value === "urgent")
    return `${base} bg-warning/15 text-warning border-warning/50`;
  return `${base} bg-primary/10 text-primary border-primary/40`;
}

export function PatientPrioritySection({
  patient,
  priority,
  showPatientError,
  initialPatientId,
  initialPatientName,
  onPatientChange,
  onPriorityChange,
}: PatientPrioritySectionProps) {
  const [query, setQuery] = useState(initialPatientName ?? "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pre-select patient when deep-linked from patient profile
  useEffect(() => {
    if (initialPatientId && initialPatientName && !patient) {
      setQuery(initialPatientName);
    }
  }, [initialPatientId, initialPatientName]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchUrl = useMemo(() => {
    const q = query.trim();
    return q.length >= 2
      ? `${endpoint.lab.patients.search}?q=${encodeURIComponent(q)}`
      : null;
  }, [query]);

  const { data: searchData, isLoading } = useApi<PatientListItem[]>(searchUrl);
  const results = searchData?.data ?? [];

  function handleSelect(p: PatientListItem) {
    onPatientChange(p);
    setQuery(`${p.firstName} ${p.lastName}`);
    setDropdownOpen(false);
  }

  function handleClear() {
    onPatientChange(null);
    setQuery("");
    setDropdownOpen(false);
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (patient) onPatientChange(null);
    setDropdownOpen(true);
  }

  return (
    <div className="space-y-5">
      {/* ── Patient ─────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          Patient <span className="text-destructive">*</span>
        </label>

        {patient ? (
          /* Selected chip */
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-bold text-primary">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-none">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {patient.code}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear patient"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Search input + dropdown */
          <div ref={dropdownRef} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by patient name or code…"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => query.trim().length >= 2 && setDropdownOpen(true)}
              autoComplete="off"
            />
            {dropdownOpen && query.trim().length >= 2 && (
              <div className="absolute top-[42px] left-0 w-full z-20 rounded-lg border border-border bg-card shadow-lg max-h-44 overflow-y-auto">
                {isLoading && (
                  <p className="px-3 py-2.5 text-sm text-muted-foreground">Searching…</p>
                )}
                {!isLoading && results.length === 0 && (
                  <p className="px-3 py-2.5 text-sm text-muted-foreground">No patients found.</p>
                )}
                {results.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(p); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-[10px] font-bold text-primary">
                        {p.firstName[0]}{p.lastName[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">{p.code}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Validation */}
        {showPatientError && !patient && (
          <p className="flex items-center gap-1.5 text-[11.5px] text-destructive">
            <AlertCircle className="w-3 h-3" />
            Select a patient to continue.
          </p>
        )}

        {patient && (
          <p className="flex items-center gap-1.5 text-[11px] text-success">
            <CheckCircle2 className="w-3 h-3" />
            Patient selected
          </p>
        )}
      </div>

      {/* ── Priority ────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
          Priority
        </label>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onPriorityChange(p.value)}
              className={priorityStyle(p.value, priority === p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
