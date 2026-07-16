import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCog, Pause, Play, Mail, UserX } from "lucide-react";
import { cn, concatStrings, initials } from "@/lib/utils";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
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
      onSuccess: () => { setStatusConfirmOpen(false); onStatusChanged(); },
    },
  );

  const name = concatStrings(staff.user.firstName, staff.user.lastName, " ");
  const resendInvite = useMutation<unknown, { type: string; identifier: string }>(
    endpoint.lab.resendInvite,
    { successToast: "Invite resent" },
  );

  return (
    <>
      <div className="flex flex-col gap-3.5">

        {/* ── Info card ── */}
        <Card className="shadow-card">
          <CardContent className="pt-[22px] pb-5 px-[18px] flex flex-col items-center text-center gap-2">

            {/* Solid-teal avatar — matches design */}
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                {initials(name)}
              </AvatarFallback>
            </Avatar>

            <p className="mt-0.5 text-base font-bold leading-tight">{name}</p>
            <p className="text-[12.5px] text-muted-foreground">{staff?.user?.email}</p>
            {staff.user.phone && (
              <p className="text-[12.5px] text-muted-foreground">{staff?.user?.phone}</p>
            )}

            <div className="flex gap-1.5 mt-1">
              <Badge variant="outline" className={cn("text-[11px] font-semibold border rounded-full", ROLE_COLORS[staff.role])}>
                {ROLE_LABELS[staff.role]}
              </Badge>
              <Badge variant="outline" className={cn("text-[11px] font-semibold border rounded-full", STATUS_COLORS[staff.status])}>
                {STATUS_LABELS[staff.status]}
              </Badge>
            </div>

            <div className="w-full border-t border-border mt-2 pt-2.5 flex flex-col gap-1">
              <p className="text-[11.5px] text-muted-foreground">
                Joined <span className="text-foreground font-semibold">{formatDate(staff.joinedAt ?? staff.createdAt)}</span>
              </p>
              {staff?.invitedBy?.firstName && (
                <p className="text-[11.5px] text-muted-foreground">
                  Invited by <span className="text-foreground font-semibold">{concatStrings(staff?.invitedBy?.firstName, staff?.invitedBy?.lastName, " ")}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Actions card (non-manager) ── */}
        {!isManager && (
          <Card className="shadow-card">
            <CardContent className="p-3 flex flex-col gap-1.5">

              <Button variant="outline" size="default" className="w-full justify-center gap-2" onClick={() => setRoleOpen(true)}>
                <UserCog className="w-[14px] h-[14px]" />
                Change Role
              </Button>

              <Button
                variant="outline"
                size="default"
                className="w-full justify-center gap-2"
                onClick={() => setStatusConfirmOpen((v) => !v)}
              >
                {isActive
                  ? <><Pause className="w-[14px] h-[14px]" />Deactivate</>
                  : <><Play className="w-[14px] h-[14px]" />Activate</>
                }
              </Button>

              {/* Inline status confirm */}
              {statusConfirmOpen && (
                <div className="bg-muted/40 rounded-[var(--radius)] p-2.5 flex flex-col gap-2">
                  <p className="text-xs text-foreground leading-relaxed">
                    {isActive
                      ? "Deactivate this staff member? They will lose access immediately."
                      : "Activate this staff member? Their access will be restored."}
                  </p>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setStatusConfirmOpen(false)}>
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={updateStatus.isLoading}
                      onClick={() => updateStatus.trigger({ status: isActive ? "inactive" : "active" })}
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
                  className="w-full justify-center gap-2"
                  disabled={resendInvite.isLoading}
                  onClick={() => resendInvite.trigger({ type: "staff", identifier: staff._id })}
                >
                  <Mail className="w-[14px] h-[14px]" />
                  Resend Invite
                </Button>
              )}

              {/* Solid red — matches design */}
              <Button variant="destructive" size="default" className="w-full justify-center gap-2" onClick={() => setRemoveOpen(true)}>
                <UserX className="w-[14px] h-[14px]" />
                Remove from Lab
              </Button>

            </CardContent>
          </Card>
        )}

        {/* ── Manager notice ── */}
        {isManager && (
          <Card className="shadow-card" style={{ background: "hsl(var(--muted)/.3)" }}>
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
