import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/hooks/use-store";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { ResendVerificationPayload } from "@/api/types/auth";

import { IdentityCard } from "./identity-card";
import { PersonalInfoCard } from "./personal-info-card";
import { LabMembershipCard } from "./lab-membership-card";
import { PermissionsCard } from "./permissions-card";
import { ChangePasswordCard } from "./change-password-card";

export default function MyAccount() {
  const { user } = useStore();

  const { trigger: resendVerification, isLoading: isResending } = useMutation<
    unknown,
    ResendVerificationPayload
  >(endpoint.auth.resendVerification, {
    successToast: "Verification email sent. Check your inbox.",
  });

  if (!user) return null;

  return (
    <div className="animate-fade-in max-w-[920px]">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">My Account</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── Left: Identity card ─────────────────────────────── */}
        <div className="lg:w-[260px] w-full flex-shrink-0">
          <IdentityCard />
        </div>

        {/* ── Right: All sections ─────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Email unverified banner */}
          {!user.emailVerified && (
            <div className="flex items-center justify-between gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p>
                  Your email is not verified. Check your inbox or resend the verification email.
                </p>
              </div>
              <Button
                variant="link"
                size="sm"
                className="text-primary text-xs shrink-0 px-0 h-auto font-semibold"
                onClick={() => resendVerification({ email: user.email })}
                disabled={isResending}
              >
                {isResending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : "Resend"
                }
              </Button>
            </div>
          )}

          <PersonalInfoCard />
          <LabMembershipCard />
          <PermissionsCard />
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
