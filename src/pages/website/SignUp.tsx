import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  FlaskConical,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  Mail,
} from "lucide-react";
import { notify } from "@/lib/notify";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";
import type { RegisterPayload, RegisterResponse } from "@/api/types/auth";

export default function SignUp() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation<RegisterResponse, RegisterPayload>(
    endpoint.auth.register,
    {
      skipErrorHandling: true,
      onSuccess: () => setDone(true),
      onError: (err) => notify.fromApiError(err, "Registration failed"),
    }
  );

  const onSubmit = (values: SignUpValues) => {
    setSubmittedEmail(values.email);
    registerMutation.trigger({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      phone: (values.phone ?? "").trim(),
    });
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Check your email</h2>
          <p className="text-muted-foreground mb-2">
            We sent a verification link to <strong>{submittedEmail}</strong>.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Please verify your email before signing in. Check your inbox and
            spam folder.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate("/signin")}
            >
              Go to Sign In <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Return to Homepage</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Need help? Contact{" "}

            href="mailto:hello@ezralabs.ng"
            className="text-primary hover:underline"
            <a>
              hello@ezralabs.ng
            </a>
          </p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Start your free 30-day trial · No credit card required
          </p>
        </div>

        <Card className="shadow-card border">
          <CardContent className="pt-7 pb-7">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Adaeze" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Okonkwo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
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
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+234 801 234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
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
                            {showConfirm ? (
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

                <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">
                    Password requirements:
                  </p>
                  <p>
                    • At least 8 characters · One uppercase letter · One number
                    or symbol
                  </p>
                </div>

                <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg text-xs text-muted-foreground border border-border">
                  <Shield className="w-4 h-4 text-success flex-shrink-0" />
                  <span>
                    Your data is protected in accordance with Nigeria's NDPR.
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={registerMutation.isLoading}
                >
                  {registerMutation.isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
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