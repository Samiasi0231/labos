import { useRef, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/hooks/use-api";
import type { SearchResourceType, SearchHit } from "@/api/types/search";

interface BaseProps {
  types: SearchResourceType[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: SearchHit | null;
  onSelect: (hit: SearchHit) => void;
  onClear: () => void;
}

interface MultiProps extends BaseProps {
  multiple: true;
  values: SearchHit[];
  onSelect: (hit: SearchHit) => void;
  onRemove: (id: string) => void;
}

type GlobalSearchSelectProps = SingleProps | MultiProps;

export function GlobalSearchSelect(props: GlobalSearchSelectProps) {
  const {
    types,
    placeholder = "Search…",
    emptyMessage = "No results found",
    className,
  } = props;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, hasQuery } = useGlobalSearch(query, types);

  // Flatten hits across the requested types
  const allHits: SearchHit[] = types.flatMap(
    (t) => results?.groups?.[t] ?? []
  );

  // In multi mode, hide already-selected hits
  const visibleHits =
    props.multiple
      ? allHits.filter((h) => !props.values.find((v) => v.id === h.id))
      : allHits;

  // Close on click-outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (hit: SearchHit) => {
    props.onSelect(hit);
    setQuery("");
    setOpen(false);
  };

  const showDropdown = open && hasQuery;

  // ── Single mode: show pill when value is selected ───────────────────────────
  if (!props.multiple && props.value) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 h-9 px-3 border border-border rounded-md bg-muted/40 text-sm">
          <span className="flex-1 font-medium truncate">{props.value.title}</span>
          {props.value.subtitle && (
            <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
              {props.value.subtitle}
            </span>
          )}
          <button
            type="button"
            onClick={props.onClear}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`} ref={containerRef}>
      {/* Multi mode: selected pills row */}
      {props.multiple && props.values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {props.values.map((v) => (
            <span
              key={v.id}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full pl-2.5 pr-1.5 py-0.5"
            >
              {v.title}
              <button
                type="button"
                onClick={() => props.onRemove(v.id)}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          className="pl-9"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 w-full bg-popover border border-border rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
          {isLoading ? (
            /* Skeleton rows */
            <div className="p-2 flex flex-col gap-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2.5 px-1 py-2">
                  <div className="w-6 h-6 rounded bg-muted animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-[65%] rounded bg-muted animate-pulse" />
                    <div className="h-2.5 w-[40%] rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleHits.length === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-4 text-center">
              {emptyMessage}
            </p>
          ) : (
            visibleHits.map((hit) => (
              <button
                key={hit.id}
                type="button"
                className="w-full text-left flex flex-col px-3 py-2.5 hover:bg-muted/50 transition-colors"
                onMouseDown={(e) => {
                  // mousedown fires before blur so we can capture the click
                  e.preventDefault();
                  handleSelect(hit);
                }}
              >
                <span className="text-sm font-semibold text-foreground leading-snug">
                  {hit.title}
                </span>
                {hit.subtitle && (
                  <span className="text-xs font-mono text-muted-foreground leading-snug">
                    {hit.subtitle}
                  </span>
                )}
                {hit.meta && (
                  <span className="text-xs text-muted-foreground/70 leading-snug">
                    {hit.meta}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
