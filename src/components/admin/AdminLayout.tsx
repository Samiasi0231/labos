import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

const pageTitles: Record<string, string> = {
  "/admin": "Platform Dashboard",
  "/admin/labs": "Laboratories",
  "/admin/subscriptions": "Subscriptions",
  "/admin/users": "All Users",
  "/admin/reports": "Reports & Analytics",
  "/admin/api": "API Management",
  "/admin/settings": "System Settings",
  "/admin/test-permissions": "Test Catalog & Permissions",
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <AdminSidebar
        collapsed={collapsed} onCollapse={setCollapsed}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} pageTitle={pageTitles[location.pathname] ?? "Admin"} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
