import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, Search, Play, ArrowRight, Zap, Flame,
  FlaskConical, User, Beaker, Clock, CheckCircle2, CalendarClock,
} from "lucide-react";
import { useOrders } from "@/context/useOrders";
import { type ItemStatus, type OrderPriority } from "@/data/orderData";
import { useToast } from "@/hooks/use-toast";

// ─── Simulated logged-in scientist ───────────────────────────
const MY_SCIENTIST_ID   = "STF-002";
const MY_SCIENTIST_NAME = "Dr. Chidi Nwosu";

// ─── Types ────────────────────────────────────────────────────

interface WorklistItem {
  orderId:       string;
  itemId:        string;
  catalogTestId: string;
  testName:      string;
  patientId:     string;
  patientName:   string;
  patientGender: "Male" | "Female";
  priority:      OrderPriority;
  status:        ItemStatus;
  params:        string[];
  sampleType:    string;
  container:     string;
  createdAt:     string;
}

// ─── Helpers ──────────────────────────────────────────────────

const TABS: (ItemStatus | "All")[] = ["All", "pending", "in_progress", "completed"];
const TAB_LABEL: Record<string, string> = {
  All: "All", pending: "Pending", in_progress: "In Progress", completed: "Completed",
};

const PRIORITY_CONFIG: Record<OrderPriority, { label: string; border: string; badgeCls: string; icon: React.ElementType }> = {
  Stat:    { label: "Stat",    border: "border-l-destructive", badgeCls: "bg-destructive/15 text-destructive border-destructive/30 border", icon: Flame },
  Urgent:  { label: "Urgent",  border: "border-l-warning",     badgeCls: "bg-warning/15 text-warning border-warning/30 border",             icon: Zap },
  Routine: { label: "Routine", border: "border-l-transparent", badgeCls: "bg-muted/60 text-muted-foreground border",                        icon: Clock },
};

const STATUS_CONFIG: Record<ItemStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pending:     { label: "Pending",     cls: "bg-muted/80 text-muted-foreground border",              icon: Clock },
  in_progress: { label: "In Progress", cls: "bg-info/15 text-info border-info/30 border",            icon: Beaker },
  completed:   { label: "Completed",   cls: "bg-success/15 text-success border-success/30 border",   icon: CheckCircle2 },
};

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Test item card ───────────────────────────────────────────

function TestCard({
  item,
  onStart,
  onEnterResult,
}: {
  item: WorklistItem;
  onStart: () => void;
  onEnterResult: () => void;
}) {
  const prio   = PRIORITY_CONFIG[item.priority];
  const status = STATUS_CONFIG[item.status];
  const StatusIcon = status.icon;
  const PrioIcon   = prio.icon;

  return (
    <div
      className={`
        bg-card border border-border rounded-2xl shadow-card overflow-hidden
        border-l-4 ${prio.border}
        transition-all hover:shadow-md
        ${item.status === "in_progress" ? "ring-1 ring-info/20" : ""}
      `}
    >
      {/* ── Card header ── */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FlaskConical className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base leading-tight">{item.testName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.sampleType}{item.container ? ` · ${item.container}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={`text-[10px] gap-1 ${prio.badgeCls}`}>
            <PrioIcon className="w-2.5 h-2.5" />{prio.label}
          </Badge>
          <Badge className={`text-[10px] gap-1 ${status.cls}`}>
            <StatusIcon className="w-2.5 h-2.5" />{status.label}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* ── Card body ── */}
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Patient */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <User className="w-3 h-3" />Patient
          </p>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
              ${item.patientGender === "Female" ? "bg-pink-500/10 text-pink-600" : "bg-blue-500/10 text-blue-600"}
            `}>
              {initials(item.patientName)}
            </div>
            <div>
              <p className="text-sm font-semibold">{item.patientName}</p>
              <p className="text-xs text-muted-foreground">{item.patientGender} · {item.patientId}</p>
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Beaker className="w-3 h-3" />Parameters ({item.params.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {item.params.map(p => (
              <Badge key={p} variant="outline" className="text-[10px] px-2 py-0.5 font-normal text-muted-foreground">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Card footer ── */}
      <div className="px-5 py-3 flex items-center justify-between gap-4 bg-muted/20">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="w-3.5 h-3.5" />
          <span>Order {item.orderId}</span>
          <span className="opacity-40">·</span>
          <span>{item.createdAt}</span>
        </div>

        <div className="flex items-center gap-2">
          {item.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={onStart}
            >
              <Play className="w-3.5 h-3.5" />Start Test
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
              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <Beaker className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Enter Result</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {item.status === "completed" && (
            <div className="flex items-center gap-1.5 text-xs text-success font-medium">
              <CheckCircle2 className="w-4 h-4" />Result submitted
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function AssignedTests() {
  const { toast }   = useToast();
  const navigate    = useNavigate();
  const { orders, updateItemStatus } = useOrders();

  const [tab,    setTab]    = useState("All");
  const [search, setSearch] = useState("");

  const allItems = useMemo<WorklistItem[]>(() => {
    const result: WorklistItem[] = [];
    for (const order of orders) {
      for (const item of order.items) {
        if (item.assignedTo === MY_SCIENTIST_ID) {
          result.push({
            orderId:       order.id,
            itemId:        item.id,
            catalogTestId: item.catalogTestId,
            testName:      item.testName,
            patientId:     order.patientId,
            patientName:   order.patientName,
            patientGender: order.patientGender,
            priority:      order.priority,
            status:        item.status,
            params:        item.selectedParams.map(p => p.name),
            sampleType:    item.sampleType,
            container:     item.container ?? "",
            createdAt:     order.createdAt,
          });
        }
      }
    }
    return result;
  }, [orders]);

  const filtered = useMemo(() => allItems.filter(item => {
    const matchTab    = tab === "All" || item.status === tab;
    const matchSearch = item.patientName.toLowerCase().includes(search.toLowerCase()) ||
                        item.testName.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  }), [allItems, tab, search]);

  const tabCounts = TABS.map(t => ({
    t,
    count: t === "All" ? allItems.length : allItems.filter(i => i.status === t).length,
  }));

  const urgentItems = allItems.filter(
    i => (i.priority === "Urgent" || i.priority === "Stat") && i.status !== "completed"
  );

  const handleStart = (item: WorklistItem) => {
    updateItemStatus(item.orderId, item.itemId, "in_progress");
    toast({ title: "Test started", description: `${item.testName} is now In Progress.` });
  };

  const handleEnterResult = (item: WorklistItem) => {
    navigate("/lab/result-entry", {
      state: {
        orderId:       item.orderId,
        itemId:        item.itemId,
        catalogTestId: item.catalogTestId,
        testName:      item.testName,
        patientId:     item.patientId,
        patientName:   item.patientName,
        patientGender: item.patientGender,
        sampleType:    item.sampleType,
        priority:      item.priority,
      },
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Assigned Tests</h2>
        <p className="text-sm text-muted-foreground">
          {MY_SCIENTIST_NAME} · {allItems.length} item{allItems.length !== 1 ? "s" : ""} assigned
        </p>
      </div>

      {/* Urgent banner */}
      {urgentItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-destructive/8 border border-destructive/20 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-destructive/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">
              {urgentItems.length} urgent / stat item{urgentItems.length > 1 ? "s" : ""} need immediate attention
            </p>
            <p className="text-xs text-destructive/70 mt-0.5">
              {urgentItems.map(i => `${i.patientName} – ${i.testName}`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Search + Tabs bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or test type..."
            className="pl-9 bg-card"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Tabs value={tab} onValueChange={setTab} className="flex-shrink-0">
          <TabsList className="h-9">
            {tabCounts.map(({ t, count }) => (
              <TabsTrigger key={t} value={t} className="gap-1.5 text-xs px-3">
                {TAB_LABEL[t]}
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 min-w-[18px]">{count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center bg-card border border-border rounded-2xl">
          <FlaskConical className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No {tab !== "All" ? TAB_LABEL[tab].toLowerCase() : ""} tests found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => (
            <TestCard
              key={`${item.orderId}-${item.itemId}`}
              item={item}
              onStart={() => handleStart(item)}
              onEnterResult={() => handleEnterResult(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
