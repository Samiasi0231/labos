import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { TextInput } from "@/components/form/text-input";
import { SelectInput } from "@/components/form/select-input";
import { PrimaryButton, SecondaryButton } from "@/components/button";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  InviteStaffPayload,
  InviteStaffResponse,
} from "@/api/types/staff";
import { INVITEABLE_ROLES, ROLE_LABELS } from "./shared";
import { z } from "zod";

export const inviteStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
  role: z.enum(["scientist", "receptionist"], {
    message: "Please select a role",
  }),
});
export type InviteStaffValues = z.infer<typeof inviteStaffSchema>;

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listUrl: string;
}

const defaultValues: InviteStaffValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "scientist",
};

export function InviteDialog({
  open,
  onOpenChange,
  listUrl,
}: InviteDialogProps) {
  const form = useForm<InviteStaffValues>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues,
  });

  const { trigger, isLoading } = useMutation<
  InviteStaffResponse,
    InviteStaffPayload >
      (endpoint.lab.staff.invite,
      {
        successToast: "Invite sent",
        invalidate: [listUrl],
      });

  useEffect(() => {
    if (!open) form.reset(defaultValues);
  }, [open, form]);

  const onSubmit = async (values: InviteStaffValues) => {
    const res = await trigger({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      phone: values.phone?.trim() || undefined,
    });
    if (!res) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                form={form}
                name="firstName"
                label="First Name *"
                placeholder="Jane"
              />
              <TextInput
                form={form}
                name="lastName"
                label="Last Name *"
                placeholder="Doe"
              />
            </div>

            <SelectInput
              form={form}
              name="role"
              label="Role *"
              placeholder="Select role"
              options={INVITEABLE_ROLES.map((role) => ({
                label: ROLE_LABELS[role],
                value: role,
              }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <TextInput
                form={form}
                name="email"
                label="Email *"
                type="email"
                placeholder="email@ezralabs.ng"
              />
              <TextInput
                form={form}
                name="phone"
                label="Phone"
                placeholder="+234..."
              />
            </div>

            <DialogFooter>
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PermissionButton
                type="submit"
                permission="staff.create"
                fallback="hide"
                isLoading={isLoading}
              >
                Send Invite
              </PermissionButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
