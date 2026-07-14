import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Search,
  Play,
  ArrowRight,
  Zap,
  Flame,
  FlaskConical,
  User,
  Beaker,
  Clock,
  CheckCircle2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApi, useMutation } from "@/hooks/use-api";
import { useMyPermissions } from "@/hooks/use-permissions";
import type {
  AssignmentItem,
  AssignmentListResponse,
  TestOrderItem,
  TestOrderItemStatus,
  TestOrderPriority,
  StartTestPayload,
} from "@/api/types/test-order";
import type { TestCatalogEntry } from "@/api/types/test-catalog";
import endpoint from "@/api/endpoints";

// ── Config ────────────────────────────────────────────────────────────────────

const TABS: (TestOrderItemStatus | "all")[] = [
  "all",
  "assigned",
  "in_progress",
  "completed",
];

const TAB_LABEL: Record<string, string> = {
  all: "All",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
};

const PRIORITY_CONFIG: Record<
  TestOrderPriority,
  { label: string; border: string; badgeCls: string; icon: React.ElementType }
> = {
  stat: {
    label: "Stat",
    border: "border-l-destructive",
    badgeCls: "bg-destructive/15 text-destructive border-destructive/30 border",
    icon: Flame,
  },
  urgent: {
    label: "Urgent",
    border: "border-l-warning",
    badgeCls: "bg-warning/15 text-warning border-warning/30 border",
    icon: Zap,
  },
  routine: {
    label: "Routine",
    border: "border-l-transparent",
    badgeCls: "bg-muted/60 text-muted-foreground border",
    icon: Clock,
  },
};

const STATUS_CONFIG: Record<
  TestOrderItemStatus,
  { label: string; cls: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    cls: "bg-muted/80 text-muted-foreground border",
    icon: Clock,
  },
  assigned: {
    label: "Assigned",
    cls: "bg-info/15 text-info border-info/30 border",
    icon: Clock,
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-warning/15 text-warning border-warning/30 border",
    icon: Beaker,
  },
  completed: {
    label: "Completed",
    cls: "bg-success/15 text-success border-success/30 border",
    icon: CheckCircle2,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

// ── TestCard ──────────────────────────────────────────────────────────────────

function TestCard({
  item,
  canProcess,
  isStarting,
  onOpenStartDialog,
  onEnterResult,
}: {
  item: AssignmentItem;
  canProcess: boolean;
  isStarting: boolean;
  onOpenStartDialog: () => void;
  onEnterResult: () => void;
}) {
  const order = item.testOrder;
  const patient = order.patient;
  const patientName = `${patient.firstName} ${patient.lastName}`.trim();
  const prio = PRIORITY_CONFIG[order.priority];
  const status = STATUS_CONFIG[item.status];
  const StatusIcon = status.icon;
  const PrioIcon = prio.icon;

  return (
    <div
      className={`
        bg-card border border-border rounded-2xl shadow-card overflow-hidden
        border-l-4 ${prio.border}
        transition-all hover:shadow-md
        ${item.status === "in_progress" ? "ring-1 ring-warning/20" : ""}
      `}
    >
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FlaskConical className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base leading-tight">{item.testName}</p>
            {item.samples?.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.samples.join(", ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={`text-[10px] gap-1 ${prio.badgeCls}`}>
            <PrioIcon className="w-2.5 h-2.5" />
            {prio.label}
          </Badge>
          <Badge className={`text-[10px] gap-1 ${status.cls}`}>
            <StatusIcon className="w-2.5 h-2.5" />
            {status.label}
          </Badge>
        </div>
      </div>

      <Separator />

      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <User className="w-3 h-3" />
            Patient
          </p>
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
              ${patient.gender === "Female" ? "bg-pink-500/10 text-pink-600" : "bg-blue-500/10 text-blue-600"}
            `}
            >
              {initials(patientName)}
            </div>
            <div>
              <p className="text-sm font-semibold">{patientName}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {patient.gender ?? "—"}
                {patient.code ? ` · ${patient.code}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Beaker className="w-3 h-3" />
            Parameters ({item.parameters?.length ?? 0})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(item.parameters ?? []).map((p) => (
              <Badge
                key={p._id}
                variant="outline"
                className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground"
              >
                {p.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="px-5 py-3 flex items-center justify-between gap-4 bg-muted/20">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="w-3.5 h-3.5" />
          <span className="font-mono">{order._id.slice(-6).toUpperCase()}</span>
          <span className="opacity-40">·</span>
          <span>
            {new Date(order.date).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canProcess && item.status === "assigned" && (
            <Button
              size="sm"
              variant="outline"
              disabled={isStarting}
              className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={onOpenStartDialog}
            >
              <Play className="w-3.5 h-3.5" />
              Start Test
            </Button>
          )}

          {item.status === "in_progress" && (
            <button
              onClick={onEnterResult}
              className="
                group relative overflow-hidden
                flex items-center gap-2.5 px-4 h-9 rounded-xl
                bg-primary text-primary-foreground
                text-xs font-semibold
                shadow-sm hover:shadow-md
                transition-all duration-200 hover:scale-[1.02]
              "
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <Beaker className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Enter Result</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {item.status === "completed" && (
            <div className="flex items-center gap-1.5 text-xs text-success font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Result submitted
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AssignedTests() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { can } = useMyPermissions();

  const [tab, setTab] = useState<TestOrderItemStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // ── Start Test dialog state ────────────────────────────────────────────────
  const [startTestItem, setStartTestItem] = useState<AssignmentItem | null>(null);
  const [materialQtys, setMaterialQtys] = useState<Record<string, string>>({});

  const assignmentsParams = new URLSearchParams({ page: String(page), limit: "20" });
  if (tab !== "all") assignmentsParams.set("status", tab);
  const { data: assignmentsData, error, isLoading, mutate: refetch } = useApi<AssignmentListResponse>(
    `${endpoint.lab.testOrders.assignments}?${assignmentsParams}`,
  );
  const items = assignmentsData?.data?.docs ?? [];
  const pagination = assignmentsData?.data
    ? {
        totalDocs: assignmentsData.data.totalDocs,
        page: assignmentsData.data.page,
        totalPages: assignmentsData.data.totalPages,
        hasNextPage: assignmentsData.data.hasNextPage,
        hasPrevPage: assignmentsData.data.hasPrevPage,
      }
    : null;

  const { trigger: startTest, isLoading: isStarting } = useMutation<TestOrderItem, StartTestPayload>(
    "test-orders/start-test",
    { skipErrorHandling: true, invalidate: [endpoint.lab.testOrders.assignments] },
  );

  // Fetch analysis materials for the selected test catalog when dialog opens
  const { data: catalogData, isLoading: isLoadingCatalog } = useApi<TestCatalogEntry>(
    startTestItem ? endpoint.lab.testCatalog.get(startTestItem.testCatalog) : null,
  );
  const analysisMaterials = (catalogData?.data?.materials ?? []).filter(
    (m) => m.phase === "analysis",
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStartTest = async () => {
    if (!startTestItem) return;
    const materials = analysisMaterials
      .map((m) => ({
        catalogMaterialId: m._id,
        quantity: parseFloat(materialQtys[m._id] ?? "0"),
      }))
      .filter((m) => m.quantity > 0);

    try {
      await startTest(
        { materials },
        endpoint.lab.testOrders.startTest(startTestItem.testOrder._id, startTestItem._id),
      );
      await refetch();
      setStartTestItem(null);
      setMaterialQtys({});
      toast({
        title: "Test started",
        description: `${startTestItem.testName} is now In Progress.`,
      });
    } catch {
      toast({
        title: "Couldn't start test",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEnterResult = (item: AssignmentItem) => {
    const patient = item.testOrder.patient;
    navigate("/lab/result-entry", {
      state: {
        orderId: item.testOrder._id,
        itemId: item._id,
        testName: item.testName,
        patientName: `${patient.firstName} ${patient.lastName}`.trim(),
        patientId: patient._id,
        priority: item.testOrder.priority,
      },
    });
  };

  const handleTabChange = (value: string) => {
    setTab(value as TestOrderItemStatus | "all");
    setPage(1);
  };

  // Client-side search filter (name / test name)
  const filtered = search.trim()
    ? items.filter((item) => {
        const q = search.toLowerCase();
        const name = `${item.testOrder.patient.firstName} ${item.testOrder.patient.lastName}`.toLowerCase();
        return name.includes(q) || item.testName.toLowerCase().includes(q);
      })
    : items;

  const urgentItems = items.filter(
    (i) =>
      (i.testOrder.priority === "urgent" || i.testOrder.priority === "stat") &&
      i.status !== "completed",
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        Loading assigned tests…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center bg-card border border-border rounded-2xl">
        <AlertTriangle className="w-8 h-8 text-destructive/60" />
        <p className="text-sm text-muted-foreground">
          Couldn't load your assigned tests.
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Assigned Tests</h2>
        <p className="text-sm text-muted-foreground">
          {pagination?.totalDocs ?? 0} item
          {(pagination?.totalDocs ?? 0) !== 1 ? "s" : ""} assigned to you
        </p>
      </div>

      {urgentItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/20 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">
              {urgentItems.length} urgent / stat item
              {urgentItems.length > 1 ? "s" : ""} need immediate attention
            </p>
            <p className="text-xs text-destructive/70 mt-0.5">
              {urgentItems
                .map(
                  (i) =>
                    `${i.testOrder.patient.firstName} ${i.testOrder.patient.lastName} – ${i.testName}`,
                )
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or test type…"
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={tab} onValueChange={handleTabChange} className="flex-shrink-0">
          <TabsList className="h-9">
            {TABS.map((t) => (
              <TabsTrigger key={t} value={t} className="gap-1.5 text-xs px-3">
                {TAB_LABEL[t]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center bg-card border border-border rounded-2xl">
          <FlaskConical className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No {tab !== "all" ? TAB_LABEL[tab].toLowerCase() : ""} tests found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <TestCard
              key={item._id}
              item={item}
              canProcess={can("tests.process")}
              isStarting={isStarting && startTestItem?._id === item._id}
              onOpenStartDialog={() => {
                setStartTestItem(item);
                setMaterialQtys({});
              }}
              onEnterResult={() => handleEnterResult(item)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── START TEST DIALOG ── */}
      <Dialog
        open={!!startTestItem}
        onOpenChange={(v) => {
          if (!v) {
            setStartTestItem(null);
            setMaterialQtys({});
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary" />
              Start Test
            </DialogTitle>
          </DialogHeader>

          {startTestItem && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Starting:{" "}
                <span className="font-medium text-foreground">
                  {startTestItem.testName}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Patient:{" "}
                {startTestItem.testOrder.patient.firstName}{" "}
                {startTestItem.testOrder.patient.lastName}
              </p>
            </div>
          )}

          <div className="space-y-3 py-1">
            {isLoadingCatalog && (
              <p className="text-sm text-muted-foreground">Loading materials…</p>
            )}

            {!isLoadingCatalog && analysisMaterials.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No analysis materials required. Click Start to proceed.
              </p>
            )}

            {!isLoadingCatalog && analysisMaterials.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Analysis Materials Used
                </Label>
                {analysisMaterials.map((m) => (
                  <div key={m._id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {m.inventoryItem.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.inventoryItem.unit} · {m.inventoryItem.quantityOnHand} on hand
                      </p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="Qty"
                      className="w-20 h-8 text-sm text-right"
                      value={materialQtys[m._id] ?? ""}
                      onChange={(e) =>
                        setMaterialQtys((prev) => ({
                          ...prev,
                          [m._id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStartTestItem(null);
                setMaterialQtys({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartTest}
              disabled={isStarting || isLoadingCatalog}
              className="gap-1.5"
            >
              <Play className="w-4 h-4" />
              {isStarting ? "Starting…" : "Start Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
