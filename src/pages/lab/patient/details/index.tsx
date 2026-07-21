import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  TrendingUp,
  FlaskConical,
  ReceiptText,
} from "lucide-react";
import { PortalAccessBadge } from "@/components/lab/PortalAccessBadge";
import { PortalActionMenu } from "@/components/lab/PortalActionMenu";
<<<<<<< HEAD
=======
import { usePortalAccess } from "@/hooks/use-portal-access";
>>>>>>> origin/main
import { derivePortalAccess } from "@/lib/utils";
import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
<<<<<<< HEAD
import type {
  GrantPortalAccessPayload,
  ResendPortalInvitePayload,
} from "@/api/types/lab";
=======
>>>>>>> origin/main
import type { Patient } from "@/api/types/patients";
import type { TestOrderListResponse } from "@/api/types/test-order";
import { OrderTable } from "@/components/lab/OrderTable";
import { AppointmentTable } from "@/components/lab/appointments-table";
import { EditPatientSheet } from "./edit-sheet";


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

  const { data: patientData, isLoading, mutate: refetch } = useApi<Patient>(
    patientId ? endpoint.lab.patients.get(patientId) : null,
  );
  const patient = patientData?.data ?? null;
  const { data: patientOrdersData } = useApi<TestOrderListResponse>(
    patientId ? `${endpoint.lab.testOrders.list}?patient=${patientId}&page=1` : null,
  );
  const patientOrders = patientOrdersData?.data?.docs ?? [];
  const portalInvalidate = patientId ? [endpoint.lab.patients.get(patientId)] : [];
  const grantMutation = useMutation<unknown, GrantPortalAccessPayload>(endpoint.lab.invite, {
    successToast: "Portal access granted",
    invalidate: portalInvalidate,
  });
  const resendMutation = useMutation<unknown, ResendPortalInvitePayload>(endpoint.lab.resendInvite, {
    successToast: "Invite resent",
    invalidate: portalInvalidate,
  });
  const revokeMutation = useMutation<unknown, void>("portal-access/revoke", {
    method: "DELETE",
    successToast: "Access revoked",
    invalidate: portalInvalidate,
  });
  const grant = async (identifier: string) => {
    const res = await grantMutation.trigger({ identifier, access_type: "patient" });
    if (!res) return null;
    return res.data;
  };
  const resend = async (identifier: string) => {
    const res = await resendMutation.trigger({ type: "patient", identifier });
    if (!res) return null;
    return res.data;
  };
  const revoke = async (identifier: string) => {
    const res = await revokeMutation.trigger(
      undefined,
      endpoint.lab.revokeInvite("patient", identifier),
    );
    if (!res) return null;
    return res.data;
  };

  const [editOpen, setEditOpen] = useState(false);

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
    .reduce((s, o) => s + (o.totalPrice ?? 0), 0);
  const lastVisit = patientOrders[0]?.date
    ? new Date(patientOrders[0].date).toLocaleDateString()
    : "—";
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

  const handleGrant = (id: string) => grant(id);
  const handleResend = (id: string) => resend(id);
  const handleRevoke = (id: string) => revoke(id);

  const openEdit = () => setEditOpen(true);

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
              className={`text-xs ${patient.status === "active"
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
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
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
                <Row label="Email" value={patient.email ?? "—"} />
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
          <OrderTable filters={{ patient: patientId }} />
        </TabsContent>

        {/* ── Appointments tab ─────────────────────────── */}
        <TabsContent value="appointments" className="mt-4">
          {patientId && (
            <AppointmentTable filters={{ patient: patientId }} />
          )}
        </TabsContent>
      </Tabs>

      {/* ── Edit Patient Sheet ───────────────────────────────── */}
      <EditPatientSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={patient}
        onSuccess={refetch}
      />
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
