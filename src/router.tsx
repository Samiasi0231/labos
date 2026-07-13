import { Navigate } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";

import { WebsiteLayout } from "./components/website/WebsiteLayout";
import Home from "./pages/website/Home";
import Features from "./pages/website/Features";
import Pricing from "./pages/website/Pricing";
import Contact from "./pages/website/Contact";
import Terms from "./pages/website/Terms";
import Privacy from "./pages/website/Privacy";
import SignUp from "./pages/website/SignUp";
import SignIn from "./pages/website/SignIn";
import ResetPassword from "./pages/website/ResetPassword";
import VerifyEmail from "./pages/website/VerifyEmail";
import CreateLab from "./pages/website/CreateLab";
import AcceptInvite from "./pages/website/AcceptInvite";

import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Labs from "./pages/admin/Labs";
import Subscriptions from "./pages/admin/Subscriptions";
import AllUsers from "./pages/admin/AllUsers";
import Reports from "./pages/admin/Reports";
import ApiManagement from "./pages/admin/ApiManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import TestPermissions from "./pages/admin/TestPermissions";

import { LabLayout } from "./components/lab/LabLayout";
import LabDashboard from "./pages/lab/LabDashboard";
import Patients from "./pages/lab/Patients";
import PatientDetail from "./pages/lab/PatientDetail";
import Tests from "./pages/lab/Tests";
import TestOrderDetail from "./pages/lab/TestOrderDetail";
import Results from "./pages/lab/Results";
import Doctors from "./pages/lab/Doctors";
import Inventory from "./pages/lab/Inventory";
import Finance from "./pages/lab/Finance";
import Staff from "./pages/lab/Staff";
import Branches from "./pages/lab/Branches";
import Settings from "./pages/lab/Settings";
import TestCatalog from "./pages/lab/TestCatalog";
import InitiateTestOrder from "./pages/lab/InitiateTestOrder";

import PatientRegistration from "./pages/lab/PatientRegistration";
import Appointments from "./pages/lab/Appointments";
import Billing from "./pages/lab/Billing";
import AssignedTests from "./pages/lab/AssignedTests";
import ResultEntry from "./pages/lab/ResultEntry";
import PendingReviews from "./pages/lab/PendingReviews";
import ActivityLog from "./pages/lab/ActivityLog";

import { PatientLayout } from "./components/patient/PatientLayout";
import PatientDashboard from "./pages/patient/PatientDashboard";
import MyResults from "./pages/patient/MyResults";
import ResultDetail from "./pages/patient/ResultDetail";
import MyOrders from "./pages/patient/MyOrders";
import MyAppointments from "./pages/patient/MyAppointments";
import PatientProfile from "./pages/patient/PatientProfile";

import NotFound from "./pages/NotFound";

export const routers = [
  // ── Public / website routes ───────────────────────────────────────────────
  {
    path: "/",
    element: <WebsiteLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "features", element: <Features /> },
      { path: "pricing", element: <Pricing /> },
      { path: "contact", element: <Contact /> },
      { path: "terms", element: <Terms /> },
      { path: "privacy", element: <Privacy /> },
      { path: "signup", element: <SignUp /> },
      { path: "signin", element: <SignIn /> },
      { path: "patient/signin", element: <SignIn accessType="patient" /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "create-lab", element: <CreateLab /> },
      { path: "accept-invite", element: <AcceptInvite /> },
    ],
  },

  // ── Lab portal — staff only ───────────────────────────────────────────────
  {
    element: <RequireAuth portal="lab" />,
    children: [
      {
        path: "/lab",
        element: <LabLayout />,
        children: [
          // Lab Owner pages
          { index: true, element: <LabDashboard /> },
          { path: "patients", element: <Patients /> },
          { path: "patients/:patientId", element: <PatientDetail /> },
          { path: "tests", element: <Tests /> },
          { path: "tests/:orderId", element: <TestOrderDetail /> },
          { path: "results", element: <Results /> },
          { path: "doctors", element: <Doctors /> },
          { path: "inventory", element: <Inventory /> },
          { path: "finance", element: <Finance /> },
          { path: "staff", element: <Staff /> },
          { path: "branches", element: <Branches /> },
          { path: "settings", element: <Settings /> },
          { path: "test-catalog", element: <TestCatalog /> },
          { path: "test-order/:patientId", element: <InitiateTestOrder /> },
          // Receptionist pages
          { path: "register", element: <PatientRegistration /> },
          { path: "appointments", element: <Appointments /> },
          { path: "billing", element: <Billing /> },
          // Scientist pages
          { path: "assigned", element: <AssignedTests /> },
          { path: "result-entry", element: <ResultEntry /> },
          { path: "reviews", element: <PendingReviews /> },
          { path: "activity", element: <ActivityLog /> },
        ],
      },
    ],
  },

  // ── Admin portal ──────────────────────────────────────────────────────────
  {
    element: <RequireAuth portal="admin" />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "labs", element: <Labs /> },
          { path: "subscriptions", element: <Subscriptions /> },
          { path: "users", element: <AllUsers /> },
          { path: "reports", element: <Reports /> },
          { path: "api", element: <ApiManagement /> },
          { path: "settings", element: <SystemSettings /> },
          { path: "test-permissions", element: <TestPermissions /> },
        ],
      },
    ],
  },

  // ── Patient portal ────────────────────────────────────────────────────────
  {
    element: <RequireAuth portal="patient" />,
    children: [
      {
        path: "/patient",
        element: <PatientLayout />,
        children: [
          { index: true, element: <PatientDashboard /> },
          { path: "results", element: <MyResults /> },
          { path: "results/:resultId", element: <ResultDetail /> },
          { path: "orders", element: <MyOrders /> },
          { path: "appointments", element: <MyAppointments /> },
          { path: "profile", element: <PatientProfile /> },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
];

declare global {
  interface Window { __routers__: typeof routers; }
}
window.__routers__ = routers;
