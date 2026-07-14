import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/api/types/activity";

function actionLabel(action: string): string {
  const [res, verb] = action.split(".");
  const titleCase = (s: string) =>
    s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  return [res, verb].filter(Boolean).map(titleCase).join(" ");
}

export function actorName(actor: Activity["actor"]): string {
  if (typeof actor === "string") return actor;
  return (
    [actor.firstName, actor.lastName].filter(Boolean).join(" ") ||
    actor.email ||
    "Unknown"
  );
}

function verbOf(action: string): string {
  return action.split(".")[1] ?? action;
}

function verbCategory(action: string): "success" | "info" | "destructive" | "muted" {
  return VERB_CATEGORY[verbOf(action)] ?? "muted";
}

const META_LABELS: Record<string, string> = {
  patientName: "Patient",
  quantity: "Qty",
  testName: "Test",
  previousStatus: "From",
  newStatus: "To",
  product: "Item",
  role: "Role",
  scientist: "Assigned To",
  reorderLevel: "Reorder At",
  phone: "Phone",
  branch: "Branch",
};
const VERB_CATEGORY: Record<string, "success" | "info" | "destructive" | "muted"> = {
  created: "success",
  approved: "success",
  released: "success",
  updated: "info",
  assigned: "info",
  restocked: "info",
  deleted: "destructive",
  returned: "destructive",
  cancelled: "destructive",
  viewed: "muted",
  exported: "muted",
};

const BADGE_CLS: Record<"success" | "info" | "destructive" | "muted", string> = {
  success: "bg-success/15 text-success border-success/30 border",
  info: "bg-info/15 text-info border-info/30 border",
  destructive: "bg-destructive/15 text-destructive border-destructive/30 border",
  muted: "bg-muted text-muted-foreground border",
};

export function metaLabel(key: string): string {
  return META_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}


export function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-NG", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function actorInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ActorAvatar({ name, size = 30 }: { name: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
    >
      <span
        style={{ fontSize: size * 0.37 }}
        className="font-bold text-primary leading-none"
      >
        {actorInitials(name)}
      </span>
    </div>
  );
}

export function ActionBadge({ action }: { action: string }) {
  const cat = verbCategory(action);
  return (
    <Badge className={`text-xs whitespace-nowrap ${BADGE_CLS[cat]}`}>
      {actionLabel(action)}
    </Badge>
  );
}