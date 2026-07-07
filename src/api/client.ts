import axios, { type AxiosError } from "axios";
import type { ApiError, ApiResponse, RequestOptions} from "./types/common";
import type{ AuthTokens,SwitchTokens } from "./types/auth";
import { STORAGE_KEYS } from "@/lib/contant";
import { endpoints } from "./endpoints/auth";
import dayjs from "dayjs";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const requestHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const client = axios.create({
  baseURL,
  headers: requestHeaders,
});


export function getStoredAuth(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: AuthTokens | SwitchTokens): void {
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

function isRefreshTokenExpired(auth: AuthTokens | null): boolean {
  if (!auth?.refresh_token_expires_at) return true;
  const expiresAt = dayjs(auth.refresh_token_expires_at);
  return !expiresAt.isValid() || expiresAt.isBefore(dayjs());
}

function normalizeError(error: AxiosError): ApiError {
  const status = error.response?.status;
  const body = error.response?.data as ApiError | undefined;
  return {
    message: body?.message ?? error.message ?? "Request failed",
    status,
    errors: body?.errors,
    data: body?.data,
  };
}


let refreshPromise: Promise<string> | null = null;
let isLoggingOut = false;

function clearSessionAndRedirect(): void {
  if (isLoggingOut) return;
  isLoggingOut = true;
  clearStoredAuth();
  window.location.replace("/signin");
}

function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const auth = getStoredAuth();

    if (isRefreshTokenExpired(auth) || !auth?.refresh_token) {
      throw new Error("Session expired");
    }

    const { data } = await client.post<ApiResponse<AuthTokens>>(
      endpoints.refresh,
      { refresh_token: auth.refresh_token },
      { skipAuth: true } as RequestOptions
    );

    if (!data?.data?.access_token) {
      throw new Error("Refresh failed");
    }

    setStoredAuth(data.data);
    return data.data.access_token;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}


type RetriedConfig = RequestOptions & { _retriedAfterRefresh?: boolean };

client.interceptors.request.use((config) => {
  const options = config as RequestOptions;
  if (options.skipAuth) return config;

  const auth = getStoredAuth();
  if (auth) {
    if (isRefreshTokenExpired(auth)) {
      clearSessionAndRedirect();
      return Promise.reject(new Error("Session expired"));
    }
    config.headers.Authorization = `Bearer ${auth.access_token}`;
  }

  return config;
});


client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config;
    const apiError = normalizeError(error);

    if (
      error.response?.status === 401 &&
      config &&
      !(config as RetriedConfig)._retriedAfterRefresh
    ) {
      try {
        const accessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${accessToken}`;
        (config as RetriedConfig)._retriedAfterRefresh = true;
        return client.request(config);
      } catch {
        clearSessionAndRedirect();
        return Promise.reject(apiError);
      }
    }

    return Promise.reject(apiError);
  }
);