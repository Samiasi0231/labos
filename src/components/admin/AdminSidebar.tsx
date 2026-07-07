import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Building2, CreditCard, Users, BarChart3,
  Settings, Code2, ChevronLeft, X, ShieldCheck, Activity,
  FlaskConical, ReceiptText, Heart, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const navGroups = [
  {
    label: "Platform",
    items: [
      { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { path: "/admin/labs", label: "Laboratories", icon: Building2, badge: 0 },
      { path: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
      { path: "/admin/users", label: "All Users", icon: Users },
      { path: "/admin/test-permissions", label: "Test Permissions", icon: ClipboardList },
    ],
  },
  {
    label: "Analytics",
    items: [
      { path: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
      { path: "/admin/api", label: "API Management", icon: Code2 },
    ],
  },
  {
    label: "System",
    items: [
      { path: "/admin/settings", label: "System Settings", icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && path !== "/admin" || (exact && location.pathname === path);
  };

  const isActiveExact = (path: string) => location.pathname === path;

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed && !isMobile ? "justify-center px-3" : ""
      )}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <p className="font-bold text-sidebar-foreground text-base leading-tight">LabOS</p>
            <p className="text-xs text-sidebar-muted leading-tight">Super Admin</p>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost" size="icon"
            className={cn("ml-auto h-7 w-7 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0", collapsed && "ml-0")}
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

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map(group => (
          <div key={group.label} className="space-y-1">
            {(!collapsed || isMobile) && (
              <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted px-3 mb-2">{group.label}</p>
            )}
            {group.items.map(item => {
              const active = item.exact ? isActiveExact(item.path) : isActive(item.path, item.exact);
              return (
                <NavLink
                  key={item.path} to={item.path}
                  onClick={isMobile ? onMobileClose : undefined}
                  end={item.exact}
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
                        <Badge className="bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground border-0 text-[10px] h-4 px-1.5">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Portal links */}
      {(!collapsed || isMobile) && (
        <div className="px-3 pb-3 space-y-1 border-t border-sidebar-border pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted px-3 mb-2">Portals</p>
          {[
            { path: "/lab", label: "Lab Owner", icon: Activity },
            { path: "/scientist", label: "Scientist", icon: FlaskConical },
            { path: "/reception", label: "Reception", icon: ReceiptText },
            { path: "/patient", label: "Patient", icon: Heart },
          ].map(link => (
            <NavLink key={link.path} to={link.path}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <link.icon className="w-4 h-4" /><span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      )}

      {/* User */}
      {(!collapsed || isMobile) && (
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-sidebar-primary-foreground">SA</span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">System Admin</p>
              <p className="text-xs text-sidebar-muted truncate">super@labos.ng</p>
            </div>
            <Badge className="text-[10px] bg-accent/20 text-accent border-0 px-1.5">GOD</Badge>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return mobileOpen ? (
      <div className="fixed inset-0 z-50 flex">
        <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
        <div className="relative w-72 bg-sidebar flex-shrink-0 shadow-sidebar animate-slide-in">{content}</div>
      </div>
    ) : null;
  }

  return (
    <div className={cn(
      "flex-shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 shadow-sidebar",
      collapsed ? "w-16" : "w-64"
    )}>
      {content}
    </div>
  );
}
