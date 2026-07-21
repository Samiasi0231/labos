import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { useMutation } from "@/hooks/use-api";
import { useSWRConfig } from "swr";
import endpoint from "@/api/endpoints";
import type { Appointment, CheckInPayload } from "@/api/types/appointments";
import { patientName } from "./shared";

interface CheckInDialogProps {
  appointment: Appointment | null;
  onClose: () => void;
  onMutate: () => void;
}

type Priority = "routine" | "urgent" | "stat";
const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "routine", label: "Routine" },
  { value: "urgent", label: "Urgent" },
  { value: "stat", label: "Stat" },
];

export function CheckInDialog({ appointment, onClose, onMutate }: CheckInDialogProps) {
  const { mutate: globalMutate } = useSWRConfig();

  const [priority, setPriority] = useState<Priority>("routine");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  const { trigger: checkIn, isLoading } = useMutation<Appointment, CheckInPayload>(
    appointment
      ? endpoint.lab.appointments.checkIn(appointment._id)
      : "appointments/check-in",
    { successToast: "Checked in" }
  );

  useEffect(() => {
    if (!appointment) {
      setSuccess(false);
      setPriority("routine");
      setNotes("");
    }
  }, [appointment]);

  if (!appointment) return null;

  const name = patientName(appointment.patient);

  const handleSubmit = async () => {
    const res = await checkIn(
      { priority, notes: notes || undefined },
      endpoint.lab.appointments.checkIn(appointment._id)
    );
    if (!res) return;
    globalMutate(
      (key) =>
        typeof key === "string" && key.startsWith(endpoint.lab.appointments.list)
    );
    onMutate();
    setSuccess(true);
  };

  return (
    <Dialog
      open={!!appointment}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Check In</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="w-9 h-9 text-[hsl(var(--success))]" />
            <p className="font-semibold text-base">Checked in successfully</p>
            <p className="text-sm text-muted-foreground">
              A test order has been created for {name}.
            </p>
            <Button size="sm" onClick={onClose} className="mt-1">
              View Order
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-2">
              {/* Patient summary */}
              <div className="bg-muted/30 rounded-lg px-4 py-3">
                <p className="font-bold text-sm">{name}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {appointment.testCatalogs.map((t) => (
                    <span
                      key={t._id}
                      className="inline-flex text-[10.5px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="inline-flex border border-border rounded-lg overflow-hidden">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`px-4 py-2 text-xs font-semibold transition-colors ${
                        priority === p.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any notes for the test order…"
                  className="resize-vertical min-h-[70px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4 mt-1">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Checking in…" : "Check In & Create Order"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
