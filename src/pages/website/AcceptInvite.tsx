import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { notify } from "@/lib/notify";
import type { ApiError } from "@/api/types/common";
import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import {
  acceptInviteSchema,
  type AcceptInviteValues,
} from "@/lib/validations/auth";

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
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const inviteUrl = useMemo(
    () => (token ? endpoint.auth.inviteInfo(token) : null),
    [token],
  );
  const { data: inviteData, isLoading, error } = useApi<InviteInfo>(inviteUrl);
  const info = inviteData?.data ?? null;

  const { trigger: acceptInvite, isLoading: isAccepting } = useMutation<
    AcceptInviteResponse,
    AcceptInvitePayload
  >(endpoint.auth.acceptInvite, { skipErrorHandling: true });

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
      navigate(getPostInviteRedirect(res?.data?.access_type ?? info?.type ?? "staff"));
    } catch (err) {
      notify.fromApiError(err as ApiError, "This link may be invalid or expired.");
    }
  };

  const handleAcceptExisting = async () => {
    if (!token) return;
    try {
      const res = await acceptInvite({ token });
      notify.success("Invitation accepted. You can now sign in.");
      navigate(getPostInviteRedirect(res?.data?.access_type ?? info?.type ?? "staff"));
    } catch (err) {
      notify.fromApiError(err as ApiError, "This link may be invalid or expired.");
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
            This invitation link is no longer valid. Please contact your lab for a new one.
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
                  You already have an account. Click below to accept and continue to sign in.
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={handleAcceptExisting}
                  disabled={isAccepting}
                >
                  {isAccepting ? "Activating…" : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Accept Invitation
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Set Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPass ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              className="pr-10"
                              autoComplete="new-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirm ? "text" : "password"}
                              placeholder="Re-enter password"
                              className="pr-10"
                              autoComplete="new-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Password requirements:</p>
                    <p>• At least 8 characters · One uppercase letter · One number or symbol</p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isAccepting}
                  >
                    {isAccepting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Activating…
                      </span>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Accept Invitation
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}