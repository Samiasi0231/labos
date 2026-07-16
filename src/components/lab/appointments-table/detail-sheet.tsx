import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, LogIn } from "lucide-react";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  Appointment,
  AppointmentStatus,
  UpdateAppointmentStatusPayload,
} from "@/api/types/appointments";
import { STATUS_CONFIG, formatDateTime, patientName } from "./shared";

interface DetailSheetProps {
  appointment: Appointment | null;
  onClose: () => void;
  onCheckIn: (appointment: Appointment) => void;
  onMutate: () => void;
}

type ConfirmFor = "cancel" | "noshow" | null;

function initials(name: string) {
  const parts = name.split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function orderStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}

export function DetailSheet({
  appointment,
  onClose,
  onCheckIn,
  onMutate,
}: DetailSheetProps) {
  const [confirmFor, setConfirmFor] = useState<ConfirmFor>(null);

  const { trigger: updateStatus, isLoading: isUpdating } = useMutation<
    Appointment,
    UpdateAppointmentStatusPayload
  >(
    appointment
      ? endpoint.lab.appointments.status(appointment._id)
      : "appointments/status",
    { method: "PATCH", successToast: "Appointment updated" }
  );

  const handleStatusChange = async (status: AppointmentStatus) => {
    if (!appointment) return;
    const res = await updateStatus(
      { status },
      endpoint.lab.appointments.status(appointment._id)
    );
    if (!res) return;
    onMutate();
    setConfirmFor(null);
    onClose();
  };

  if (!appointment) return null;

  const name = patientName(appointment.patient);
  const statusCfg = STATUS_CONFIG[appointment.status];

  const canConfirm = appointment.status === "scheduled";
  const canCheckIn = appointment.status === "confirmed";
  const canNoShow = appointment.status === "scheduled" || appointment.status === "confirmed";
  const canCancel = appointment.status === "scheduled" || appointment.status === "confirmed";
  const showActions = ["scheduled", "confirmed"].includes(appointment.status);

  const testChips = appointment.testCatalogs.map((t) => (
    <span
      key={t._id}
      className="inline-flex text-[10.5px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 whitespace-nowrap"
    >
      {t.name}
    </span>
  ));

  return (
    <Sheet
      open={!!appointment}
      onOpenChange={(o) => {
        if (!o) {
          setConfirmFor(null);
          onClose();
        }
      }}
    >
      <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle>Appointment Details</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-5">
          {/* Patient avatar + identity */}
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-base leading-tight">{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {appointment.patient.code} · {appointment.patient.phone}
              </p>
            </div>
          </div>

          <Separator />

          {/* Details key-value */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Details
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-semibold">
                  {formatDateTime(appointment.scheduledAt)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Branch</span>
                <span className="font-semibold">{appointment.branch?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={`${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border text-xs font-semibold`}
                >
                  {statusCfg.label}
                </Badge>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-muted-foreground flex-shrink-0">Tests</span>
                <div className="flex flex-wrap gap-1 justify-end">{testChips}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Booked By</span>
                <span className="font-semibold">
                  {appointment.bookedBy
                    ? `${appointment.bookedBy.firstName} ${appointment.bookedBy.lastName}`
                    : "—"}
                </span>
              </div>
              {appointment.notes && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Notes</p>
                  <p className="bg-muted/30 rounded-lg px-3 py-2.5 text-sm">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Linked test order */}
          {appointment.testOrder && (
            <div className="border border-border rounded-lg px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Linked Test Order
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs">
                    {orderStatusLabel(appointment.testOrder.status)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Priority</span>
                  <span className="font-semibold capitalize">
                    {appointment.testOrder.priority}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">
                    ₦{appointment.testOrder.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                View Order
              </Button>
            </div>
          )}

          {/* Confirm prompt (destructive inline) */}
          {confirmFor && (
            <div className="bg-destructive/6 border border-destructive/25 rounded-lg px-4 py-3 flex flex-col gap-2.5">
              <p className="text-sm text-destructive">
                {confirmFor === "cancel"
                  ? "Cancel this appointment? This cannot be undone."
                  : "Mark as no-show? This cannot be undone."}
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmFor(null)}
                  disabled={isUpdating}
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  className="bg-destructive hover:bg-destructive/90 border-destructive text-white"
                  onClick={() =>
                    handleStatusChange(confirmFor === "cancel" ? "cancelled" : "no_show")
                  }
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating…" : "Confirm"}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && !confirmFor && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {canConfirm && (
                  <Button
                    className="gap-1.5 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 border-[hsl(var(--success))] text-white"
                    onClick={() => handleStatusChange("confirmed")}
                    disabled={isUpdating}
                  >
                    <Check className="w-4 h-4" />
                    Confirm
                  </Button>
                )}
                {canCheckIn && (
                  <Button
                    className="gap-1.5"
                    onClick={() => onCheckIn(appointment)}
                    disabled={isUpdating}
                  >
                    <LogIn className="w-4 h-4" />
                    Check In
                  </Button>
                )}
                {canNoShow && (
                  <Button
                    variant="outline"
                    onClick={() => setConfirmFor("noshow")}
                    disabled={isUpdating}
                  >
                    Mark No-show
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/40 hover:bg-destructive/5"
                    onClick={() => setConfirmFor("cancel")}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
