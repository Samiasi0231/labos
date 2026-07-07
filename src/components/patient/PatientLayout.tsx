import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PatientSidebar } from "./PatientSidebar";
import { PatientHeader } from "./PatientHeader";

const pageTitles: Record<string, string> = {
  "/patient": "My Health Dashboard",
  "/patient/results": "Test Results",
  "/patient/history": "Health History",
  "/patient/appointments": "My Appointments",
  "/patient/profile": "My Profile",
};

export function PatientLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <PatientSidebar
        collapsed={collapsed} onCollapse={setCollapsed}
        mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <PatientHeader onMenuClick={() => setMobileOpen(true)} pageTitle={pageTitles[location.pathname] ?? "Patient Portal"} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
