import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";

interface PermissionItem {
  permission: string;
  description: string;
}

interface MyPermissionsResponse {
  role: string;
  isAdmin: boolean;
  permissions: PermissionItem[];
}

export function useMyPermissions() {
  const { data, isLoading } = useApi<MyPermissionsResponse>(
    endpoint.lab.staff.myPermissions
  );

  const isAdmin = data?.data?.isAdmin ?? false;
  const permissionSet = new Set(
    (data?.data?.permissions ?? []).map((p) => p.permission)
  );

  const can = (permission: string): boolean => {
    if (isAdmin) return true;
    return permissionSet.has(permission);
  };

  const role = data?.data?.role ?? null;

  return { can, isAdmin, role, isLoading };
}
