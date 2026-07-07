import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FlaskConical,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@/hooks/use-api";
import { setStoredAuth } from "@/api/client";
import { endpoints } from "@/api/endpoints/auth";
import {
  signInSchema,
  type SignInValues,
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validations/auth";
import type {
  LoginPayload,
  LoginResponse,
  ForgotPasswordPayload,
} from "@/api/types/auth";

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

export default function SignIn() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
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
   endpoints.login,
   {
     skipErrorHandling: true,
     onSuccess: (res) => {
       const data = res.data;
       if (!data) return;

       if (data.nextAction === "create_lab") {
         setStoredAuth(data);
         navigate("/create-lab");
         return;
       }
       if (data.nextAction === "select_lab") {
         setStoredAuth(data);
         navigate("/select-lab");
         return;
       }
       setStoredAuth(data);
       toast.success("Welcome back!");
       navigate(getRoleRedirect(data.role));
     },
     onError: (err) => toast.error(err.message || "Invalid email or password"),
   },
 );

  const forgotMutation = useMutation<unknown, ForgotPasswordPayload>(
    endpoints.forgotPassword,
    {
      skipErrorHandling: true,
      onSuccess: () => setResetSent(true),
      onError: (err) => toast.error(err.message || "Something went wrong"),
    },
  );

  const onSignIn = (values: SignInValues) => {
    loginMutation.trigger({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      access_type: "staff",
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
              <span className="text-primary">Lab</span>OS
            </span>
          </Link>
          <h1 className="text-2xl font-bold">
            {forgotMode ? "Reset Password" : "Sign In to LabOS"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {forgotMode
              ? "Enter your email to receive a password reset link"
              : "Access your laboratory management dashboard"}
          </p>
        </div>

        <Card className="shadow-card border">
          <CardContent className="pt-7 pb-7">
            {!forgotMode ? (
              <Form {...signInForm}>
                <form
                  onSubmit={signInForm.handleSubmit(onSignIn)}
                  className="space-y-5"
                >
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@yourlab.ng"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <button
                            type="button"
                            onClick={() => setForgotMode(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPass ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pr-10"
                              autoComplete="current-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPass ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={loginMutation.isLoading}
                  >
                    {loginMutation.isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-xs text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  {/* Demo access */}
                  <div className="space-y-2">
                    <p className="text-xs text-center text-muted-foreground font-medium">
                      Quick Portal Access (Demo)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Lab Portal", path: "/lab" },
                        { label: "Patient Portal", path: "/patient" },
                      ].map((p) => (
                        <Link
                          key={p.label}
                          to={p.path}
                          className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 border border-border rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
                        >
                          {p.label} <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground">
                      Demo portals — no login required
                    </p>
                  </div>
                </form>
              </Form>
            ) : resetSent ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                  <Shield className="w-7 h-7 text-success" />
                </div>
                <h3 className="font-bold text-lg">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  If an account exists for <strong>{resetEmail}</strong>, a
                  password reset link has been sent. Check your inbox (and spam
                  folder).
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setForgotMode(false);
                    setResetSent(false);
                    forgotForm.reset();
                  }}
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <Form {...forgotForm}>
                <form
                  onSubmit={forgotForm.handleSubmit(onForgot)}
                  className="space-y-5"
                >
                  <FormField
                    control={forgotForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@yourlab.ng"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={forgotMutation.isLoading}
                  >
                    {forgotMutation.isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        Send Reset Link <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
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
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Register your lab free
            </Link>
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
