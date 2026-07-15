import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
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
} from "lucide-react";
import type {
  AssignmentItem,
  TestOrderItemStatus,
  TestOrderPriority,
} from "@/api/types/test-order";

// ── Config ────────────────────────────────────────────────────────────────────

export const TABS: TestOrderItemStatus[] = [
  "assigned",
  "pending",
  "in_progress",
];

export const TAB_LABEL: Record<string, string> = {
  assigned: "Assigned",
  pending: "Pending",
  in_progress: "In Progress",
};

export const PRIORITY_CONFIG: Record<
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

export const STATUS_CONFIG: Record<
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

export function initials(name: string) {
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

export function TestCard({
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
          <span className="font-mono">#{order._id.slice(-8).toUpperCase()}</span>
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
