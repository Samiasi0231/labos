import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Stethoscope, Building, Phone, Mail } from "lucide-react";
import { PortalAccessBadge } from "@/components/lab/PortalAccessBadge";
import { PortalActionMenu } from "@/components/lab/PortalActionMenu";
import { useToast } from "@/hooks/use-toast";
import { useApi, useMutation } from "@/hooks/use-api";
import { derivePortalAccess } from "@/lib/utils";
import endpoint from "@/api/endpoints";
import type { DoctorListResponse, CreateDoctorPayload } from "@/api/types/doctors";
import type {
  GrantPortalAccessPayload,
  ResendPortalInvitePayload,
} from "@/api/types/lab";

const SPECIALTIES = [
  "Internal Medicine",
  "Pediatrics",
  "Cardiology",
  "Obstetrics & Gynecology",
  "Neurology",
  "Surgery",
  "Oncology",
  "Dermatology",
  "Orthopedics",
  "Psychiatry",
];

export default function Doctors() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const listUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", "1");
    params.set("limit", "100");
    return `${endpoint.lab.doctors.list}?${params.toString()}`;
  }, [search]);

  const { data: doctorsData, isLoading } = useApi<DoctorListResponse>(listUrl);
  const doctors = doctorsData?.data?.docs ?? [];

  const createMutation = useMutation(endpoint.lab.doctors.create, {
    successToast: "Doctor registered",
    invalidate: [listUrl],
  });
  const createDoctor = async (payload: CreateDoctorPayload) => {
    const res = await createMutation.trigger(payload);
    if (!res) return null;
    return res.data;
  };

  const grantMutation = useMutation<unknown, GrantPortalAccessPayload>(endpoint.lab.invite, {
    successToast: "Portal access granted",
    invalidate: [listUrl],
  });
  const resendMutation = useMutation<unknown, ResendPortalInvitePayload>(endpoint.lab.resendInvite, {
    successToast: "Invite resent",
    invalidate: [listUrl],
  });
  const revokeMutation = useMutation<unknown, void>("portal-access/revoke", {
    method: "DELETE",
    successToast: "Access revoked",
    invalidate: [listUrl],
  });
  const grant = async (identifier: string) => {
    const res = await grantMutation.trigger({ identifier, access_type: "doctor" });
    if (!res) return null;
    return res.data;
  };
  const resend = async (identifier: string) => {
    const res = await resendMutation.trigger({ type: "doctor", identifier });
    if (!res) return null;
    return res.data;
  };
  const revoke = async (identifier: string) => {
    const res = await revokeMutation.trigger(
      undefined,
      endpoint.lab.revokeInvite("doctor", identifier),
    );
    if (!res) return null;
    return res.data;
  };

  const [form, setForm] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    hospital: "",
  });

  const filtered = doctors; // search now handled server-side via listUrl query

  const handleAdd = async () => {
    if (!form.name.trim() || !form.specialty) {
      toast({
        title: "Validation Error",
        description: "Name and specialty are required.",
        variant: "destructive",
      });
      return;
    }
    const [firstName, ...rest] = form.name.trim().split(" ");
    const lastName = rest.join(" ") || firstName;

    const created = await createDoctor({
      firstName,
      lastName,
      specialty: form.specialty,
      phone: form.phone,
      email: form.email,
      hospital: form.hospital,
    });
    if (!created) return;
    setOpen(false);
    setForm({ name: "", specialty: "", phone: "", email: "", hospital: "" });
  };

  const handleGrant = (id: string) => grant(id);
  const handleResend = (id: string) => resend(id);
  const handleRevoke = (id: string) => revoke(id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Doctors</h2>
          <p className="text-sm text-muted-foreground">
            {doctors.length} registered doctors
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <PermissionButton permission="doctors.create" fallback="hide" className="gap-2" leftIcon={<Plus className="w-4 h-4" />}>
              Register Doctor
            </PermissionButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register Doctor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Dr. Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Specialty <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.specialty}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, specialty: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@hospital.ng"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Hospital / Clinic</Label>
                <Input
                  placeholder="Hospital name"
                  value={form.hospital}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, hospital: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <PermissionButton permission="doctors.create" fallback="hide" onClick={handleAdd}>Register</PermissionButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or hospital..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Doctor</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Specialty
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Hospital
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Contact
                  </TableHead>
                  <TableHead className="hidden sm:table-cell text-center">
                    Requests
                  </TableHead>
                  <TableHead>Portal</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Loading doctors…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No doctors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((doc) => {
                    const fullName = `${doc.firstName} ${doc.lastName}`;
                    const access = derivePortalAccess(doc.user);
                    return (
                      <TableRow
                        key={doc._id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{fullName}</p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {doc.specialty}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {doc.specialty}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5" />
                            {doc.hospital}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground space-y-0.5">
                          <p className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {doc.phone}
                          </p>
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {doc.email}
                          </p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center font-semibold text-primary">
                          {doc.requestsCount}
                        </TableCell>
                        <TableCell>
                          <PortalAccessBadge access={access} />
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex items-center justify-end">
                            <PortalActionMenu
                              id={doc._id}
                              name={fullName}
                              email={doc.email}
                              portalAccess={access}
                              onGrant={handleGrant}
                              onResend={handleResend}
                              onRevoke={handleRevoke}
                              variant="menu"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
