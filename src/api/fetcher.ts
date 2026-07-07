import { client } from "./client";
import type { ApiResponse, RequestOptions } from "./types/common";

export async function fetcher<T>(
  url: string,
  config?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await client.get<ApiResponse<T>>(url, config);
  return response.data;
}

export async function post<T, D = unknown>(
  url: string,
  data?: D,
  config?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await client.post<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function put<T, D = unknown>(
  url: string,
  data?: D,
  config?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await client.put<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function patch<T, D = unknown>(
  url: string,
  data?: D,
  config?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await client.patch<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function del<T>(
  url: string,
  config?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await client.delete<ApiResponse<T>>(url, config);
  return response.data;
}

export async function get<T>(
  url: string,
  config?: RequestOptions
): Promise<ApiResponse<T>> {
  const response = await client.get<ApiResponse<T>>(url, config);
  return response.data;
}