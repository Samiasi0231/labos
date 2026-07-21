import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PermissionButton } from "@/components/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextInput } from "@/components/form/text-input";
import { SelectInput } from "@/components/form/select-input";
import { StateLgaFields } from "@/components/form/StateLgaField";
import {
  UserPlus,
  User,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Printer,
} from "lucide-react";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { Patient, CreatePatientPayload } from "@/api/types/patients";
import { z } from "zod";
import { concatStrings } from "@/lib/utils";

export const patientRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female"], { message: "Gender is required" }),
  dob: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "Local Government is required"),
});

export type PatientRegistrationValues = z.infer<
  typeof patientRegistrationSchema
>;

export default function PatientRegistration() {
  const { trigger, isLoading: isSubmitting } = useMutation<
    Patient,
    CreatePatientPayload
  >(endpoint.lab.patients.create, {
    successToast: "Patient registered",
    invalidate: [endpoint.lab.patients.list],
  });
  const createPatient = async (payload: CreatePatientPayload) => {
    const res = await trigger(payload);
    if (!res) return null;
    return res.data;
  };
  const [submitted, setSubmitted] = useState(false);
  const [patientCode, setPatientCode] = useState("");
  const [submittedValues, setSubmittedValues] = useState<PatientRegistrationValues | null>(null);

  const form = useForm<PatientRegistrationValues>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: undefined,
      dob: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      state: "",
      city: "",
    },
  });

  const onSubmit = async (values: PatientRegistrationValues) => {
    const hasAddress =
      values.addressLine1 || values.addressLine2 || values.city || values.state;

    const patient = await createPatient({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      gender: values.gender,
      dob: values.dob || undefined,
      email: values.email || undefined,
      address: hasAddress
        ? {
          line1: values.addressLine1 || "",
          line2: values.addressLine2 || undefined,
          city: values.city || "",
          state: values.state || "",
          country: "NG",
        }
        : undefined,
    });
    if (!patient) return;
    setSubmittedValues(values);
    setPatientCode(patient.code);
    setSubmitted(true);
  };

  if (submitted && submittedValues) {
    return (
      <div className="max-w-2xl space-y-6 animate-fade-in py-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-success/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Registration Complete</h3>
            <p className="text-sm text-muted-foreground">
              Patient has been added to the system
            </p>
          </div>
        </div>

        <Card className="shadow-card border-success/20">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Patient Record
              </span>
              <Badge className="bg-success/15 text-success border-success/30 border font-mono px-3">
                {patientCode}
              </Badge>
            </div>
            {[
              {
                label: "Full Name",
                value: concatStrings(submittedValues.firstName, submittedValues.lastName, " "),
              },
              { label: "Gender", value: submittedValues.gender },
              {
                label: "Date of Birth",
                value: submittedValues.dob || "Not provided",
              },
              { label: "Phone", value: submittedValues.phone },
              {
                label: "Address",
                value:
                  [
                    submittedValues.addressLine1,
                    submittedValues.city,
                    submittedValues.state,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not provided",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between text-sm py-2.5 border-b border-border last:border-0"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-right max-w-[60%]">
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-10 animate-fade-in pb-12"
      >
        <div className="space-y-5">
          <SectionHeading icon={User} label="Personal Information" index={1} />

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              form={form}
              name="firstName"
              label="First Name *"
              placeholder="First name"
            />
            <TextInput
              form={form}
              name="lastName"
              label="Last Name *"
              placeholder="Last name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              form={form}
              name="gender"
              label="Gender *"
              placeholder="Select"
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ]}
            />
            <TextInput
              form={form}
              name="dob"
              label="Date of Birth"
              type="date"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextInput
              form={form}
              name="phone"
              label="Phone Number *"
              placeholder="+234 801 234 5678"
            />
            <TextInput
              form={form}
              name="email"
              label="Email Address"
              type="email"
              placeholder="patient@email.com"
            />
          </div>
        </div>
        <Separator />
        <div className="space-y-5">
          <SectionHeading icon={MapPin} label="Address" index={2} optional />

          <TextInput
            form={form}
            name="addressLine1"
            label="Street Address"
            placeholder="House number, street name"
          />
          <TextInput
            form={form}
            name="addressLine2"
            label="Apartment / Unit"
            placeholder="Optional"
          />

          <StateLgaFields form={form} />
        </div>

        <div className="flex justify-end pt-2">
          <PermissionButton
            permission="patients.create"
            fallback="hide"
            className="gap-2 px-8"
            size="lg"
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Register Patient
          </PermissionButton>
        </div>
      </form>
    </Form>
  );
}

function SectionHeading({
  icon: Icon,
  label,
  index,
  optional,
}: {
  icon: React.ElementType;
  label: string;
  index: number;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Section {index}</p>
        <h3 className="font-semibold leading-tight">
          {label}
          {optional && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          )}
        </h3>
      </div>
    </div>
  );
}
