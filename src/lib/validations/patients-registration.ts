import { z } from "zod";

export const patientRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["male", "female"], { message: "Gender is required" }),
  dob: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "Local Government is required"),
});

export type PatientRegistrationValues = z.infer<typeof patientRegistrationSchema>;