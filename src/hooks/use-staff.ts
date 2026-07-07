import { useApi, useMutation } from "@/hooks/use-api";
import { staffEndpoints } from "@/api/endpoints/staff";
import type {
  StaffMember,
  StaffListResponse,
  StaffListQuery,
  InviteStaffPayload,
  InviteStaffResponse,
  UpdateStaffRolePayload,
  UpdateStaffStatusPayload,
  UpdateStaffStatusResponse,
  UpdateStaffRoleResponse
 
} from "@/api/types/staff";
import type{  StaffRole,StaffStatus,} from "@/api/types/enums";

function buildStaffListUrl(query: StaffListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.role) params.set("role", query.role);
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  const qs = params.toString();
  return qs ? `${staffEndpoints.list}?${qs}` : staffEndpoints.list;
}

export function useStaffList(query: StaffListQuery = {}) {
  const url = buildStaffListUrl(query);
  const { data, error, isLoading, isValidating, mutate } = useApi<StaffListResponse>(url);

  return {
    staff: data?.data?.docs ?? [],
    pagination: data?.data
      ? {
          totalDocs: data.data.totalDocs,
          page: data.data.page,
          pages: data.data.pages,
          limit: data.data.limit,
          hasNextPage: data.data.hasNextPage,
          hasPrevPage: data.data.hasPrevPage,
        }
      : null,
    error,
    isLoading,
    isValidating,
    refetch: mutate,
    listUrl: url,
  };
}

export function useStaffMember(membershipId: string | null) {
  const { data, error, isLoading, mutate } = useApi<StaffMember>(
    membershipId ? staffEndpoints.get(membershipId) : null
  );
  return { staffMember: data?.data ?? null, error, isLoading, refetch: mutate };
}

export function useInviteStaff(invalidate: string[] = [staffEndpoints.list]) {
  const mutation = useMutation<InviteStaffResponse, InviteStaffPayload>(staffEndpoints.invite, {
    skipErrorHandling: true,
    invalidate,
  });

  const invite = async (payload: InviteStaffPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to send invite");
    return res.data;
  };

  return { invite, isLoading: mutation.isLoading };
}

export function useUpdateStaffRole(invalidate: string[] = [staffEndpoints.list]) {
  const mutation = useMutation<UpdateStaffRoleResponse, UpdateStaffRolePayload>(
    "staff/update-role",
    { method: "PATCH", skipErrorHandling: true, invalidate }
  );

  const updateRole = async (membershipId: string, role: StaffRole) => {
    const res = await mutation.trigger({ role }, staffEndpoints.updateRole(membershipId));
    if (!res) throw new Error("Failed to update role");
    return res.data;
  };

  return { updateRole, isLoading: mutation.isLoading };
}

export function useUpdateStaffStatus(invalidate: string[] = [staffEndpoints.list]) {
  const mutation = useMutation<UpdateStaffStatusResponse, UpdateStaffStatusPayload>(
    "staff/update-status",
    { method: "PATCH", skipErrorHandling: true, invalidate }
  );

  const updateStatus = async (membershipId: string, status: StaffStatus) => {
    const res = await mutation.trigger({ status }, staffEndpoints.updateStatus(membershipId));
    if (!res) throw new Error("Failed to update status");
    return res.data;
  };

  return { updateStatus, isLoading: mutation.isLoading };
}

export function useRemoveStaff(invalidate: string[] = [staffEndpoints.list]) {
  const mutation = useMutation<unknown, void>("staff/remove", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const remove = async (membershipId: string) => {
    const res = await mutation.trigger(undefined, staffEndpoints.remove(membershipId));
    if (!res) throw new Error("Failed to remove staff member");
  };

  return { remove, isLoading: mutation.isLoading };
}