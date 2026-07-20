import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrimaryButton, SecondaryButton } from "@/components/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextInput } from "@/components/form/text-input";
import { PasswordInput } from "@/components/form/password-input";
import { FlaskConical, LogIn, ArrowRight, Shield } from "lucide-react";
import { notify } from "@/lib/notify";
import { useMutation } from "@/hooks/use-api";
import { useStore } from "@/hooks/use-store";
import endpoint from "@/api/endpoints";
import type {
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
} from "@/api/types/auth";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

function getRoleRedirect(role: string): string {
  switch (role) {
    case "lab_manager":
    case "lab_owner":
    case "manager":
    case "scientist":
    case "receptionist":
      return "/lab";
    case "patient":
      return "/patient";
    case "admin":
      return "/admin";
    default:
      return "/lab";
  }
}

interface SignInProps {
  accessType?: "staff" | "patient";
}

export default function SignIn({ accessType = "staff" }: SignInProps) {
  const navigate = useNavigate();
  const { setAuth } = useStore();
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const loginMutation = useMutation<LoginResponse, LoginPayload>(
    endpoint.auth.login,
    {
      skipErrorHandling: true,
      onSuccess: (res) => {
        const data = res.data;
        if (!data) return;
        setAuth({ ...data, access_type: accessType });

        notify.success("Welcome back!");
        if (accessType === "staff") {
          if (data.nextAction === "create_lab") {
            navigate("/create-lab");
            return;
          }
          if (data.nextAction === "select_lab") {
            navigate("/select-lab");
            return;
          }
          navigate(getRoleRedirect(data.role));
        }
        if (accessType === "patient") {
          navigate("/patient");
        }
      },
      onError: (err) => notify.fromApiError(err, "Invalid email or password"),
    },
  );

  const forgotMutation = useMutation<unknown, ForgotPasswordPayload>(
    endpoint.auth.forgotPassword,
    {
      skipErrorHandling: true,
      onSuccess: () => setResetSent(true),
      onError: (err) => notify.fromApiError(err, "Something went wrong"),
    },
  );

  const onSignIn = (values: SignInValues) => {
    loginMutation.trigger({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      access_type: accessType,
    });
  };

  const onForgot = (values: ForgotPasswordValues) => {
    setResetEmail(values.email);
    forgotMutation.trigger({ email: values.email.trim().toLowerCase() });
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
          <h1 className="text-2xl font-bold">
            {forgotMode ? "Reset Password" : "Sign In to Ezralabs"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {forgotMode
              ? "Enter your email to receive a password reset link"
              : accessType === "patient"
                ? "Access your patient portal"
                : "Access your laboratory management dashboard"}
          </p>
        </div>

        <Card className="shadow-card border">
          <CardContent className="pt-7 pb-7">
            {!forgotMode ? (
              <Form {...signInForm} key="signin">
                <form
                  key="signin-form"
                  onSubmit={signInForm.handleSubmit(onSignIn)}
                  className="space-y-5"
                >
                  <TextInput
                    form={signInForm}
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="you@yourlab.ng"
                    autoComplete="email"
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <PasswordInput
                      form={signInForm}
                      name="password"
                      label="Password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </div>

                  <PrimaryButton
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={loginMutation.isLoading}
                    leftIcon={<LogIn className="w-4 h-4" />}
                  >
                    Sign In
                  </PrimaryButton>
                </form>
              </Form>
            ) : resetSent ? (
              <div key="reset-sent" className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Shield className="w-7 h-7 text-success" />
                </div>
                <h3 className="font-bold text-lg">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  If an account exists for <strong>{resetEmail}</strong>, a
                  password reset link has been sent. Check your inbox (and spam
                  folder).
                </p>
                <SecondaryButton
                  className="w-full"
                  onClick={() => {
                    setForgotMode(false);
                    setResetSent(false);
                    forgotForm.reset();
                  }}
                >
                  Back to Sign In
                </SecondaryButton>
              </div>
            ) : (
              <Form {...forgotForm} key="forgot">
                <form
                  key="forgot-form"
                  onSubmit={forgotForm.handleSubmit(onForgot)}
                  className="space-y-5"
                >
                  <TextInput
                    form={forgotForm}
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="you@yourlab.ng"
                  />

                  <PrimaryButton
                    type="submit"
                    size="lg"
                    className="w-full"
                    isLoading={forgotMutation.isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Send Reset Link
                  </PrimaryButton>

                  <button
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Sign In
                  </button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {!forgotMode && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            {accessType === "patient" ? (
              <>
                Lab staff?{" "}
                <Link
                  to="/signin"
                  className="text-primary font-medium hover:underline"
                >
                  Sign in to Lab Portal
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary font-medium hover:underline"
                >
                  Register your lab free
                </Link>
              </>
            )}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
          <Link to="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <span>·</span>
          <Link to="/contact" className="hover:text-primary transition-colors">
            Help
          </Link>
        </div>
      </div>
    </div>
  );
}
