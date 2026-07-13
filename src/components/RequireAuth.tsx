import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getStoredAuth } from "@/api/client";

const STAFF_ROLES = new Set(["lab_owner", "lab_manager", "manager", "scientist", "receptionist"]);
const ADMIN_ROLES = new Set(["admin"]);
const PATIENT_ROLES = new Set(["patient"]);

function getPortalForRole(role: string | null, access_type?: string): string {
  if (access_type === "patient")   return "/patient";
  if (access_type === "doctor")    return "/lab";
  if (STAFF_ROLES.has(role ?? "")) return "/lab";
  if (ADMIN_ROLES.has(role ?? "")) return "/admin";
  if (PATIENT_ROLES.has(role ?? "")) return "/patient";
  return "/signin";
}

type Portal = "lab" | "admin" | "patient";

interface RequireAuthProps {
  portal: Portal;
}

export function RequireAuth({ portal }: RequireAuthProps) {
  const auth = getStoredAuth();
  const location = useLocation();

  // Not authenticated → send to the correct sign-in page
  if (!auth?.access_token) {
    const to = portal === "patient" ? "/patient/signin" : "/signin";
    return <Navigate to={to} state={{ from: location }} replace />;
  }

  // Authenticated but wrong portal → bounce to their actual portal
  const isAllowed =
    portal === "lab"   ? STAFF_ROLES.has(auth.role ?? "") :
    portal === "admin" ? ADMIN_ROLES.has(auth.role ?? "") :
    /* patient */        auth.access_type === "patient" || PATIENT_ROLES.has(auth.role ?? "");

  if (!isAllowed) {
    return <Navigate to={getPortalForRole(auth.role, auth.access_type)} replace />;
  }

  return <Outlet />;
}
