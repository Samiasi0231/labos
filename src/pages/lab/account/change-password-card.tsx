import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useMutation } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import endpoint from "@/api/endpoints";
import type { ChangePasswordPayload } from "@/api/types/user";
import { evalPasswordStrength } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Change Password card.
 *
 * Integrates with:
 *   PATCH /users/me/password  → endpoint.user.changePassword
 *
 * Request:  { currentPassword, newPassword }
 * Response: { data: null, message: "Password changed successfully" }
 *
 * Error mapping:
 *   "Current password is incorrect" → inline field error (not a toast)
 *   Any other error                 → destructive toast
 */
export function ChangePasswordCard() {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [currentError, setCurrentError] = useState("");
  const [success, setSuccess] = useState(false);

  const { trigger: changePassword, isLoading } = useMutation<unknown, ChangePasswordPayload>(
    endpoint.user.changePassword,
    {
      method: "PATCH",            // ← backend route is PATCH /users/me/password
      skipErrorHandling: true,    // suppress auto-toast so we can handle inline
      onError: (err) => {
        const msg = (err as { message?: string })?.message ?? "";
        if (/incorrect|wrong|current|invalid/i.test(msg)) {
          setCurrentError("Current password is incorrect.");
        } else {
          toast({ title: "Error", description: msg || "Failed to update password.", variant: "destructive" });
        }
      },
    },
  );

  const strength = evalPasswordStrength(form.next);
  const mismatch = form.confirm.length > 0 && form.next !== form.confirm;

  const handleSubmit = async () => {
    setCurrentError("");
    if (!form.current) {
      setCurrentError("Required.");
      return;
    }
    if (mismatch) return;

    try {
      await changePassword({ currentPassword: form.current, newPassword: form.next });
      setForm({ current: "", next: "", confirm: "" });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // already handled in onError
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 max-w-sm">
          {/* Current password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Current Password</Label>
            <Input
              type="password"
              value={form.current}
              onChange={(e) => {
                setCurrentError("");
                setForm((p) => ({ ...p, current: e.target.value }));
              }}
            />
            {currentError && (
              <p className="text-[11.5px] text-destructive">{currentError}</p>
            )}
          </div>

          {/* New password + strength bar */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">New Password</Label>
            <Input
              type="password"
              value={form.next}
              onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))}
            />
            {form.next && (
              <>
                <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-200",
                      strength.colorClass,
                    )}
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{strength.label}</p>
              </>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Confirm New Password</Label>
            <Input
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
            />
            {mismatch && (
              <p className="text-[11.5px] text-destructive">Passwords do not match.</p>
            )}
          </div>

          {/* Success flash */}
          {success && (
            <p className="text-[12.5px] font-semibold text-green-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Password updated successfully
            </p>
          )}

          <Button
            className="self-start mt-1"
            onClick={handleSubmit}
            disabled={isLoading || (form.confirm.length > 0 && mismatch)}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
