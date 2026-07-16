import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCog, Pause, Play, Mail, UserX, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  staffDetailName,
  staffDetailInitials,
} from "./shared";
import type { StaffDetail } from "./shared";
import { ChangeRoleDialog, RemoveDialog } from "./actions";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { StaffStatus } from "@/api/types/enums";

interface Props {
  staff: StaffDetail;
  onRoleChanged: () => void;
  onStatusChanged: () => void;
  onRemoved: () => void;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StaffIdentityCard({ staff, onRoleChanged, onStatusChanged, onRemoved }: Props) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  const isManager = staff.role === "manager";
  const isActive = staff.status === "active";
  const isPending = staff.status === "pending";

  const updateStatus = useMutation<unknown, { status: StaffStatus }>(
    endpoint.lab.staff.updateStatus(staff._id),
    {
      method: "PATCH",
      successToast: isActive ? "Staff member deactivated" : "Staff member activated",
      onSuccess: () => {
        setStatusConfirmOpen(false);
        onStatusChanged();
      },
    },
  );

  const resendInvite = useMutation<unknown, { type: string; identifier: string }>(
    endpoint.lab.resendInvite,
    { successToast: "Invite resent" },
  );

  return (
    <>
      <div className="flex flex-col gap-3.5">
        {/* ── Main info card ── */}
        <Card className="shadow-card">
          <CardContent className="pt-6 pb-5 flex flex-col items-center text-center gap-2">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {staffDetailInitials(staff)}
              </AvatarFallback>
            </Avatar>

            <p className="mt-0.5 text-base font-bold leading-tight">
              {staffDetailName(staff)}
            </p>
            <p className="text-[12.5px] text-muted-foreground">{staff.user.email}</p>
            {staff.user.phone && (
              <p className="text-[12.5px] text-muted-foreground">{staff.user.phone}</p>
            )}

            <div className="flex gap-1.5 mt-1">
              <Badge
                variant="outline"
                className={cn("text-[11px] font-bold border", ROLE_COLORS[staff.role])}
              >
                {ROLE_LABELS[staff.role]}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-[11px] font-bold border", STATUS_COLORS[staff.status])}
              >
                {STATUS_LABELS[staff.status]}
              </Badge>
            </div>

            <div className="w-full border-t border-border mt-2 pt-2.5 flex flex-col gap-1">
              <p className="text-[11.5px] text-muted-foreground">
                Joined{" "}
                <span className="text-foreground font-medium">
                  {formatDate(staff.joinedAt ?? staff.createdAt)}
                </span>
              </p>
              {staff.invitedBy && (
                <p className="text-[11.5px] text-muted-foreground">
                  Invited by{" "}
                  <span className="text-foreground font-medium">{staff.invitedBy}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Actions card (non-manager) ── */}
        {!isManager && (
          <Card className="shadow-card">
            <CardContent className="p-3 flex flex-col gap-1.5">
              <Button
                variant="outline"
                size="default"
                className="w-full justify-start gap-2"
                onClick={() => setRoleOpen(true)}
              >
                <UserCog className="w-3.5 h-3.5" />
                Change Role
              </Button>

              <Button
                variant="outline"
                size="default"
                className="w-full justify-start gap-2"
                onClick={() => setStatusConfirmOpen((v) => !v)}
              >
                {isActive ? (
                  <><Pause className="w-3.5 h-3.5" />Deactivate</>
                ) : (
                  <><Play className="w-3.5 h-3.5" />Activate</>
                )}
              </Button>

              {statusConfirmOpen && (
                <div className="bg-muted/40 rounded-[var(--radius)] p-2.5 flex flex-col gap-2">
                  <p className="text-xs text-foreground">
                    {isActive
                      ? "Deactivate this staff member? They will lose access immediately."
                      : "Activate this staff member? Their access will be restored."}
                  </p>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setStatusConfirmOpen(false)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={updateStatus.isLoading}
                      onClick={() =>
                        updateStatus.trigger({ status: isActive ? "inactive" : "active" })
                      }
                    >
                      {updateStatus.isLoading ? "Saving…" : "Confirm"}
                    </Button>
                  </div>
                </div>
              )}

              {isPending && (
                <Button
                  variant="outline"
                  size="default"
                  className="w-full justify-start gap-2"
                  disabled={resendInvite.isLoading}
                  onClick={() =>
                    resendInvite.trigger({ type: "staff", identifier: staff._id })
                  }
                >
                  <Mail className="w-3.5 h-3.5" />
                  Resend Invite
                </Button>
              )}

              <Button
                variant="destructive"
                size="default"
                className="w-full justify-start gap-2"
                onClick={() => setRemoveOpen(true)}
              >
                <UserX className="w-3.5 h-3.5" />
                Remove from Lab
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Manager notice ── */}
        {isManager && (
          <Card className="shadow-card bg-muted/30">
            <CardContent className="p-3.5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manager accounts have full platform access and cannot be modified from this view.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <ChangeRoleDialog
        staff={staff}
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        onSuccess={() => { setRoleOpen(false); onRoleChanged(); }}
      />
      <RemoveDialog
        staff={staff}
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onSuccess={() => { setRemoveOpen(false); onRemoved(); }}
      />
    </>
  );
}
