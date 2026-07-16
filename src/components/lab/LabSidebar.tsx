import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, FlaskConical, FileText, Stethoscope,
  Package, DollarSign, UserSquare, GitBranch, Settings, ChevronLeft,
  Activity, X, ClipboardList, CalendarDays, ReceiptText,
  Clock, ShieldCheck, Heart, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMyPermissions } from "@/hooks/use-api";

// ─── Nav item / group types ─────────────────────────────────────

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
  /** Permission key required to show this item. Omit for always-visible items. */
  requires?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

// ─── Unified nav config (all roles merged) ───────────────────────

const ALL_NAV: NavGroup[] = [
  {
    group: "Main",
    items: [
      { path: "/lab", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    group: "Operations",
    items: [
      { path: "/lab/patients", label: "Patients", icon: Users, requires: "patients.read" },
      { path: "/lab/tests", label: "Test Orders", icon: FlaskConical, requires: "tests.read" },
      { path: "/lab/assigned", label: "Assigned Tests", icon: ClipboardList, requires: "tests.read" },
      { path: "/lab/results", label: "Results", icon: FileText, requires: "results.read" },
      { path: "/lab/reviews", label: "Pending Reviews", icon: Clock, requires: "results.read_own" },
      { path: "/lab/appointments", label: "Appointments", icon: CalendarDays, requires: "appointments.read" },
      { path: "/lab/billing", label: "Billing", icon: ReceiptText, requires: "finance.read" }
    ],
  },
  {
    group: "Management",
    items: [
      { path: "/lab/test-catalog", label: "Test Catalog", icon: ClipboardList, requires: "test_catalog.read" },
      { path: "/lab/staff", label: "Staff", icon: UserSquare, requires: "staff.read" },
      { path: "/lab/doctors", label: "Doctors", icon: Stethoscope, requires: "doctors.read" },
      { path: "/lab/inventory", label: "Inventory", icon: Package, requires: "inventory.read" },
      { path: "/lab/finance", label: "Finance", icon: DollarSign, requires: "finance.read" },
      { path: "/lab/branches", label: "Branches", icon: GitBranch, requires: "branches.read" },
      { path: "/lab/activity", label: "Activity Log", icon: History, requires: "activity.read" },
    ],
  },
  {
    group: "System",
    items: [
      { path: "/lab/settings", label: "Settings", icon: Settings },
    ],
  },
];

// ─── Props ───────────────────────────────────────────────────────

interface LabSidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export function LabSidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: LabSidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { can, role: staffRole, isLoading: permLoading } = useMyPermissions();

  const visibleGroups = ALL_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      !item.requires || can(item.requires)
    ),
  })).filter((group) => group.items.length > 0);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ──────────────────────────────────── */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed && !isMobile ? "justify-center px-3" : ""
      )}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <p className="font-bold text-sidebar-foreground text-base leading-tight">Ezralabs</p>
            <p className="text-xs text-sidebar-muted leading-tight">Laboratory Management</p>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "ml-auto h-7 w-7 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0",
              collapsed && "ml-0"
            )}
            onClick={() => onCollapse(!collapsed)}
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        )}
        {isMobile && (
          <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-sidebar-muted" onClick={onMobileClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {permLoading ? (
          <div className="space-y-2 px-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 rounded-lg bg-sidebar-accent/50 animate-pulse" />
            ))}
          </div>
        ) : (
          visibleGroups.map((group) => (
            <div key={group.group}>
              {(!collapsed || isMobile) && (
                <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted px-3 mb-2">
                  {group.group}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.path, item.exact);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={isMobile ? onMobileClose : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                        collapsed && !isMobile ? "justify-center px-2" : "",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon
                        className={cn("flex-shrink-0", active ? "" : "text-sidebar-muted")}
                        style={{ width: "18px", height: "18px" }}
                      />
                      {(!collapsed || isMobile) && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <Badge className="bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground border-0 text-[10px] h-4 px-1.5 min-w-[18px]">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
              {collapsed && !isMobile && <Separator className="bg-sidebar-border my-2" />}
            </div>
          ))
        )}
      </nav>

      {/* ── User footer ───────────────────────────── */}
      <div className="px-3 pb-4 pt-2 border-t border-sidebar-border">
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-sidebar-primary-foreground">U</span>
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate leading-tight">My Account</p>
              <p className="text-xs text-sidebar-muted truncate leading-tight capitalize">
                {permLoading ? "Loading…" : (staffRole?.replace("_", " ") ?? "Staff")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
              <span className="text-xs font-bold text-sidebar-primary-foreground">U</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Mobile overlay ───────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
            <div className="relative w-72 bg-sidebar flex-shrink-0 shadow-sidebar animate-slide-in">
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={cn(
      "flex-shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-sidebar",
      collapsed ? "w-16" : "w-64"
    )}>
      {sidebarContent}
    </div>
  );
}
