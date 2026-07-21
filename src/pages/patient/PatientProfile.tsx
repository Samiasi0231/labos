import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { notify } from "@/lib/notify";
import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { PatientPortalProfile, UpdatePatientPortalProfilePayload } from "@/api/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDob(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] +
    " " + d.getDate() + ", " + d.getFullYear();
}

function fmtAddress(addr?: {
  street?: string; city?: string; state?: string; country?: string;
}): string {
  if (!addr) return "—";
  return [addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(", ") || "—";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PatientProfile() {
  const { data: profileData, isLoading } = useApi<PatientPortalProfile>(
    endpoint.patient.me
  );
  const profile = profileData?.data ?? null;

  const updateMutation = useMutation<PatientPortalProfile, UpdatePatientPortalProfilePayload>(
    endpoint.patient.updateMe,
    { method: "PATCH", successToast: "Profile updated", invalidate: [endpoint.patient.me] }
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? "");
      setLastName(profile.lastName ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const save = async () => {
    const payload: Record<string, string> = {};
    if (firstName !== profile?.firstName) payload.firstName = firstName;
    if (lastName !== profile?.lastName) payload.lastName = lastName;
    if (phone !== profile?.phone) payload.phone = phone;

    if (Object.keys(payload).length === 0) {
      notify.info("No changes to save.");
      return;
    }

    const res = await updateMutation.trigger(payload);
    if (!res) return;
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-xl">
      <div>
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">Your personal record</p>
      </div>

      {/* Read-only details */}
      <Card className="shadow-card">
        <CardContent className="pt-5 pb-5">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-1.5" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: "Full Name", value: [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "—" },
                { label: "Patient Code", value: profile?.patientCode ?? "—", mono: true },
                { label: "Date of Birth", value: fmtDob(profile?.dob) },
                { label: "Gender", value: profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "—" },
                { label: "Email", value: profile?.email ?? "—" },
                { label: "Address", value: fmtAddress(profile?.address) },
              ].map((field) => (
                <div key={field.label} className={field.label === "Address" || field.label === "Email" ? "col-span-2" : ""}>
                  <p className="text-[11px] text-muted-foreground">{field.label}</p>
                  <p className={`mt-0.5 text-sm font-semibold ${field.mono ? "font-mono" : ""}`}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editable — only firstName, lastName, phone accepted by API */}
      <Card className="shadow-card">
        <CardContent className="pt-5 pb-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Contact Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">First Name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Last Name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Phone</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            To update your email, address, or date of birth, contact your laboratory directly.
          </p>

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={isLoading || updateMutation.isLoading}>
              {updateMutation.isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
