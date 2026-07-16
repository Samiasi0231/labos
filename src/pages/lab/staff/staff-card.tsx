import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone } from "lucide-react";
import { StaffMembershipBadge } from "@/components/lab/StaffMembershipBadge";
import { StaffActionMenu } from "@/components/lab/StaffActionMenu";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  StaffMember,
  UpdateStaffRolePayload,
  UpdateStaffRoleResponse,
  UpdateStaffStatusPayload,
  UpdateStaffStatusResponse,
} from "@/api/types/staff";
import type { ResendPortalInvitePayload } from "@/api/types/lab";
import type { StaffRole, StaffStatus } from "@/api/types/enums";
import {
  ROLE_COLORS,
  ROLE_LABELS,
  staffFullName,
  staffInitials,
} from "./shared";

interface StaffCardProps {
  member: StaffMember;
  listUrl: string;
}

export function StaffCard({ member, listUrl }: StaffCardProps) {
  const updateRoleMutation = useMutation<
    UpdateStaffRoleResponse,
    UpdateStaffRolePayload
  >("staff/update-role", {
    method: "PATCH",
    successToast: "Role updated",
    invalidate: [listUrl],
  });

  const updateStatusMutation = useMutation<
    UpdateStaffStatusResponse,
    UpdateStaffStatusPayload
  >("staff/update-status", {
    method: "PATCH",
    successToast: "Status updated",
    invalidate: [listUrl],
  });

  const removeMutation = useMutation<unknown, void>("staff/remove", {
    method: "DELETE",
    successToast: "Staff member removed",
    invalidate: [listUrl],
  });

  const resendMutation = useMutation<unknown, ResendPortalInvitePayload>(
    endpoint.lab.resendInvite,
    { successToast: "Invite resent", invalidate: [listUrl] },
  );

  const handleResend = async (id: string) => {
    const res = await resendMutation.trigger({ type: "staff", identifier: id });
    return res?.data ?? null;
  };

  const handleEditRole = async (id: string, newRole: StaffRole) => {
    const res = await updateRoleMutation.trigger(
      { role: newRole },
      endpoint.lab.staff.updateRole(id),
    );
    return res?.data ?? null;
  };

  const handleDeactivate = async (id: string) => {
    const res = await updateStatusMutation.trigger(
      { status: "inactive" as StaffStatus },
      endpoint.lab.staff.updateStatus(id),
    );
    return res?.data ?? null;
  };

  const handleActivate = async (id: string) => {
    const res = await updateStatusMutation.trigger(
      { status: "active" as StaffStatus },
      endpoint.lab.staff.updateStatus(id),
    );
    return res?.data ?? null;
  };

  const handleRemove = async (id: string) => {
    const res = await removeMutation.trigger(
      undefined,
      endpoint.lab.staff.remove(id),
    );
    return res?.data ?? null;
  };

  const name = staffFullName(member);

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-200">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {staffInitials(member.user.firstName, member.user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{name}</p>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 border ${ROLE_COLORS[member.role]}`}
                >
                  {ROLE_LABELS[member.role]}
                </Badge>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <StaffMembershipBadge status={member.status} />
                <StaffActionMenu
                  id={member._id}
                  name={name}
                  role={member.role}
                  status={member.status}
                  onResend={handleResend}
                  onEditRole={handleEditRole}
                  onDeactivate={handleDeactivate}
                  onActivate={handleActivate}
                  onRemove={handleRemove}
                />
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                {member.user.email}
              </p>
              {member.user.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {member.user.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
