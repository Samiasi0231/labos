import { useApi, useMutation } from "@/hooks/use-api";
import { doctorEndpoints } from "@/api/endpoints/doctors";
import type {
  Doctor,
  DoctorListResponse,
  DoctorListQuery,
  CreateDoctorPayload,
  UpdateDoctorPayload,
  UpdateDoctorStatusPayload,
  DoctorStatus,
} from "@/api/types/doctors";

function buildDoctorListUrl(query: DoctorListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.specialty) params.set("specialty", query.specialty);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  return `${doctorEndpoints.list}?${params.toString()}`;
}

export function useDoctorsList(query: DoctorListQuery = {}) {
  const url = buildDoctorListUrl(query);
  const { data, error, isLoading, isValidating, mutate } = useApi<DoctorListResponse>(url);

  return {
    doctors: data?.data?.docs ?? [],
    pagination: data?.data
      ? {
          totalDocs: data.data.totalDocs,
          page: data.data.page,
          totalPages: data.data.totalPages,
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

export function useDoctor(doctorId: string | null) {
  const { data, error, isLoading, mutate } = useApi<Doctor>(
    doctorId ? doctorEndpoints.get(doctorId) : null
  );
  return { doctor: data?.data ?? null, error, isLoading, refetch: mutate };
}

export function useCreateDoctor(invalidate: string[] = [doctorEndpoints.list]) {
  const mutation = useMutation<Doctor, CreateDoctorPayload>(doctorEndpoints.create, {
    skipErrorHandling: true,
    invalidate,
  });

  const createDoctor = async (payload: CreateDoctorPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to register doctor");
    return res.data;
  };

  return { createDoctor, isLoading: mutation.isLoading };
}

export function useUpdateDoctor(invalidate: string[] = [doctorEndpoints.list]) {
  const mutation = useMutation<Doctor, UpdateDoctorPayload>("doctors/update", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateDoctor = async (doctorId: string, payload: UpdateDoctorPayload) => {
    const res = await mutation.trigger(payload, doctorEndpoints.update(doctorId));
    if (!res) throw new Error("Failed to update doctor");
    return res.data;
  };

  return { updateDoctor, isLoading: mutation.isLoading };
}

export function useUpdateDoctorStatus(invalidate: string[] = [doctorEndpoints.list]) {
  const mutation = useMutation<Doctor, UpdateDoctorStatusPayload>("doctors/update-status", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateStatus = async (doctorId: string, status: DoctorStatus) => {
    const res = await mutation.trigger({ status }, doctorEndpoints.updateStatus(doctorId));
    if (!res) throw new Error("Failed to update doctor status");
    return res.data;
  };

  return { updateStatus, isLoading: mutation.isLoading };
}

export function useRemoveDoctor(invalidate: string[] = [doctorEndpoints.list]) {
  const mutation = useMutation<unknown, void>("doctors/remove", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const removeDoctor = async (doctorId: string) => {
    const res = await mutation.trigger(undefined, doctorEndpoints.remove(doctorId));
    if (!res) throw new Error("Failed to remove doctor");
  };

  return { removeDoctor, isLoading: mutation.isLoading };
}