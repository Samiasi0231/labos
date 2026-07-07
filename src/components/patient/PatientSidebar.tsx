import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, History, CalendarDays,
  User, ChevronLeft, X, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { path: "/patient", label: "My Health", icon: LayoutDashboard, exact: true },
  { path: "/patient/results", label: "Test Results", icon: FileText, badge: 1 },
  { path: "/patient/history", label: "Health History", icon: History },
  { path: "/patient/appointments", label: "Appointments", icon: CalendarDays },
  { path: "/patient/profile", label: "My Profile", icon: User },
];

interface PatientSidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function PatientSidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: PatientSidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed && !isMobile ? "justify-center px-3" : ""
      )}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
          <Heart className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <p className="font-bold text-sidebar-foreground text-base leading-tight">LabOS</p>
            <p className="text-xs text-sidebar-muted leading-tight">Patient Portal</p>
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

      {/* Patient quick card */}
      {(!collapsed || isMobile) && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-sidebar-primary/20 border border-sidebar-primary/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-sidebar-primary-foreground">AO</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Amara Okonkwo</p>
              <p className="text-[10px] text-sidebar-muted">PAT-001 · O+</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {(!collapsed || isMobile) && (
          <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-muted px-3 mb-3">My Health</p>
        )}
        {navItems.map(item => {
          const active = isActive(item.path, item.exact);
          return (
            <NavLink
              key={item.path} to={item.path} end={item.exact}
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
                  {item.badge && item.badge > 0 && (
                    <Badge className="bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground border-0 text-[10px] h-4 px-1.5 min-w-[18px]">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {(!collapsed || isMobile) && (
        <div className="px-4 py-4 border-t border-sidebar-border">
          <p className="text-[11px] text-sidebar-muted text-center leading-relaxed">
            Powered by <span className="font-semibold text-sidebar-foreground">LabOS</span><br />
            Your results are secure & private
          </p>
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
