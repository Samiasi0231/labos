import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import type { StaffListResponse, StaffMember } from "@/api/types/staff";
import { StaffCard } from "./staff-card";
import { staffListUrl } from "./shared";

interface StaffGridProps {
  search: string;
  onStaffChange: (staff: StaffMember[]) => void;
}

export function StaffGrid({ search, onStaffChange }: StaffGridProps) {
  const listUrl = useMemo(() => staffListUrl(search), [search]);

  const { data, isLoading } = useApi<StaffListResponse>(listUrl);
  const staff = data?.data?.docs ?? [];

  useEffect(() => {
    onStaffChange(data?.data?.docs ?? []);
  }, [data, onStaffChange]);

  if (isLoading) {
    return (
      <Card className="shadow-card py-12 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading staff…</p>
      </Card>
    );
  }

  if (staff.length === 0) {
    return (
      <Card className="shadow-card py-12 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No staff members found.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {staff.map((member) => (
        <StaffCard key={member._id} member={member} listUrl={listUrl} />
      ))}
    </div>
  );
}
