import { z } from "zod";
export const inviteStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
  role: z.enum(["scientist",  "patient", "receptionist"], {
    message: "Please select a role" ,
  }),
});
export type InviteStaffValues = z.infer<typeof inviteStaffSchema>;