import { useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { PatientSidebar } from "./PatientSidebar";
import { PatientHeader } from "./PatientHeader";

function usePageTitle(): string {
  const location = useLocation();
  const { pathname } = location;
  if (pathname === "/patient") return "Home";
  if (pathname.startsWith("/patient/results/")) return "Result Detail";
  if (pathname.startsWith("/patient/results")) return "My Results";
  if (pathname.startsWith("/patient/orders")) return "My Orders";
  if (pathname.startsWith("/patient/appointments")) return "Appointments";
  if (pathname.startsWith("/patient/profile")) return "Profile";
  return "Patient Portal";
}

export function PatientLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = usePageTitle();

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <PatientSidebar
        collapsed={collapsed} onCollapse={setCollapsed}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <PatientHeader onMenuClick={() => setMobileOpen(true)} pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
