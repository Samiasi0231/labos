import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Save } from "lucide-react";
import { useMutation } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import endpoint from "@/api/endpoints";
import type { Patient, PatientGender, UpdatePatientPayload } from "@/api/types/patients";

const NG_STATES = [
  "Lagos", "Abuja", "Rivers", "Kano", "Oyo",
  "Enugu", "Kaduna", "Ogun", "Imo", "Anambra",
];

interface EditPatientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  onSuccess?: () => void;
}

type EditForm = {
  firstName: string;
  lastName: string;
  dob: string;
  gender: PatientGender | "";
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
};

function toForm(patient: Patient): EditForm {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    dob: patient.dob ? patient.dob.slice(0, 10) : "",
    gender: patient.gender,
    line1: patient.address?.line1 ?? "",
    line2: patient.address?.line2 ?? "",
    city: patient.address?.city ?? "",
    state: patient.address?.state ?? "",
    country: patient.address?.country ?? "NG",
  };
}

export function EditPatientSheet({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: EditPatientSheetProps) {
  const { toast } = useToast();
  const { trigger, isLoading } = useMutation<Patient, UpdatePatientPayload>(
    "patients/update",
<<<<<<< HEAD
    { method: "PATCH", successToast: "Patient updated", invalidate: [endpoint.lab.patients.list] },
  );
  const updatePatient = async (patientId: string, payload: UpdatePatientPayload) => {
    const res = await trigger(payload, endpoint.lab.patients.update(patientId));
    if (!res) return null;
=======
    { method: "PATCH", skipErrorHandling: true, invalidate: [endpoint.lab.patients.list] },
  );
  const updatePatient = async (patientId: string, payload: UpdatePatientPayload) => {
    const res = await trigger(payload, endpoint.lab.patients.update(patientId));
    if (!res) throw new Error("Failed to update patient");
>>>>>>> origin/main
    return res.data;
  };

  const [form, setForm] = useState<EditForm>(() => toForm(patient));

  useEffect(() => {
    setForm(toForm(patient));
  }, [patient]);

  const set = (patch: Partial<EditForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.gender) {
      toast({
        title: "Required fields missing",
        description: "First name, last name and gender are required.",
        variant: "destructive",
      });
      return;
    }
    const updated = await updatePatient(patient._id, {
      firstName: form.firstName,
      lastName: form.lastName,
      gender: form.gender as PatientGender,
      dob: form.dob || undefined,
      address: {
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state,
        country: form.country,
      },
    });
    if (!updated) return;
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            Edit Patient
          </SheetTitle>
          <p className="text-xs text-muted-foreground font-mono">
            {patient.code}
          </p>
        </SheetHeader>

        <div className="space-y-5 pb-4">
          {/* Personal */}
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personal Information
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.firstName}
                  onChange={(e) => set({ firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.lastName}
                  onChange={(e) => set({ lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => set({ gender: v as PatientGender })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => set({ dob: e.target.value })}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Address */}
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Address
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Street Address</Label>
              <Input
                value={form.line1}
                onChange={(e) => set({ line1: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Address Line 2</Label>
              <Input
                value={form.line2}
                onChange={(e) => set({ line2: e.target.value })}
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">City</Label>
                <Input
                  value={form.city}
                  onChange={(e) => set({ city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">State</Label>
                <Select
                  value={form.state}
                  onValueChange={(v) => set({ state: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {NG_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>

        <SheetFooter className="pt-4 border-t border-border gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1 gap-2" onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4" />
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
