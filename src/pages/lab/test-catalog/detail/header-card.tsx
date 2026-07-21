import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { unslugify } from "@/lib/utils";
import type { TestCatalogEntry } from "@/api/types/test-catalog";

interface Props {
  test: TestCatalogEntry;
  onEdit: () => void;
}

export function HeaderCard({ test, onEdit }: Props) {
  return (
    <Card className="shadow-card">
      <CardContent className="px-[22px] py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-[10px] flex-wrap">
              <h1 className="text-[18px] font-bold leading-tight">{test.name}</h1>
              <span className="text-[12px] font-mono text-muted-foreground">{test.code}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="inline-flex items-center rounded-full px-[10px] py-[2px] text-[11px] font-semibold border bg-primary/15 text-primary border-primary/30">
                {unslugify(test.category)}
              </span>
              {(test.samples ?? []).length > 0 && (
                <span className="text-[12.5px] text-muted-foreground">
                  {test.samples.join(", ")}
                </span>
              )}
              <span className="text-[12.5px] text-muted-foreground">
                Turnaround: {test.turnaroundTime} hrs
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 gap-1.5"
            onClick={onEdit}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
