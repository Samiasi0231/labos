import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PasswordInput } from "@/components/form/password-input";
import { PrimaryButton } from "@/components/button";
import { FlaskConical, ArrowRight } from "lucide-react";
import { notify } from "@/lib/notify";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { ResetPasswordPayload } from "@/api/types";
import { z } from "zod";

export const resetPasswordSchema = z
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
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resetMutation = useMutation<null, ResetPasswordPayload>(
    endpoint.auth.resetPassword,
    {
      skipErrorHandling: true,
      onSuccess: () => {
        notify.success("Password reset successfully.");
        navigate("/signin");
      },
      onError: (err) => {
        notify.fromApiError(err, "Unable to reset password.");
      },
    },
  );

  const onSubmit = (values: ResetPasswordValues) => {
    if (!token) {
      notify.error("Invalid or expired password reset link.");
      return;
    }
    resetMutation.trigger({ token, password: values.password });
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-primary">Ezra</span>Labs
            </span>
          </Link>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your new password below.
          </p>
        </div>

        <Card className="shadow-card border">
          <CardContent className="pt-7 pb-7">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <PasswordInput
                  form={form}
                  name="password"
                  label="New Password"
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />

                <PasswordInput
                  form={form}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />

                <PrimaryButton
                  type="submit"
                  className="w-full"
                  isLoading={resetMutation.isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Reset Password
                </PrimaryButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
