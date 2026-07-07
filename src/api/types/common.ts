import type { AxiosRequestConfig } from "axios";

export interface ApiResponse<T> {
  message: string;
  data: T | null;
  errors?: ValidationError[];
}

export interface ValidationError {
  path?: string;
  param?: string;
  message?: string;
  msg?: string;
  location?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: ValidationError[];
  data?: Record<string, unknown>;
}

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
}