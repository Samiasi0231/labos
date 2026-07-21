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

<<<<<<< HEAD
  const debouncedSearch = useDebounce(search.trim(), 350);
  const listUrl = useMemo(
    () => staffListUrl(debouncedSearch),
    [debouncedSearch],
  );
=======
  const handleResend = async (id: string) => {
    await resend(id);
  };
  const handleEditRole = async (id: string, newRole: StaffRole) => {
    await updateRole(id, newRole);
  };
  const handleDeactivate = async (id: string) => {
    await updateStatus(id, "inactive");
  };
  const handleActivate = async (id: string) => {
    await updateStatus(id, "active");
  };
  const handleRemove = async (id: string) => {
    await remove(id);
  };

  const initials = (first: string, last: string) =>
    `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
>>>>>>> origin/main

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
