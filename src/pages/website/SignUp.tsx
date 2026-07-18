import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrimaryButton } from "@/components/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextInput } from "@/components/form/text-input";
import { PasswordInput } from "@/components/form/password-input";
import {
  FlaskConical,
  CheckCircle,
  ArrowRight,
  Shield,
  Mail,
} from "lucide-react";
import { notify } from "@/lib/notify";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { RegisterPayload, RegisterResponse } from "@/api/types/auth";
import { z } from "zod";
import { Button } from "@/components/ui/button";

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z.string().optional(),
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

export type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const registerMutation = useMutation<RegisterResponse, RegisterPayload>(
    endpoint.auth.register,
    {
      skipErrorHandling: true,
      onSuccess: () => setDone(true),
      onError: (err) => notify.fromApiError(err, "Registration failed"),
    }
  );

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
                  <TextInput form={form} name="firstName" label="First Name *" placeholder="Adaeze" />
                  <TextInput form={form} name="lastName" label="Last Name *" placeholder="Okonkwo" />
                </div>

                <TextInput
                  form={form}
                  name="email"
                  label="Email Address *"
                  type="email"
                  placeholder="you@yourlab.ng"
                  autoComplete="email"
                />

                <TextInput
                  form={form}
                  name="phone"
                  label="Phone Number"
                  placeholder="+234 801 234 5678"
                />

                <PasswordInput
                  form={form}
                  name="password"
                  label="Password *"
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

                <PrimaryButton
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={registerMutation.isLoading}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Create Account
                </PrimaryButton>
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