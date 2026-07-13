import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, ClipboardList, CalendarDays } from "lucide-react";
import { usePatientProfile, usePatientResults, usePatientOrders } from "@/hooks/use-patient-portal";

// ── Mock appointments (no API yet) ────────────────────────────────────────────

const UPCOMING_APPOINTMENTS = [
  { date: "2026-07-18", time: "10:30 AM", doctor: "Dr. Tunde Bakare", type: "Follow-up Consultation" },
  { date: "2026-07-25", time: "9:00 AM",  doctor: "Dr. Ngozi Eze",    type: "Annual Check-up" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  const d = new Date(iso);
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()] +
    " " + d.getDate() + ", " + d.getFullYear();
}

function getTestName(result: { testOrderItem: unknown }): string {
  const item = result.testOrderItem;
  if (item && typeof item === "object" && "testName" in item) {
    return (item as { testName?: string }).testName ?? "Test Result";
  }
  return "Test Result";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PatientDashboard() {
  const navigate = useNavigate();

  const { profile, isLoading: profileLoading } = usePatientProfile();
  const { results, pagination: resultsPagination, isLoading: resultsLoading } =
    usePatientResults({ limit: 3 });
  const { pagination: ordersPagination, isLoading: ordersLoading } =
    usePatientOrders({ limit: 1 });

  const firstName  = profile?.firstName ?? "";
  const patientCode = profile?.patientCode ?? "";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        {profileLoading ? (
          <Skeleton className="h-7 w-48 mb-1" />
        ) : (
          <h2 className="text-xl font-semibold">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h2>
        )}
        {profileLoading ? (
          <Skeleton className="h-4 w-32 mt-1" />
        ) : patientCode ? (
          <p className="text-sm text-muted-foreground mt-0.5">
            Patient Code{" "}
            <span className="font-mono font-semibold text-foreground">{patientCode}</span>
          </p>
        ) : null}
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: FlaskConical,
            label: "View My Results",
            sub: resultsLoading ? "Loading…" : `${resultsPagination?.totalDocs ?? 0} released`,
            to: "/patient/results",
          },
          {
            icon: ClipboardList,
            label: "My Orders",
            sub: ordersLoading ? "Loading…" : `${ordersPagination?.totalDocs ?? 0} total`,
            to: "/patient/orders",
          },
          {
            icon: CalendarDays,
            label: "My Appointments",
            sub: `${UPCOMING_APPOINTMENTS.length} upcoming`,
            to: "/patient/appointments",
          },
        ].map((card) => (
          <button
            key={card.to}
            onClick={() => navigate(card.to)}
            className="flex flex-col items-start gap-2 p-5 bg-card border border-border rounded-xl shadow-card text-left hover:bg-muted/20 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <card.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-[15px] font-semibold">{card.label}</span>
            <span className="text-xs text-muted-foreground">{card.sub}</span>
          </button>
        ))}
      </div>

      {/* Bottom section */}
      <div className="flex gap-4 flex-wrap items-start">
        {/* Recent Results */}
        <Card className="shadow-card flex-[3] min-w-[320px] p-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-[15px] font-semibold">Recent Results</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/patient/results")}>
              View All
            </Button>
          </div>
          <div className="flex flex-col">
            {resultsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 border-t border-border">
                  <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : results.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-muted-foreground">No results released yet.</p>
            ) : (
              results.map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => navigate(`/patient/results/${r._id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{getTestName(r)}</p>
                      <p className="text-xs text-muted-foreground">
                        Released {r.releasedAt ? fmtDate(r.releasedAt) : "—"}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success/15 text-success border-success/30 border text-xs shrink-0">
                    Released
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Appointments — stays mock until API exists */}
        <Card className="shadow-card flex-[2] min-w-[260px] p-0">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-[15px] font-semibold">Upcoming Appointments</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/patient/appointments")}>
              View All
            </Button>
          </div>
          <div className="flex flex-col">
            {UPCOMING_APPOINTMENTS.map((a, i) => (
              <div key={i} className="px-5 py-3 border-t border-border">
                <p className="text-sm font-semibold">
                  {fmtDate(a.date)} · {a.time}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {a.doctor} — {a.type}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
