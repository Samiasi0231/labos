import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StateLgaFields } from "@/components/form/StateLgaField";
import { PrimaryButton } from "@/components/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextInput } from "@/components/form/text-input";
import { FlaskConical, Building2, ArrowRight, Phone } from "lucide-react";
import { notify } from "@/lib/notify";
import { useMutation } from "@/hooks/use-api";
import { useStore } from "@/hooks/use-store";
import endpoint from "@/api/endpoints";
import type { AuthTokens } from "@/api/types/auth";
import type { CreateLabPayload } from "@/api/types/lab";
import { z } from "zod";

export const createLabSchema = z.object({
  name: z.string().min(1, "Laboratory name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().min(1, "State is required"),
});
export type CreateLabValues = z.infer<typeof createLabSchema>;

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
        setAuth({ ...res.data, access_type: "staff" });
        notify.fromApiSuccess(res, "Lab created successfully!");
        navigate(getRoleRedirect(res.data.role ?? "manager"));
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
                <TextInput
                  form={form}
                  name="name"
                  label="Laboratory Name *"
                  placeholder="HealthFirst Diagnostics"
                />

                <TextInput
                  form={form}
                  name="email"
                  label="Laboratory Email *"
                  type="email"
                  placeholder="info@yourlab.ng"
                />

                <div className="relative">
                  <TextInput
                    form={form}
                    name="phone"
                    label="Phone Number *"
                    placeholder="+234 801 234 5678"
                    className="pl-9"
                  />
                  <Phone className="absolute left-3 top-[44px] w-4 h-4 text-muted-foreground" />
                </div>

                <TextInput
                  form={form}
                  name="line1"
                  label="Street Address"
                  placeholder="14 Medical Road, Victoria Island"
                />

                {/* State & LGA */}
                <StateLgaFields form={form} />

                <PrimaryButton
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={createLabMutation.isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Lab
                </PrimaryButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
