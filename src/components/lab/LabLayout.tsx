import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LabSidebar } from "./lab-sidebar";
import { LabHeader } from "./LabHeader";

const pageTitles: Record<string, string> = {
  '/lab':                   'Dashboard',
  '/lab/patients':          'Patients',
  '/lab/tests':             'Test Orders',
  '/lab/results':           'Results',
  '/lab/doctors':           'Doctors',
  '/lab/inventory':         'Inventory',
  '/lab/finance':           'Finance',
  '/lab/staff':             'Staff',
  '/lab/branches':          'Branches',
  '/lab/settings':          'Settings',
  '/lab/test-catalog':      'Test Catalog',
  '/lab/register':          'Patient Registration',
  '/lab/appointments':      'Appointments',
  '/lab/billing':           'Billing',
  '/lab/samples':           'Sample Collection',
  '/lab/assigned':          'Assigned Tests',
  '/lab/result-entry':      'Result Entry',
  '/lab/reviews':           'Pending Reviews',
};

export function LabLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname]
    ?? (location.pathname.startsWith('/lab/test-order')  ? 'New Test Order'
      : location.pathname.startsWith('/lab/patients/')   ? 'Patient Details'
      : location.pathname.startsWith('/lab/staff/')      ? 'Staff'
      : 'Ezralabs');

  return (
    <div className="flex h-full bg-background overflow-hidden">
      <LabSidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <LabHeader
          onMenuClick={() => setMobileOpen(true)}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
