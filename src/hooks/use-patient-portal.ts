import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  PatientPortalProfile,
  UpdatePatientPortalProfilePayload,
  PatientOrderListResponse,
  PatientOrderDetail,
  PatientOrderListQuery,
} from "@/api/types";
import type {
  PatientResultListResponse,
  PatientResultDetail,
  PatientResultListQuery,
} from "@/api/types";

// ── Profile ───────────────────────────────────────────────────────────────────

export function usePatientProfile() {
  const { data, error, isLoading, mutate } = useApi<PatientPortalProfile>(
    endpoint.patient.me
  );
  return {
    profile: data?.data ?? null,
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useUpdatePatientProfile() {
  return useMutation<PatientPortalProfile, UpdatePatientPortalProfilePayload>(
    endpoint.patient.updateMe,
    { method: "PATCH", invalidate: [endpoint.patient.me] }
  );
}

// ── Results ───────────────────────────────────────────────────────────────────

function buildResultsUrl(query: PatientResultListQuery): string {
  const params = new URLSearchParams();
  if (query.page)       params.set("page",       String(query.page));
  if (query.limit)      params.set("limit",      String(query.limit));
  if (query.start_date) params.set("start_date", query.start_date);
  if (query.end_date)   params.set("end_date",   query.end_date);
  const qs = params.toString();
  return qs ? `${endpoint.patient.results}?${qs}` : endpoint.patient.results;
}

export function usePatientResults(query: PatientResultListQuery = {}) {
  const url = buildResultsUrl(query);
  const { data, error, isLoading, isValidating, mutate } =
    useApi<PatientResultListResponse>(url);
  return {
    results:    data?.data?.docs ?? [],
    pagination: data?.data
      ? {
          page:       data.data.page,
          totalPages: data.data.totalPages,
          totalDocs:  data.data.totalDocs,
          hasNext:    data.data.hasNextPage,
          hasPrev:    data.data.hasPrevPage,
        }
      : null,
    isLoading,
    isValidating,
    refetch: mutate,
  };
}

export function usePatientResult(resultId: string | undefined) {
  const { data, error, isLoading } = useApi<PatientResultDetail>(
    resultId ? endpoint.patient.result(resultId) : null
  );
  return { result: data?.data ?? null, isLoading, error };
}

// ── Orders ────────────────────────────────────────────────────────────────────

function buildOrdersUrl(query: PatientOrderListQuery): string {
  const params = new URLSearchParams();
  if (query.page)   params.set("page",   String(query.page));
  if (query.limit)  params.set("limit",  String(query.limit));
  if (query.status) params.set("status", query.status);
  const qs = params.toString();
  return qs ? `${endpoint.patient.orders}?${qs}` : endpoint.patient.orders;
}

export function usePatientOrders(query: PatientOrderListQuery = {}) {
  const url = buildOrdersUrl(query);
  const { data, error, isLoading, isValidating, mutate } =
    useApi<PatientOrderListResponse>(url);
  return {
    orders: data?.data?.docs ?? [],
    pagination: data?.data
      ? {
          page:       data.data.page,
          totalPages: data.data.totalPages,
          totalDocs:  data.data.totalDocs,
          hasNext:    data.data.hasNextPage,
          hasPrev:    data.data.hasPrevPage,
        }
      : null,
    isLoading,
    isValidating,
    refetch: mutate,
  };
}

export function usePatientOrder(orderId: string | undefined) {
  const { data, error, isLoading } = useApi<PatientOrderDetail>(
    orderId ? endpoint.patient.order(orderId) : null
  );
  return { order: data?.data ?? null, isLoading, error };
}
