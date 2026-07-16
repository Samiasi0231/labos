import endpoint from "@/api/endpoints";
import type { StaffRole } from "@/api/types/enums";
import type { StaffMember } from "@/api/types/staff";

export const ROLE_LABELS: Record<StaffRole, string> = {
  manager: "Manager",
  scientist: "Lab Scientist",
  technician: "Technician",
  receptionist: "Receptionist",
};

export const ROLE_COLORS: Record<StaffRole, string> = {
  manager: "bg-primary/15 text-primary border-primary/30",
  scientist: "bg-success/15 text-success border-success/30",
  technician: "bg-warning/15 text-warning border-warning/30",
  receptionist: "bg-info/15 text-info border-info/30",
};

export const INVITEABLE_ROLES: StaffRole[] = ["scientist", "receptionist"];

export function staffListUrl(search?: string): string {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  const qs = params.toString();
  return qs ? `${endpoint.lab.staff.list}?${qs}` : endpoint.lab.staff.list;
}

export function staffCounts(staff: StaffMember[]) {
  return {
    active: staff.filter((s) => s.status === "active").length,
    pending: staff.filter((s) => s.status === "pending").length,
    inactive: staff.filter((s) => s.status === "inactive").length,
  };
}

export function staffFullName(member: StaffMember): string {
  return `${member.user.firstName} ${member.user.lastName}`.trim();
}
