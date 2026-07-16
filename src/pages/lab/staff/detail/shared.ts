import type { StaffRole, StaffStatus } from "@/api/types/enums";
import type { TestOrderItemStatus } from "@/api/types/test-order";
import endpoint from "@/api/endpoints";
import { PERMISSION_CATEGORIES } from "@/lib/permission";

// ── Staff Detail type ─────────────────────────────────────────────────────────
// Shape returned by GET /staff/:membershipId (getStaff service)

export interface StaffDetail {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  role: StaffRole;
  status: StaffStatus;
  joinedAt?: string;
  createdAt: string;
  invitedBy?: {
    _id: string
    firstName: string
    lastName: string
  };
  permissions: string[]; // effective resolved permission strings
  lab: string;
}

// ── Role display helpers ──────────────────────────────────────────────────────

export const ROLE_LABELS: Record<StaffRole, string> = {
  manager: "Manager",
  scientist: "Scientist",
  technician: "Technician",
  receptionist: "Receptionist",
};

export const ROLE_COLORS: Record<StaffRole, string> = {
  manager: "bg-primary/15 text-primary border-primary/30",
  scientist: "bg-info/15 text-info border-info/30",
  technician: "bg-warning/15 text-warning border-warning/30",
  receptionist: "bg-muted text-muted-foreground border-border",
};

// ── Status display helpers ────────────────────────────────────────────────────

export const STATUS_LABELS: Record<StaffStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
};

export const STATUS_COLORS: Record<StaffStatus, string> = {
  active: "bg-success/12 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/12 text-warning border-warning/30",
};

// ── Assignment status display ─────────────────────────────────────────────────

export const ITEM_STATUS_LABELS: Record<TestOrderItemStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
};

export const ITEM_STATUS_COLORS: Record<TestOrderItemStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  assigned: "bg-sky-500/12 text-sky-600",
  in_progress: "bg-warning/12 text-warning",
  completed: "bg-success/12 text-success",
};

// ── URL helpers ───────────────────────────────────────────────────────────────

export function staffDetailUrl(membershipId: string): string {
  return endpoint.lab.staff.get(membershipId);
}

export function assignmentsUrl(
  status?: TestOrderItemStatus | "all",
  page = 1,
  limit = 20,
): string {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  params.set("page", String(page));
  params.set("limit", String(limit));
  return `${endpoint.lab.testOrders.assignments}?${params.toString()}`;
}

// ── Permission catalog (mirrors backend PERMISSIONS map) ─────────────────────

export interface PermCatalogEntry {
  key: string;
  desc: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  patients: "Patients",
  tests: "Tests",
  results: "Results",
  appointments: "Appointments",
  doctors: "Doctors",
  inventory: "Inventory",
  staff: "Staff",
  branches: "Branches",
  test_catalog: "Test Catalog",
  finance: "Finance",
  activity: "Activity",
  lab: "Lab",
};

export const PERM_CATALOG: Record<string, PermCatalogEntry[]> =
  Object.fromEntries(
    Object.entries(PERMISSION_CATEGORIES).map(([cat, perms]) => [
      CATEGORY_LABELS[cat] ?? cat,
      Object.entries(perms).map(([key, desc]) => ({ key, desc: desc as string })),
    ]),
  );

export const ROLE_DEFAULTS: Partial<Record<StaffRole, string[]>> = {
  scientist: [
    "tests.read_own",
    "tests.process",
    "tests.update_status",
    "results.read_own",
    "results.create",
    "patients.read",
  ],
  technician: [
    "tests.read_own",
    "tests.process",
    "tests.update_status",
    "results.read_own",
    "results.create",
    "patients.read",
  ],
  receptionist: [
    "patients.read",
    "patients.create",
    "patients.update",
    "appointments.read",
    "appointments.create",
    "appointments.update",
    "tests.read",
    "tests.create",
  ],
};

export const ROLE_DESC: Partial<Record<StaffRole, string>> = {
  manager:
    "Full platform access — manages staff, subscriptions, finance, and all lab operations.",
  scientist:
    "Processes assigned tests, records results, and views patient records relevant to their work.",
  technician:
    "Processes assigned tests, records results, and views patient records relevant to their work.",
  receptionist:
    "Registers patients, books appointments, and creates test orders at check-in.",
};

// ── Permission grouping ───────────────────────────────────────────────────────

export interface PermGroup {
  resource: string;
  key: string;
  actions: { label: string }[];
}

export function groupPermissions(perms: string[]): PermGroup[] {
  const map = new Map<string, Set<string>>();
  for (const p of perms) {
    if (p === "*") continue;
    const sep = p.includes(".") ? "." : ":";
    const [res, action] = p.split(sep);
    if (!res || !action) continue;
    if (!map.has(res)) map.set(res, new Set());
    map.get(res)!.add(action);
  }
  return Array.from(map.entries()).map(([key, actions]) => ({
    key,
    resource: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    actions: Array.from(actions).map((a) => ({
      label: a.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
  }));
}

