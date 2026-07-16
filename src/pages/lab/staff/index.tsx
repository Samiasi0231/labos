import { useCallback, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-api";
import type { StaffMember } from "@/api/types/staff";
import { StaffHeader } from "./staff-header";
import { StaffSearch } from "./staff-search";
import { StaffGrid } from "./staff-grid";
import { InviteDialog } from "./invite-dialog";
import { staffListUrl } from "./shared";

export default function Staff() {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const debouncedSearch = useDebounce(search.trim(), 350);
  const listUrl = useMemo(
    () => staffListUrl(debouncedSearch),
    [debouncedSearch],
  );

  const handleStaffChange = useCallback((next: StaffMember[]) => {
    setStaff(next);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <StaffHeader staff={staff} onAddClick={() => setInviteOpen(true)} />
      <StaffSearch value={search} onChange={setSearch} />
      <StaffGrid search={debouncedSearch} onStaffChange={handleStaffChange} />
      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        listUrl={listUrl}
      />
    </div>
  );
}
