import useSWR, { type SWRConfiguration } from "swr";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import { fetcher, get, post, put, patch, del } from "@/api/fetcher";
import type { ApiError, ApiResponse } from "@/api/types/common";
import type { GlobalSearchResult } from "@/api/types/search";
import { toast } from "sonner";
import endpoint from "@/api/endpoints";
export { default as useDebounce } from "./use-debounce";
import useDebounce from "./use-debounce";

interface MyPermissionsResponse {
  role: string;
  isAdmin: boolean;
  permissions: {
    permission: string;
    description: string;
  }[];
}

const TOAST_IDS = {
  AUTH_ERROR: "auth-error",
  NETWORK_ERROR: "network-error",
} as const;

function isNetworkError(err: ApiError): boolean {
  return err.status == null;
}

function showApiErrorToast(err: ApiError) {
  if (err.status === 401) {
    toast.error("Session expired. Please sign in again.", {
      id: TOAST_IDS.AUTH_ERROR,
    });
    return;
  }
  if (isNetworkError(err)) {
    toast.error(err.message || "Network error. Check your connection.", {
      id: TOAST_IDS.NETWORK_ERROR,
    });
    return;
  }
  toast.error(err.message);
}


export interface UseApiOptions {
  skipErrorHandling?: boolean;
  onError?: (error: ApiError) => void;
  onSuccess?: (data: ApiResponse<unknown>) => void;
}

export function useApi<T>(
  endpoint: string | null,
  options: UseApiOptions & SWRConfiguration<ApiResponse<T>, ApiError> = {}
) {
  const {
    skipErrorHandling = false,
    onError,
    onSuccess,
    ...swrConfig
  } = options;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    ApiResponse<T>,
    ApiError
  >(endpoint, (url) => fetcher<T>(url), {
    ...swrConfig,
    onError: (err) => {
      if (!skipErrorHandling) showApiErrorToast(err);
      onError?.(err);
    },
    onSuccess: (data) => {
      onSuccess?.(data as ApiResponse<unknown>);
    },
  });

  return { data, error, isLoading, isValidating, mutate };
}


type Method = "POST" | "PUT" | "PATCH" | "DELETE" | "GET";

export interface UseMutationOptions<TResponse> {
  method?: Method;
  skipErrorHandling?: boolean;
  onSuccess?: (data: ApiResponse<TResponse>) => void;
  onError?: (error: ApiError) => void;
  invalidate?: string[];
}

export function useMutation<TResponse = unknown, TRequest = unknown>(
  endpoint: string,
  options: UseMutationOptions<TResponse> = {}
) {
  const {
    method = "POST",
    skipErrorHandling = false,
    onSuccess,
    onError,
    invalidate = [],
  } = options;
  const { mutate: globalMutate } = useSWRConfig();

  const fetcherFn = async (
    _key: string,
    { arg }: { arg: { data?: TRequest; url?: string } }
  ): Promise<ApiResponse<TResponse>> => {
    const url = arg.url ?? endpoint;

    switch (method.toUpperCase()) {
      case "PUT":
        return put<TResponse, TRequest>(url, arg.data);
      case "PATCH":
        return patch<TResponse, TRequest>(url, arg.data);
      case "DELETE":
        return del<TResponse>(url);
      case "GET":
        return get<TResponse>(url);
      default:
        return post<TResponse, TRequest>(url, arg.data);
    }
  };

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    endpoint,
    fetcherFn,
    {
      throwOnError: false,
      onSuccess: (data) => {
        invalidate.forEach((key) => globalMutate(key));
        onSuccess?.(data);
      },
      onError: (err: ApiError) => {
        if (!skipErrorHandling) showApiErrorToast(err);
        onError?.(err);
      },
    }
  );

  const triggerFn = async (data?: TRequest, url?: string) => {
    try {
      return await trigger({ data, url });
    } catch (e) {
      if (skipErrorHandling) throw e;
      return undefined;
    }
  };

  return {
    trigger: triggerFn,
    data,
    error,
    isLoading: isMutating,
    reset,
  };
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

export function useGlobalSearch(q: string, types?: string[]) {
  const debounced = useDebounce(q.trim(), 350);
  const params = new URLSearchParams();
  if (debounced) params.set("q", debounced);
  if (types?.length) params.set("types", types.join(","));
  params.set("limit", "5");

  const url = debounced.length >= 2 ? `/labs/search?${params.toString()}` : null;
  const { data, isLoading } = useApi<GlobalSearchResult>(url, { keepPreviousData: true } as any);

  return {
    results: data?.data ?? null,
    isLoading,
    hasQuery: debounced.length >= 2,
  };
}