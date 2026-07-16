import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { StaffMember } from "@/api/types/staff";
import { staffCounts } from "./shared";

interface StaffHeaderProps {
  staff: StaffMember[];
  onAddClick: () => void;
}

export function StaffHeader({ staff, onAddClick }: StaffHeaderProps) {
  const { active, pending, inactive } = staffCounts(staff);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">Staff Management</h2>
        <p className="text-sm text-muted-foreground">
          {active} active · {pending} pending · {inactive} inactive
        </p>
      </div>
      <Button className="gap-2" onClick={onAddClick}>
        <Plus className="w-4 h-4" />
        Add Staff
      </Button>
    </div>
  );
}
