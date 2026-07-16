import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StateLgaFields } from "@/components/form/StateLgaField";
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

import { FlaskConical, Building2, ArrowRight, Phone } from "lucide-react";

import { notify } from "@/lib/notify";

import { useMutation } from "@/hooks/use-api";
import { useStore } from "@/hooks/use-store";
import endpoint from "@/api/endpoints";

import { createLabSchema, type CreateLabValues } from "@/lib/validations/auth";
import type { AuthTokens } from "@/api/types/auth";
import type { CreateLabPayload } from "@/api/types/lab";


function getRoleRedirect(role: string): string {
  switch (role) {
    case "lab_manager":
    case "lab_owner":
      return "/lab";

    case "scientist":
      return "/scientist";

    case "receptionist":
      return "/reception";

    case "patient":
      return "/patient";

    case "admin":
      return "/admin";

    default:
      return "/lab";
  }
}

export default function CreateLab() {
  const navigate = useNavigate();
  const { setAuth } = useStore();

  const form = useForm<CreateLabValues>({
    resolver: zodResolver(createLabSchema),

    defaultValues: {
      name: "",
      email: "",
      phone: "",
      line1: "",
      city: "",
      state: "",
    },
  });

  const createLabMutation = useMutation<AuthTokens, CreateLabPayload>(
    endpoint.lab.create,
    {
      skipErrorHandling: true,

      onSuccess: (res) => {
        if (!res.data) return;

        setAuth(res.data);

        notify.fromApiSuccess(res, "Lab created successfully!");

        navigate(getRoleRedirect(res.data.role));
      },

      onError: (err) => {
        notify.fromApiError(err, "Lab creation failed");
      },
    },
  );

  const onSubmit = (values: CreateLabValues) => {
    createLabMutation.trigger({
      name: values.name.trim(),

      email: values.email.trim().toLowerCase(),

      phone: values.phone.trim(),

      address: {
        line1: values.line1?.trim() || "Not provided",
        city: values.city,
        state: values.state,
        country: "NG",
      },
    });
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-lg">
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

          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Set up your laboratory
          </h1>

          <p className="text-muted-foreground text-sm mt-1">
            You're almost there — tell us about your lab.
          </p>
        </div>

        <Card className="shadow-card border">
          <CardContent className="pt-7 pb-7">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Laboratory Name */}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laboratory Name *</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="HealthFirst Diagnostics"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laboratory Email *</FormLabel>

                      <FormControl>
                        <Input
                          type="email"
                          placeholder="info@yourlab.ng"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>

                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                          <Input
                            className="pl-9"
                            placeholder="+234 801 234 5678"
                            {...field}
                          />
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}

                <FormField
                  control={form.control}
                  name="line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="14 Medical Road, Victoria Island"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* State & LGA */}

                <StateLgaFields form={form} />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={createLabMutation.isLoading}
                >
                  {createLabMutation.isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Creating Lab...
                    </span>
                  ) : (
                    <>
                      Create Lab
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
