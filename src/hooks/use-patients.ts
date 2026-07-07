import { useApi, useMutation } from "@/hooks/use-api";
import { patientEndpoints } from "@/api/endpoints/patients";
import type {
  Patient,
  PatientListResponse,
  PatientListQuery,
  CreatePatientPayload,
  UpdatePatientPayload,
} from "@/api/types/patients";

function buildPatientListUrl(query: PatientListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.gender) params.set("gender", query.gender);
  if (query.start_date) params.set("start_date", query.start_date);
  if (query.end_date) params.set("end_date", query.end_date);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  return `${patientEndpoints.list}?${params.toString()}`;
}

export function usePatientsList(query: PatientListQuery = {}) {
  const url = buildPatientListUrl(query);
  const { data, error, isLoading, isValidating, mutate } = useApi<PatientListResponse>(url);

  return {
    patients: data?.data?.docs ?? [],
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

export function usePatient(patientId: string | null) {
  const { data, error, isLoading, mutate } = useApi<Patient>(
    patientId ? patientEndpoints.get(patientId) : null
  );
  return { patient: data?.data ?? null, error, isLoading, refetch: mutate };
}

export function useCreatePatient(invalidate: string[] = [patientEndpoints.list]) {
  const mutation = useMutation<Patient, CreatePatientPayload>(patientEndpoints.create, {
    skipErrorHandling: true,
    invalidate,
  });

  const createPatient = async (payload: CreatePatientPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to register patient");
    return res.data;
  };

  return { createPatient, isLoading: mutation.isLoading };
}

export function useUpdatePatient(invalidate: string[] = [patientEndpoints.list]) {
  const mutation = useMutation<Patient, UpdatePatientPayload>("patients/update", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updatePatient = async (patientId: string, payload: UpdatePatientPayload) => {
    const res = await mutation.trigger(payload, patientEndpoints.update(patientId));
    if (!res) throw new Error("Failed to update patient");
    return res.data;
  };

  return { updatePatient, isLoading: mutation.isLoading };
}

export function useDeletePatient(invalidate: string[] = [patientEndpoints.list]) {
  const mutation = useMutation<unknown, void>("patients/delete", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const deletePatient = async (patientId: string) => {
    const res = await mutation.trigger(undefined, patientEndpoints.remove(patientId));
    if (!res) throw new Error("Failed to delete patient");
  };

  return { deletePatient, isLoading: mutation.isLoading };
}