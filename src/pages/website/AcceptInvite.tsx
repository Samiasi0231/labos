import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrimaryButton } from "@/components/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PasswordInput } from "@/components/form/password-input";
import { CheckCircle } from "lucide-react";
import { notify } from "@/lib/notify";
import type { ApiError } from "@/api/types/common";
import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import { z } from "zod";

export const acceptInviteSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9!@#$%^&*]/, "Must contain at least one number or symbol"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>;

interface InviteInfo {
  type: "staff" | "patient" | "doctor";
  firstName: string;
  lastName: string;
  email: string;
  labName: string;
  hasPassword: boolean;
}

interface AcceptInvitePayload {
  token: string;
  password?: string;
}

interface AcceptInviteResponse {
  access_type: "staff" | "patient" | "doctor";
  identifier: string;
}

function getPostInviteRedirect(accessType: string): string {
  if (accessType === "patient") return "/patient/signin";
  return "/signin";
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const inviteUrl = useMemo(
    () => (token ? endpoint.auth.inviteInfo(token) : null),
    [token],
  );
  const { data: inviteData, isLoading, error } = useApi<InviteInfo>(inviteUrl);
  const info = inviteData?.data ?? null;

  const { trigger: acceptInvite, isLoading: isAccepting } = useMutation
    <AcceptInviteResponse, AcceptInvitePayload>
    (endpoint.auth.acceptInvite, { skipErrorHandling: true });

  const form = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: AcceptInviteValues) => {
    if (!token) return;
    try {
      const res = await acceptInvite({
        token,
        password: info?.hasPassword ? undefined : values.password,
      });
      notify.success("Invitation accepted. You can now sign in.");
      navigate(
        getPostInviteRedirect(res?.data?.access_type ?? info?.type ?? "staff"),
      );
    } catch (err) {
      notify.fromApiError(
        err as ApiError,
        "This link may be invalid or expired.",
      );
    }
  };

  const handleAcceptExisting = async () => {
    if (!token) return;
    try {
      const res = await acceptInvite({ token });
      notify.success("Invitation accepted. You can now sign in.");
      navigate(
        getPostInviteRedirect(res?.data?.access_type ?? info?.type ?? "staff"),
      );
    } catch (err) {
      notify.fromApiError(
        err as ApiError,
        "This link may be invalid or expired.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading invite…
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-2">
          <h2 className="text-lg font-semibold">Invalid or expired invite</h2>
          <p className="text-sm text-muted-foreground">
            This invitation link is no longer valid. Please contact your lab for
            a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            Welcome, {info.firstName} {info.lastName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            You've been invited to join <strong>{info.labName}</strong>
          </p>
        </div>

        <Card className="shadow-card border">
          <CardContent className="pt-7 pb-7">
            {info.hasPassword ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  You already have an account. Click below to accept and
                  continue to sign in.
                </p>
                <PrimaryButton
                  className="w-full"
                  onClick={handleAcceptExisting}
                  isLoading={isAccepting}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Accept Invitation
                </PrimaryButton>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <PasswordInput
                    form={form}
                    name="password"
                    label="Set Password *"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />

                  <PasswordInput
                    form={form}
                    name="confirmPassword"
                    label="Confirm Password *"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />

                  <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">
                      Password requirements:
                    </p>
                    <p>
                      • At least 8 characters · One uppercase letter · One
                      number or symbol
                    </p>
                  </div>

                  <PrimaryButton
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={isAccepting}
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                  >
                    Accept Invitation
                  </PrimaryButton>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
