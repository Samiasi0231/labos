import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Phone,
  CalendarDays,
  User,
  ClipboardList,
  Plus,
  Activity,
  CheckCircle2,
  Flame,
  Zap,
  TrendingUp,
  FlaskConical,
  ReceiptText,
  Pencil,
  Save,
} from "lucide-react";
import { PortalAccessBadge } from "@/components/lab/PortalAccessBadge";
import { PortalActionMenu } from "@/components/lab/PortalActionMenu";
import { usePatient, useUpdatePatient } from "@/hooks/use-patients";
import { usePortalAccess } from "@/hooks/use-portal-access";
import { derivePortalAccess } from "@/lib/portal-access";
import { useOrders } from "@/context/useOrders";
import { useToast } from "@/hooks/use-toast";
import {
  type OrderStatus,
  type OrderPriority,
  orderTotal,
} from "@/data/orderData";
import type { PatientGender } from "@/api/types/patients"


function PriorityBadge({ priority }: { priority: OrderPriority }) {
  if (priority === "Stat")
    return (
      <Badge className="bg-destructive/15 text-destructive border-destructive/30 border text-xs gap-1">
        <Flame className="w-3 h-3" />
        Stat
      </Badge>
    );
  if (priority === "Urgent")
    return (
      <Badge className="bg-warning/15 text-warning border-warning/30 border text-xs gap-1">
        <Zap className="w-3 h-3" />
        Urgent
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-xs text-muted-foreground">
      Routine
    </Badge>
  );
}

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> =
  {
    pending: {
      label: "Pending",
      cls: "bg-muted/80 text-muted-foreground border",
    },
    sample_collected: {
      label: "Sample Collected",
      cls: "bg-info/15 text-info border-info/30 border",
    },
    in_progress: {
      label: "In Progress",
      cls: "bg-warning/15 text-warning border-warning/30 border",
    },
    completed: {
      label: "Completed",
      cls: "bg-success/15 text-success border-success/30 border",
    },
    cancelled: {
      label: "Cancelled",
      cls: "bg-muted/50 text-muted-foreground border",
    },
  };

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = ORDER_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`text-xs ${cfg.cls}`}>
      {cfg.label}
    </Badge>
  );
}

function calculateAge(dob: string): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  return `${m < 0 || (m === 0 && now.getDate() < birth.getDate()) ? age - 1 : age} yrs`;
}

export default function PatientDetail() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { orders } = useOrders(); 
  const { toast } = useToast();

  const { patient, isLoading, refetch } = usePatient(patientId ?? null);
  const { updatePatient } = useUpdatePatient();
  const { grant, resend, revoke } = usePortalAccess(
    "patient",
    patientId ? [`/patients/${patientId}`] : [],
  );

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "" as PatientGender | "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "NG",
  });

  useEffect(() => {
    if (patient) {
      setEditForm({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: patient.dob ? patient.dob.slice(0, 10) : "",
        gender: patient.gender,
        line1: patient.address?.line1 ?? "",
        line2: patient.address?.line2 ?? "",
        city: patient.address?.city ?? "",
        state: patient.address?.state ?? "",
        country: patient.address?.country ?? "NG",
      });
    }
  }, [patient]);

  const patientOrders = useMemo(
    () =>
      orders
        .filter((o) => o.patientId === patientId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders, patientId],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-muted-foreground">Loading patient…</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <User className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Patient not found.</p>
        <Button variant="outline" onClick={() => navigate("/lab/patients")}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Patients
        </Button>
      </div>
    );
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;
  const access = derivePortalAccess(patient.user);
  const totalOrders = patientOrders.length;
  const completedOrders = patientOrders.filter(
    (o) => o.status === "completed",
  ).length;
  const pendingOrders = patientOrders.filter((o) =>
    ["pending", "in_progress", "sample_collected"].includes(o.status),
  ).length;
  const totalSpend = patientOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + orderTotal(o), 0);
  const lastVisit = patientOrders[0]?.createdAt ?? "—";
  const allItems = patientOrders.flatMap((o) => o.items);
  const totalTests = allItems.length;

  const handleNewOrder = () => {
    navigate("/lab/tests", {
      state: {
        openCreate: true,
        patientId: patient._id,
        patientName: fullName,
      },
    });
  };

  const handleGrant = async (id: string) => {
    await grant(id);
  };
  const handleResend = async (id: string) => {
    await resend(id);
  };
  const handleRevoke = async (id: string) => {
    await revoke(id);
  };

  const openEdit = () => setEditOpen(true);

  const handleSave = async () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.gender) {
      toast({
        title: "Required fields missing",
        description: "First name, last name and gender are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      await updatePatient(patient._id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        gender: editForm.gender as PatientGender,
        dob: editForm.dob || undefined,
        address: {
          line1: editForm.line1,
          line2: editForm.line2 || undefined,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
        },
      });
      await refetch();
      setEditOpen(false);
      toast({
        title: "Patient updated",
        description: `${editForm.firstName} ${editForm.lastName}'s record has been updated.`,
      });
    } catch {
      toast({
        title: "Update failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground -ml-2"
        onClick={() => navigate("/lab/patients")}
      >
        <ChevronLeft className="w-4 h-4" />
        Patients
      </Button>

      {/* Hero header */}
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
          <span className="text-xl font-bold text-primary">
            {fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <Badge
              variant="outline"
              className={`text-xs ${
                patient.status === "active"
                  ? "bg-success/10 text-success border-success/30"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {patient.status === "active" ? "Active" : "Inactive"}
            </Badge>
            <PortalAccessBadge access={access} />
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
            <span className="font-mono text-xs bg-muted/60 px-2 py-0.5 rounded-md">
              {patient.code}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
            </span>
            {patient.dob && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                {calculateAge(patient.dob)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {patient.phone}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button
            className="gap-2 flex-1 sm:flex-none"
            onClick={handleNewOrder}
          >
            <Plus className="w-4 h-4" />
            New Order
          </Button>
          <PortalActionMenu
            id={patient._id}
            name={fullName}
            email={patient.email}
            portalAccess={access}
            onGrant={handleGrant}
            onResend={handleResend}
            onRevoke={handleRevoke}
            onEdit={openEdit}
            editLabel="Edit Patient"
            variant="menu"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Orders",
            value: String(totalOrders),
            icon: ClipboardList,
            cls: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Completed",
            value: String(completedOrders),
            icon: CheckCircle2,
            cls: "text-success",
            bg: "bg-success/10",
          },
          {
            label: "In Progress",
            value: String(pendingOrders),
            icon: Activity,
            cls: "text-warning",
            bg: "bg-warning/10",
          },
          {
            label: "Total Spend",
            value: `₦${(totalSpend / 1000).toFixed(1)}k`,
            icon: ReceiptText,
            cls: "text-info",
            bg: "bg-info/10",
          },
        ].map(({ label, value, icon: Icon, cls, bg }) => (
          <Card key={label} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-2xl font-bold ${label !== "Total Orders" ? cls : ""}`}
                  >
                    {value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </div>
                <div
                  className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${cls}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5">
            Orders
            {totalOrders > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                {totalOrders}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Overview tab ─────────────────────────────── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardHeader className="pb-3 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Patient Information
                  </CardTitle>
                  <Button
                    variant="link"
                    className="h-auto py-0 px-0 text-[12px]"
                    onClick={openEdit}
                  >
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <Row label="Full Name" value={fullName} />
                <Row label="Patient Code" value={patient.code} mono />
                <Row
                  label="Gender"
                  value={
                    patient.gender.charAt(0).toUpperCase() +
                    patient.gender.slice(1)
                  }
                />
                <Row
                  label="Date of Birth"
                  value={patient.dob ? patient.dob.slice(0, 10) : "—"}
                />
                <Row label="Age" value={calculateAge(patient.dob)} />
                <Row label="Phone" value={patient.phone} />
                <Row
                  label="Address"
                  value={
                    patient.address?.line1
                      ? `${patient.address.line1}, ${patient.address.city}`
                      : "—"
                  }
                />
                <Row
                  label="Registered"
                  value={new Date(patient.createdAt).toLocaleDateString()}
                />
                <Row
                  label="Status"
                  value={patient.status === "active" ? "Active" : "Inactive"}
                  highlight={patient.status === "active"}
                />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-3 pt-4 px-5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">
                <Row label="Last Visit" value={lastVisit} />
                <Row label="Total Orders" value={String(totalOrders)} />
                <Row label="Tests Performed" value={String(totalTests)} />
                <Row label="Orders Completed" value={String(completedOrders)} />
                <Row label="Active Orders" value={String(pendingOrders)} />
                <Row
                  label="Total Spend"
                  value={`₦${totalSpend.toLocaleString()}`}
                />
              </CardContent>
              {totalTests > 0 && (
                <>
                  <Separator />
                  <CardContent className="px-5 py-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Tests Ordered
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set(allItems.map((i) => i.testName))].map(
                        (name) => (
                          <Badge
                            key={name}
                            variant="outline"
                            className="text-[11px] gap-1 text-muted-foreground px-2"
                          >
                            <FlaskConical className="w-2.5 h-2.5" />
                            {name}
                          </Badge>
                        ),
                      )}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* ── Orders tab ───────────────────────────────── */}
        <TabsContent value="orders" className="mt-4">
          {patientOrders.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No orders yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Create the first test order for this patient.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 mt-2"
                  onClick={handleNewOrder}
                >
                  <Plus className="w-4 h-4" />
                  New Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="pl-6">Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Tests
                        </TableHead>
                        <TableHead className="hidden md:table-cell text-right pr-6">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className={`hover:bg-muted/20 transition-colors cursor-pointer ${
                            order.priority === "Stat"
                              ? "border-l-2 border-l-destructive"
                              : order.priority === "Urgent"
                                ? "border-l-2 border-l-warning"
                                : ""
                          }`}
                          onClick={() => navigate("/lab/tests")}
                        >
                          <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                            {order.id}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {order.createdAt}
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={order.priority} />
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {order.items.slice(0, 2).map((i) => (
                                <Badge
                                  key={i.id}
                                  variant="outline"
                                  className="text-[10px] px-1.5 text-muted-foreground truncate max-w-[90px]"
                                >
                                  {i.testName}
                                </Badge>
                              ))}
                              {order.items.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 text-muted-foreground"
                                >
                                  +{order.items.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right pr-6 font-semibold text-sm">
                            ₦{orderTotal(order).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="px-6 py-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {totalOrders} order{totalOrders !== 1 ? "s" : ""}
                  </span>
                  <Button
                    variant="link"
                    className="h-auto py-0 px-0 text-[12px]"
                    onClick={() => navigate("/lab/tests")}
                  >
                    View all in Test Orders
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Edit Patient Sheet ───────────────────────────────── */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-5">
            <SheetTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" />
              Edit Patient
            </SheetTitle>
            <p className="text-xs text-muted-foreground font-mono">
              {patient.code}
            </p>
          </SheetHeader>

          <div className="space-y-5 pb-4">
            {/* Personal */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Personal Information
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(v) =>
                      setEditForm((prev) => ({
                        ...prev,
                        gender: v as PatientGender,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date of Birth</Label>
                  <Input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, dob: e.target.value }))
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Phone and email can't be changed here — contact details are
                locked to preserve uniqueness across the lab.
              </p>
            </section>

            <Separator />

            {/* Address */}
            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Address
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">Street Address</Label>
                <Input
                  value={editForm.line1}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, line1: e.target.value }))
                  }
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Address Line 2</Label>
                <Input
                  value={editForm.line2}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, line2: e.target.value }))
                  }
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">City</Label>
                  <Input
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="City"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">State</Label>
                  <Select
                    value={editForm.state}
                    onValueChange={(v) =>
                      setEditForm((prev) => ({ ...prev, state: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Lagos",
                        "Abuja",
                        "Rivers",
                        "Kano",
                        "Oyo",
                        "Enugu",
                        "Kaduna",
                        "Ogun",
                        "Imo",
                        "Anambra",
                      ].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>

          <SheetFooter className="pt-4 border-t border-border gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1 gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Row helper ───────────────────────────────────────────────

function Row({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right ${mono ? "font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded" : ""} ${highlight ? "text-success font-medium" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
