import { useState } from "react";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { AddNotesSectionProps } from "./types";

export function AddNotesSection({ value, onChange }: AddNotesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  function handleBlur() {
    if (!value.trim()) setExpanded(false);
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:opacity-80 transition-opacity"
      >
        <Plus className="w-3.5 h-3.5" />
        Add notes
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
        Notes
      </label>
      <Textarea
        autoFocus
        placeholder="Add any context for this order…"
        className="min-h-[64px] resize-none text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
      />
    </div>
  );
}
