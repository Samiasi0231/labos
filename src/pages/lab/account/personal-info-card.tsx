import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2 } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useMutation } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import endpoint from "@/api/endpoints";
import type { UpdateUserProfilePayload, UpdateUserProfileResponse } from "@/api/types/user";
import dayjs from "dayjs";

/**
 * Personal Information card.
 *
 * Integrates with:
 *   PATCH /users/me  → endpoint.user.updateProfile
 *
 * Response shape: { id, firstName, lastName, email, phone }
 * On success the store user is patched in-place (no full re-fetch needed).
 */
export function PersonalInfoCard() {
  const { user, setUser } = useStore();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });

  const { trigger: updateProfile, isLoading: isSaving } = useMutation<
    UpdateUserProfileResponse,
    UpdateUserProfilePayload
  >(endpoint.user.updateProfile, {
    method: "PATCH",
    onSuccess: (res) => {
      if (!res.data || !user) return;
      // Merge the updated fields back into the store user
      setUser({
        ...user,
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        phone: res.data.phone,
      });
      setEditing(false);
      toast({ title: "Profile Updated", description: "Your personal information has been saved." });
    },
  });

  const handleSave = () => {
    updateProfile({
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      phone: form.phone || undefined,
    });
  };

  const handleCancel = () => {
    setForm({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
    });
    setEditing(false);
  };

  const memberSince = user?.createdAt
    ? dayjs(user.createdAt).format("DD MMM YYYY")
    : "—";

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => setEditing(true)}
            >
              <Pencil className="w-3 h-3" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              First Name
            </Label>
            {editing ? (
              <Input
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              />
            ) : (
              <p className="text-[13.5px] font-semibold">{user?.firstName || "—"}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Last Name
            </Label>
            {editing ? (
              <Input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              />
            ) : (
              <p className="text-[13.5px] font-semibold">{user?.lastName || "—"}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Phone
            </Label>
            {editing ? (
              <Input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Add phone number"
              />
            ) : user?.phone ? (
              <p className="text-[13.5px] font-semibold">{user.phone}</p>
            ) : (
              <div>
                <p className="text-[13.5px] text-muted-foreground">Not provided</p>
                <button
                  className="text-xs text-primary font-semibold underline mt-0.5"
                  onClick={() => setEditing(true)}
                >
                  Add phone number
                </button>
              </div>
            )}
          </div>

          {/* Email (read-only — backend does not allow email updates) */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Email{" "}
              <span className="normal-case font-normal">(read-only)</span>
            </Label>
            <p className="text-[13.5px] font-semibold text-muted-foreground">
              {user?.email}
            </p>
          </div>

          {/* Member Since */}
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Member Since
            </Label>
            <p className="text-[13.5px] font-semibold text-muted-foreground">{memberSince}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
