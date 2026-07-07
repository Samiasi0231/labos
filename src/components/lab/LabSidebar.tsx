import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, FlaskConical, FileText, Stethoscope,
  Package, DollarSign, UserSquare, GitBranch, Settings, ChevronLeft,
  Activity, X, ClipboardList, UserPlus, CalendarDays, ReceiptText,
  TestTube, Clock, ShieldCheck, Heart, ChevronsUpDown, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRole } from "@/context/useRole";
import { type LabRole, ROLE_PROFILES } from "@/context/RoleContext";

// ─── Nav item / group types ─────────────────────────────────────

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

// ─── Item definitions ────────────────────────────────────────────

const dashboard:    NavItem = { path: '/lab',               label: 'Dashboard',          icon: LayoutDashboard,  exact: true };
const patients:     NavItem = { path: '/lab/patients',      label: 'Patients',           icon: Users };
const tests:        NavItem = { path: '/lab/tests',         label: 'Test Orders',        icon: FlaskConical };
const catalog:      NavItem = { path: '/lab/test-catalog',  label: 'Test Catalog',       icon: ClipboardList };
const results:      NavItem = { path: '/lab/results',       label: 'Results',            icon: FileText };
const doctors:      NavItem = { path: '/lab/doctors',       label: 'Doctors',            icon: Stethoscope };
const inventory:    NavItem = { path: '/lab/inventory',     label: 'Inventory',          icon: Package };
const finance:      NavItem = { path: '/lab/finance',       label: 'Finance',            icon: DollarSign };
const staff:        NavItem = { path: '/lab/staff',         label: 'Staff',              icon: UserSquare };
const branches:     NavItem = { path: '/lab/branches',      label: 'Branches',           icon: GitBranch };
const settingsItem: NavItem = { path: '/lab/settings',      label: 'Settings',           icon: Settings };
const register:     NavItem = { path: '/lab/register',      label: 'Patient Registration', icon: UserPlus };
const appointments: NavItem = { path: '/lab/appointments',  label: 'Appointments',       icon: CalendarDays };
const billing:      NavItem = { path: '/lab/billing',       label: 'Billing',            icon: ReceiptText };
const samples:      NavItem = { path: '/lab/samples',       label: 'Sample Collection',  icon: TestTube };
const assigned:     NavItem = { path: '/lab/assigned',      label: 'Assigned Tests',     icon: ClipboardList };
const resultEntry:  NavItem = { path: '/lab/result-entry',  label: 'Result Entry',       icon: FlaskConical };
const reviews:      NavItem = { path: '/lab/reviews',       label: 'Pending Reviews',    icon: Clock };

// ─── Role → nav config ──────────────────────────────────────────

const NAV_CONFIG: Record<LabRole, NavGroup[]> = {
  lab_owner: [
    { group: 'Main',       items: [dashboard] },
    { group: 'Operations', items: [patients, tests, catalog, results, doctors] },
    { group: 'Management', items: [inventory, finance, staff, branches] },
    { group: 'System',     items: [settingsItem] },
  ],
  receptionist: [
    { group: 'Main',       items: [dashboard] },
    { group: 'Front Desk', items: [register, patients, tests, appointments, billing, samples] },
  ],
  scientist: [
    { group: 'Main',      items: [dashboard] },
    { group: 'Workspace', items: [assigned, resultEntry, reviews] },
  ],
};

const ROLE_LABELS: Record<LabRole, string> = {
  lab_owner:    'Lab Owner',
  receptionist: 'Receptionist',
  scientist:    'Lab Scientist',
};

// ─── Props ───────────────────────────────────────────────────────

interface LabSidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export function LabSidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: LabSidebarProps) {
  const location  = useLocation();
  const isMobile  = useIsMobile();
  const navigate  = useNavigate();
  const { role, setRole, profile } = useRole();

  const navGroups = NAV_CONFIG[role];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleRoleSwitch = (newRole: LabRole) => {
    setRole(newRole);
    navigate("/lab");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ── Logo ──────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-sidebar-border',
        collapsed && !isMobile ? 'justify-center px-3' : ''
      )}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <p className="font-bold text-sidebar-foreground text-base leading-tight">LabOS</p>
            <p className="text-xs text-sidebar-muted leading-tight">Laboratory Management</p>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'ml-auto h-7 w-7 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0',
              collapsed && 'ml-0'
            )}
            onClick={() => onCollapse(!collapsed)}
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
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
        {navGroups.map((group) => (
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                      collapsed && !isMobile ? 'justify-center px-2' : '',
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon
                      className={cn('flex-shrink-0', active ? '' : 'text-sidebar-muted')}
                      style={{ width: '18px', height: '18px' }}
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
        ))}
      </nav>

      {/* ── Quick links to other portals ──────────── */}
      {(!collapsed || isMobile) && (
        <div className="px-3 pb-2 space-y-1">
          <NavLink
            to="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /><span>Admin Portal</span>
          </NavLink>
          <NavLink
            to="/patient"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Heart className="w-4 h-4" /><span>Patient Portal</span>
          </NavLink>
        </div>
      )}

      {/* ── Role switcher + user footer ───────────── */}
      <div className="px-3 pb-4 pt-2 border-t border-sidebar-border">
        {(!collapsed || isMobile) ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-colors group">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-sidebar-primary-foreground">{profile.initials}</span>
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-sm font-medium text-sidebar-foreground truncate leading-tight">{profile.name}</p>
                  <p className="text-xs text-sidebar-muted truncate leading-tight">{profile.title}</p>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-sidebar-muted group-hover:text-sidebar-foreground transition-colors flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(ROLE_PROFILES) as LabRole[]).map((r) => (
                <DropdownMenuItem
                  key={r}
                  className="gap-2 cursor-pointer"
                  onClick={() => handleRoleSwitch(r)}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">{ROLE_PROFILES[r].initials}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ROLE_PROFILES[r].name}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[r]}</p>
                  </div>
                  {role === r && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-center py-2 rounded-xl hover:bg-sidebar-accent transition-colors">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-sidebar-primary-foreground">{profile.initials}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(ROLE_PROFILES) as LabRole[]).map((r) => (
                <DropdownMenuItem key={r} className="gap-2 cursor-pointer" onClick={() => handleRoleSwitch(r)}>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">{ROLE_PROFILES[r].initials}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ROLE_PROFILES[r].name}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_LABELS[r]}</p>
                  </div>
                  {role === r && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
      'flex-shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-sidebar',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {sidebarContent}
    </div>
  );
}
