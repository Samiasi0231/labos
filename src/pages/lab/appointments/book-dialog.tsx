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
import { useMutation } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { GlobalSearchSelect } from "@/components/lab/GlobalSearchSelect";
import endpoint from "@/api/endpoints";
import type { CreateAppointmentPayload, Appointment } from "@/api/types/appointments";
import type { SearchHit } from "@/api/types/search";

interface BookDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BookDialog({ open, onClose }: BookDialogProps) {
  const { toast } = useToast();

  const [selectedPatient, setSelectedPatient] = useState<SearchHit | null>(null);
  const [selectedTests, setSelectedTests] = useState<SearchHit[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const { trigger: createAppointment, isLoading: isBooking } = useMutation<
    Appointment,
    CreateAppointmentPayload
  >(endpoint.lab.appointments.create, {
    skipErrorHandling: true,
    invalidate: [endpoint.lab.appointments.list]
  });

  const reset = () => {
    setSelectedPatient(null);
    setSelectedTests([]);
    setScheduledDate("");
    setScheduledTime("");
    setNotes("");
    setError("");
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const handleBook = async () => {
    if (!selectedPatient || !scheduledDate || selectedTests.length === 0) {
      setError("Patient, date, and at least one test are required.");
      return;
    }
    setError("");

    const scheduledAt = scheduledTime
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      : new Date(`${scheduledDate}T00:00:00`).toISOString();

    const res = await createAppointment({
      patient: selectedPatient.id,
      testCatalogs: selectedTests.map((t) => t.id),
      scheduledAt,
      notes: notes || undefined,
    });

    if (res) {
      toast({
        title: "Appointment booked",
        description: `Scheduled for ${scheduledDate}`,
      });
      onClose();
    } else {
      setError("Could not book appointment. Please try again.");
    }
  };

  const canBook =
    !!selectedPatient && selectedTests.length > 0 && !!scheduledDate && !isBooking;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Patient */}
          <div className="space-y-1.5">
            <Label>
              Patient <span className="text-destructive">*</span>
            </Label>
            <GlobalSearchSelect
              types={["patients"]}
              placeholder="Search patient by name or code…"
              emptyMessage="No patients found"
              value={selectedPatient}
              onSelect={setSelectedPatient}
              onClear={() => setSelectedPatient(null)}
            />
          </div>

          {/* Tests */}
          <div className="space-y-1.5">
            <Label>
              Tests <span className="text-destructive">*</span>
            </Label>
            <GlobalSearchSelect
              types={["test_catalog"]}
              placeholder="Search and add tests…"
              emptyMessage="No tests found"
              multiple
              values={selectedTests}
              onSelect={(h) => setSelectedTests((p) => [...p, h])}
              onRemove={(id) => setSelectedTests((p) => p.filter((t) => t.id !== id))}
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                Date <span className="text-destructive">*</span>
              </Label>
              <input
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={scheduledDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <input
                type="time"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>
              Notes{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              placeholder="Any additional instructions or notes…"
              className="resize-vertical min-h-[70px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="border-t border-border pt-4 mt-1">
          <Button variant="outline" onClick={onClose} disabled={isBooking}>
            Cancel
          </Button>
          <Button onClick={handleBook} disabled={!canBook}>
            {isBooking ? "Booking…" : "Book Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
