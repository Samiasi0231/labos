import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Mail, Phone } from "lucide-react";
import { StaffMembershipBadge } from "@/components/lab/StaffMembershipBadge";
import { StaffActionMenu } from "@/components/lab/StaffActionMenu";
import { useToast } from "@/hooks/use-toast";
import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  StaffListResponse,
  InviteStaffPayload,
  InviteStaffResponse,
  UpdateStaffRolePayload,
  UpdateStaffStatusPayload,
  UpdateStaffStatusResponse,
  UpdateStaffRoleResponse,
} from "@/api/types/staff";
import type { ResendPortalInvitePayload } from "@/api/types/lab";
import type { StaffRole, StaffStatus } from "@/api/types/enums";

const roleColors: Record<StaffRole, string> = {
  manager: "bg-primary/15 text-primary border-primary/30",
  scientist: "bg-success/15 text-success border-success/30",
  technician: "bg-warning/15 text-warning border-warning/30",
  receptionist: "bg-info/15 text-info border-info/30",
};

const ROLE_LABELS: Record<StaffRole, string> = {
  manager: "Manager",
  scientist: "Lab Scientist",
  technician: "Technician",
  receptionist: "Receptionist",
};

export default function Staff() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("limit", "100");
    const qs = params.toString();
    return qs ? `${endpoint.lab.staff.list}?${qs}` : endpoint.lab.staff.list;
  }, []);

  const { data: staffData, isLoading } = useApi<StaffListResponse>(listUrl);
  const staff = staffData?.data?.docs ?? [];

  const inviteMutation = useMutation<InviteStaffResponse, InviteStaffPayload>(
    endpoint.lab.staff.invite,
    { successToast: "Invite sent", invalidate: [listUrl] },
  );
  const invite = async (payload: InviteStaffPayload) => {
    const res = await inviteMutation.trigger(payload);
    if (!res) return null;
    return res.data;
  };

  const updateRoleMutation = useMutation<UpdateStaffRoleResponse, UpdateStaffRolePayload>(
    "staff/update-role",
    { method: "PATCH", successToast: "Role updated", invalidate: [listUrl] },
  );
  const updateRole = async (membershipId: string, role: StaffRole) => {
    const res = await updateRoleMutation.trigger({ role }, endpoint.lab.staff.updateRole(membershipId));
    if (!res) return null;
    return res.data;
  };

  const updateStatusMutation = useMutation<UpdateStaffStatusResponse, UpdateStaffStatusPayload>(
    "staff/update-status",
    { method: "PATCH", successToast: "Status updated", invalidate: [listUrl] },
  );
  const updateStatus = async (membershipId: string, status: StaffStatus) => {
    const res = await updateStatusMutation.trigger(
      { status },
      endpoint.lab.staff.updateStatus(membershipId),
    );
    if (!res) return null;
    return res.data;
  };

  const removeMutation = useMutation<unknown, void>("staff/remove", {
    method: "DELETE",
    successToast: "Staff member removed",
    invalidate: [listUrl],
  });
  const remove = async (membershipId: string) => {
    const res = await removeMutation.trigger(undefined, endpoint.lab.staff.remove(membershipId));
    if (!res) return null;
    return res.data;
  };

  const resendMutation = useMutation<unknown, ResendPortalInvitePayload>(endpoint.lab.resendInvite, {
    successToast: "Invite resent",
    invalidate: [],
  });
  const resend = async (identifier: string) => {
    const res = await resendMutation.trigger({ type: "staff", identifier });
    if (!res) return null;
    return res.data;
  };

  const [form, setForm] = useState({
    name: "",
    role: "" as StaffRole | "",
    email: "",
    phone: "",
  });

  const filtered = staff.filter((s) => {
    const fullName = `${s.user.firstName} ${s.user.lastName}`.toLowerCase();
    const q = search.toLowerCase();
    return (
      fullName.includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q)
    );
  });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.role) {
      toast({
        title: "Validation Error",
        description: "Name and role are required.",
        variant: "destructive",
      });
      return;
    }
    const [firstName, ...rest] = form.name.trim().split(" ");
    const lastName = rest.join(" ") || firstName;

    const invited = await invite({
      firstName,
      lastName,
      email: form.email,
      role: form.role,
      phone: form.phone || undefined,
    });
    if (!invited) return;
    setOpen(false);
    setForm({ name: "", role: "", email: "", phone: "" });
  };

  const handleResend = (id: string) => resend(id);
  const handleEditRole = (id: string, newRole: StaffRole) => updateRole(id, newRole);
  const handleDeactivate = (id: string) => updateStatus(id, "inactive");
  const handleActivate = (id: string) => updateStatus(id, "active");
  const handleRemove = (id: string) => remove(id);

  const initials = (first: string, last: string) =>
    `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

  const activeCount = staff.filter((s) => s.status === "active").length;
  const pendingCount = staff.filter((s) => s.status === "pending").length;
  const inactiveCount = staff.filter((s) => s.status === "inactive").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Staff Management</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} active · {pendingCount} pending · {inactiveCount}{" "}
            inactive
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, role: v as StaffRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scientist">Lab Scientist</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="email@ezralabs.ng"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+234..."
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Send Invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="shadow-card py-12 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading staff…</p>
        </Card>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <Card
              key={member._id}
              className="shadow-card hover:shadow-elevated transition-all duration-200"
            >
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {initials(member.user.firstName, member.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs mt-1 border ${roleColors[member.role]}`}
                        >
                          {ROLE_LABELS[member.role]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <StaffMembershipBadge status={member.status} />
                        <StaffActionMenu
                          id={member._id}
                          name={`${member.user.firstName} ${member.user.lastName}`}
                          role={member.role}
                          status={member.status}
                          onResend={handleResend}
                          onEditRole={handleEditRole}
                          onDeactivate={handleDeactivate}
                          onActivate={handleActivate}
                          onRemove={handleRemove}
                        />
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        {member.user.email}
                      </p>
                      {member.user.phone && (
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          {member.user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card className="shadow-card py-12 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            No staff members found.
          </p>
        </Card>
      )}
    </div>
  );
}
