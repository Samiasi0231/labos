import { useNavigate } from "react-router-dom";
import { UserPlus, Plus, Users, ClipboardList, IdCard, CheckCircle2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useMyPermissions } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  DashboardData,
  DashboardWorkListItem,
  DashboardResultUpdate,
  DashboardActivityItem,
  LabTestOrders,
  ScientistTestOrders,
} from "@/api/types/dashboard";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString()}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function actorName(item: DashboardActivityItem): string {
  if (typeof item.actor === "object") {
    return `${item.actor.firstName} ${item.actor.lastName}`.trim();
  }
  return "Unknown";
}

function personName(ref: DashboardWorkListItem["patient"] | DashboardResultUpdate["patient"]): string {
  if (typeof ref === "object") return `${ref.firstName} ${ref.lastName}`.trim();
  return "—";
}

function itemTestName(ref: DashboardResultUpdate["testOrderItem"]): string {
  if (typeof ref === "object") return ref.testName;
  return "—";
}

function returnedNote(item: DashboardResultUpdate): string | null {
  const entry = [...(item.timelines ?? [])].reverse().find((t) => t.status === "returned");
  return entry?.note ?? null;
}

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skel({ w = "100%", h = "14px" }: { w?: string; h?: string }) {
  return (
    <div
      style={{ width: w, height: h, borderRadius: 4 }}
      className="bg-muted animate-pulse"
    />
  );
}

// ── Status config ─────────────────────────────────────────────────────────────

const WORKLIST_STATUS: Record<string, { label: string; cls: string; dotCls: string }> = {
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground border", dotCls: "bg-muted-foreground/40" },
  assigned: { label: "Assigned", cls: "bg-info/15 text-info border-info/30 border", dotCls: "bg-info" },
  in_progress: { label: "In Progress", cls: "bg-primary/10 text-primary border border-primary/30", dotCls: "bg-warning" },
  completed: { label: "Completed", cls: "bg-success/15 text-success border-success/30 border", dotCls: "bg-success" },
};

const RESULT_UPDATE_STATUS: Record<string, { label: string; cls: string }> = {
  returned: { label: "Returned", cls: "bg-destructive/15 text-destructive border-destructive/30 border" },
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground border" },
};

// ── Breakdown definitions ─────────────────────────────────────────────────────

const ORDERS_MANAGER = [
  { key: "pending", label: "Pending", tint: null },
  { key: "sampleCollected", label: "Sample Collected", tint: "info" },
  { key: "inProgress", label: "In Progress", tint: "primary" },
  { key: "completed", label: "Completed", tint: "success" },
  { key: "cancelled", label: "Cancelled", tint: "destructive" },
] as const;

const ORDERS_SCIENTIST = [
  { key: "pending", label: "Pending", tint: null },
  { key: "assigned", label: "Assigned", tint: "info" },
  { key: "inProgress", label: "In Progress", tint: "primary" },
  { key: "completed", label: "Completed", tint: "success" },
] as const;

const RESULTS_MANAGER = [
  { key: "submitted", label: "Submitted", tint: "warning" },
  { key: "returned", label: "Returned", tint: "destructive" },
  { key: "approved", label: "Approved", tint: "primary" },
  { key: "released", label: "Released", tint: "success" },
] as const;

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LabDashboard() {
  const navigate = useNavigate();
  const { can, role, isLoading: isPermLoading } = useMyPermissions();

  const { data: dashRes, isLoading: isDashLoading } = useApi<DashboardData>(endpoint.lab.dashboard);
  const dash = dashRes?.data;
  const isLoading = isPermLoading || isDashLoading;

  // ── Permission flags ─────────────────────────────────────────────────────────
  const isScientist = can("tests.read_own") && !can("tests.read");
  const showBannerActions = can("patients.create");
  const showStatCards = can("patients.read");
  const showScientistCards = isScientist;
  const showTestOrdersCard = can("tests.read");
  const showResultsCard = can("results.read");
  const showAppointments = can("appointments.read");
  const showInventory = can("inventory.read");
  const showFinance = can("finance.read");
  const showActivity = can("activity.read");

  // ── Role summary line ────────────────────────────────────────────────────────
  const roleSummaryLine = (() => {
    if (isScientist) {
      const orders = dash?.testOrders as ScientistTestOrders | undefined;
      return `You have ${orders?.pending ?? 0} pending tests and ${orders?.inProgress ?? 0} in progress today.`;
    }
    if (role === "receptionist") {
      const appt = dash?.appointments;
      return `You have ${appt?.todayTotal ?? 0} appointments today and ${appt?.upcoming ?? 0} upcoming this week.`;
    }
    const orders = dash?.testOrders as LabTestOrders | undefined;
    const active = (orders?.pending ?? 0) + (orders?.inProgress ?? 0);
    return `${active} test orders are active across the lab today.`;
  })();

  // ── Stat cards ───────────────────────────────────────────────────────────────
  const statCards = (() => {
    const overview = dash?.overview;
    if (!overview) return [];
    const cards: { label: string; value: string; icon: React.ReactNode }[] = [];
    cards.push({ label: "Total Patients", value: overview.totalPatients.toLocaleString(), icon: <Users className="w-5 h-5 text-primary" /> });
    if (overview.totalTestOrders !== undefined)
      cards.push({ label: "Total Test Orders", value: overview.totalTestOrders.toLocaleString(), icon: <ClipboardList className="w-5 h-5 text-primary" /> });
    if (overview.activeStaff !== undefined)
      cards.push({ label: "Active Staff", value: overview.activeStaff.toLocaleString(), icon: <IdCard className="w-5 h-5 text-primary" /> });
    return cards;
  })();

  // ── Test orders breakdown rows ───────────────────────────────────────────────
  const ordersBreakdown = (() => {
    const orders = dash?.testOrders;
    if (!orders) return [];
    const defs = isScientist ? ORDERS_SCIENTIST : ORDERS_MANAGER;
    const vals = defs.map((d) => (orders as Record<string, number>)[d.key] ?? 0);
    const max = Math.max(...vals, 1);
    return defs.map((d, i) => ({
      label: d.label,
      count: vals[i],
      pct: (vals[i] / max) * 100,
      color: d.tint ? `hsl(var(--${d.tint}))` : "hsl(var(--muted-foreground) / 0.4)",
    }));
  })();

  // ── Results breakdown rows ───────────────────────────────────────────────────
  const resultsBreakdown = (() => {
    const results = dash?.results;
    if (!results) return [];
    return RESULTS_MANAGER.map((d) => ({
      label: d.label,
      count: (results as Record<string, number>)[d.key] ?? 0,
      color: `hsl(var(--${d.tint}))`,
    }));
  })();

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fade-in">

      {/* Welcome Banner */}
      <div className="gradient-hero rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
        <div>
          <p className="text-[12px] font-medium text-white/80 mb-1">{todayLabel()}</p>
          <p className="text-[22px] font-bold">Good morning, {dash?.greeting?.firstName ?? "…"}</p>
          <p className="mt-1 text-[13.5px] text-white/90">{roleSummaryLine}</p>
        </div>
        {showBannerActions && (
          <div className="flex gap-2.5 flex-shrink-0">
            <button
              onClick={() => navigate("/lab/register")}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg border border-white/50 bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register Patient
            </button>
            <button
              onClick={() => navigate("/lab/tests")}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-lg border border-white/50 bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Test
            </button>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      {showStatCards && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-[18px]">
                <Skel h="44px" />
              </div>
            ))
            : statCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-border bg-card p-[18px] flex items-center gap-3.5">
                <span className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {card.icon}
                </span>
                <div>
                  <p className="text-[24px] font-bold leading-none tracking-tight">{card.value}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{card.label}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Scientist: My Worklist + Result Updates */}
      {showScientistCards && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 items-start">

          {/* My Worklist */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">My Worklist</p>
              <button
                onClick={() => navigate("/lab/assigned")}
                className="text-[12.5px] font-semibold text-primary hover:underline"
              >
                View All →
              </button>
            </div>
            {isLoading ? (
              <div className="flex flex-col gap-3"><Skel /><Skel w="92%" /><Skel w="96%" /></div>
            ) : !dash?.workList?.length ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No items in your worklist.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {dash.workList.map((item) => {
                  const cfg = WORKLIST_STATUS[item.status] ?? WORKLIST_STATUS.pending;
                  return (
                    <div key={item._id} className="flex items-center gap-3 py-2.5">
                      <span className={`w-[22px] h-[22px] rounded-full flex-shrink-0 ${cfg.dotCls}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-semibold truncate">{personName(item.patient)}</p>
                        <p className="text-[12px] text-muted-foreground truncate">{item.testName}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap flex-shrink-0 ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Result Updates */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-3">Result Updates</p>
            {isLoading ? (
              <div className="flex flex-col gap-3"><Skel w="95%" /><Skel w="88%" /></div>
            ) : !dash?.resultUpdates?.length ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <p className="text-[13px]">No results need attention</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {dash.resultUpdates.map((item) => {
                  const cfg = RESULT_UPDATE_STATUS[item.status] ?? RESULT_UPDATE_STATUS.draft;
                  const note = returnedNote(item);
                  return (
                    <div key={item._id} className="py-2.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold truncate">{personName(item.patient)}</p>
                          <p className="text-[12px] text-muted-foreground truncate">{itemTestName(item.testOrderItem)}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap flex-shrink-0 ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {note && (
                        <p className="mt-1.5 text-[11.5px] italic text-muted-foreground">"{note}"</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">

        {/* Test Orders */}
        {showTestOrdersCard && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-3.5">Test Orders</p>
            {isLoading ? (
              <div className="flex flex-col gap-2.5"><Skel /><Skel w="90%" /><Skel w="95%" /></div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {ordersBreakdown.map((row) => (
                  <div key={row.label} className="flex items-center gap-2.5">
                    <span className="text-[12.5px] text-muted-foreground w-[130px] flex-shrink-0">{row.label}</span>
                    <div className="flex-1 h-[7px] rounded-full bg-muted overflow-hidden">
                      <div style={{ width: `${row.pct}%`, height: "100%", background: row.color, borderRadius: 999 }} />
                    </div>
                    <span className="text-[13px] font-bold w-6 text-right">{row.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {showResultsCard && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-3.5">Results</p>
            {isLoading ? (
              <div className="flex flex-col gap-2.5"><Skel /><Skel w="85%" /></div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {resultsBreakdown.map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px]">
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: row.color, display: "inline-block", flexShrink: 0 }} />
                      {row.label}
                    </span>
                    <span className="text-[13px] font-bold">{row.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments */}
        {showAppointments && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-3.5">Appointments</p>
            {isLoading ? (
              <div className="grid grid-cols-3 gap-2.5"><Skel h="56px" /><Skel h="56px" /><Skel h="56px" /></div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-primary/[0.08] border border-primary/25 rounded-lg p-2.5 text-center">
                  <span className="inline-flex text-[9.5px] font-bold uppercase tracking-wide text-primary bg-primary/15 rounded-full px-1.5 py-[1px] mb-1.5">
                    Today
                  </span>
                  <p className="text-[20px] font-bold leading-none">{dash?.appointments?.todayTotal ?? 0}</p>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5">Total</p>
                </div>
                <div className="border border-border rounded-lg p-2.5 text-center">
                  <p className="text-[20px] font-bold text-success leading-none mt-3">{dash?.appointments?.todayConfirmed ?? 0}</p>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5">Confirmed</p>
                </div>
                <div className="border border-border rounded-lg p-2.5 text-center">
                  <p className="text-[20px] font-bold leading-none mt-3">{dash?.appointments?.upcoming ?? 0}</p>
                  <p className="text-[10.5px] text-muted-foreground mt-0.5">Upcoming (7d)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inventory Alerts */}
        {showInventory && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-3.5">Inventory Alerts</p>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2.5"><Skel h="52px" /><Skel h="52px" /></div>
            ) : dash?.inventory?.lowStock === 0 && dash?.inventory?.outOfStock === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                All stock levels are healthy — nothing needs attention.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-warning/[0.08] border border-warning/30 rounded-lg p-3">
                  <p className="text-[22px] font-bold leading-none" style={{ color: "hsl(var(--warning-foreground))" }}>
                    {dash?.inventory?.lowStock ?? 0}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">Low Stock</p>
                </div>
                <div className="bg-destructive/[0.08] border border-destructive/30 rounded-lg p-3">
                  <p className="text-[22px] font-bold text-destructive leading-none">
                    {dash?.inventory?.outOfStock ?? 0}
                  </p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">Out of Stock</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Finance */}
        {showFinance && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold mb-3.5">Finance — This Month</p>
            {isLoading ? (
              <div className="grid grid-cols-3 gap-2.5"><Skel h="50px" /><Skel h="50px" /><Skel h="50px" /></div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <p className="text-[17px] font-bold leading-none">{fmtCurrency(dash?.finance?.revenue ?? 0)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Revenue</p>
                </div>
                <div>
                  <p className="text-[17px] font-bold leading-none">{fmtCurrency(dash?.finance?.expenses ?? 0)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Expenses</p>
                </div>
                <div>
                  <p className={`text-[17px] font-bold leading-none ${(dash?.finance?.net ?? 0) >= 0 ? "text-success" : "text-destructive"}`}>
                    {fmtCurrency(dash?.finance?.net ?? 0)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Net</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity — spans full width */}
        {showActivity && (
          <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2 xl:col-span-3">
            <p className="text-sm font-semibold mb-3.5">Recent Activity</p>
            {isLoading ? (
              <div className="flex flex-col gap-3"><Skel w="80%" /><Skel w="70%" /><Skel w="75%" /></div>
            ) : !dash?.recentActivity?.length ? (
              <p className="text-[13px] text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {dash.recentActivity.map((item) => (
                  <div key={item._id} className="flex gap-2.5 py-2.5">
                    <span className="w-[7px] h-[7px] rounded-full bg-primary flex-shrink-0 mt-[6px]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px]">
                        <b>{actorName(item)}</b>{" "}
                        <span className="text-muted-foreground">
                          {item.details ?? `${item.action} ${item.resource}`}
                        </span>
                      </p>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5">{relativeTime(item.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
