import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  patientRegistrationSchema,
  type PatientRegistrationValues,
} from "@/lib/validations/patients-registration";

export default function PatientRegistration() {
  const { trigger, isLoading: isSubmitting } = useMutation<Patient, CreatePatientPayload>(
    endpoint.lab.patients.create,
    { successToast: "Patient registered", invalidate: [endpoint.lab.patients.list] },
  );
  const createPatient = async (payload: CreatePatientPayload) => {
    const res = await trigger(payload);
    if (!res) return null;
    return res.data;
  };
  const [submitted, setSubmitted] = useState(false);
  const [patientCode, setPatientCode] = useState("");
  const [submittedValues, setSubmittedValues] =
    useState<PatientRegistrationValues | null>(null);

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
     values.addressLine1 ||
     values.addressLine2 ||
     values.city ||
     values.state;

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

  const handleReset = () => {
    form.reset();
    setSubmitted(false);
    setPatientCode("");
    setSubmittedValues(null);
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
                value: `${submittedValues.firstName} ${submittedValues.lastName}`,
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

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleReset}
          >
            <RefreshCw className="w-4 h-4" />
            Register Another
          </Button>
          <Button className="flex-1 gap-2">
            <Printer className="w-4 h-4" />
            Print Patient Card
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-2xl space-y-10 animate-fade-in pb-12">

        <div className="space-y-5">
          <SectionHeading icon={User} label="Personal Information" index={1} />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
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
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 801 234 5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="patient@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Separator />
        <div className="space-y-5">
          <SectionHeading icon={MapPin} label="Address" index={2} optional />

          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="House number, street name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartment / Unit</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <StateLgaFields form={form} />
        </div>

        {/* ── Submit ── */}
        <div className="flex justify-end pt-2">
          <Button
            className="gap-2 px-8"
            size="lg"
            type="submit"
            disabled={isSubmitting}
          >
            <UserPlus className="w-4 h-4" />
            {isSubmitting ? "Registering..." : "Register Patient"}
          </Button>
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
