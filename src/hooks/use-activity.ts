import { useApi } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { ActivityListResponse, ActivityListQuery } from "@/api/types/activity";

function buildUrl(query: ActivityListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.resource) params.set("resource", query.resource);
  if (query.action) params.set("action", query.action);
  if (query.actor) params.set("actor", query.actor);
  if (query.start_date) params.set("start_date", query.start_date);
  if (query.end_date) params.set("end_date", query.end_date);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  return `${endpoint.lab.activity.list}?${params.toString()}`;
}

export function useActivityList(query: ActivityListQuery = {}) {
  const url = buildUrl(query);
  const { data, error, isLoading, isValidating, mutate } = useApi<ActivityListResponse>(url);

  return {
    activities: data?.data?.docs ?? [],
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
