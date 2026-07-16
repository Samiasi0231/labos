import { toast, type ExternalToast } from "sonner";
import type { ApiError, ApiResponse, ValidationError } from "@/api/types/common";

const TOAST_IDS = {
  AUTH_ERROR: "auth-error",
  NETWORK_ERROR: "network-error",
} as const;

function validationSummary(errors?: ValidationError[]): string | undefined {
  if (!errors?.length) return undefined;
  const parts = errors
    .map((e) => e.message || e.msg)
    .filter(Boolean) as string[];
  if (!parts.length) return undefined;
  return parts.slice(0, 3).join(" · ");
}

export function apiErrorMessage(
  err: ApiError,
  fallback = "Something went wrong",
): string {
  return err.message?.trim() || fallback;
}

export function apiSuccessMessage(
  res: Pick<ApiResponse<unknown>, "message">,
  fallback: string,
): string {
  return res.message?.trim() || fallback;
}

export const notify = {
  success(message: string, opts?: ExternalToast) {
    return toast.success(message, opts);
  },

  error(message: string, opts?: ExternalToast) {
    return toast.error(message, opts);
  },

  info(message: string, opts?: ExternalToast) {
    return toast.info(message, opts);
  },

  message(message: string, opts?: ExternalToast) {
    return toast(message, opts);
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  fromApiError(err: ApiError, fallback = "Something went wrong") {
    if (err.status === 401) {
      return toast.error("Session expired. Please sign in again.", {
        id: TOAST_IDS.AUTH_ERROR,
      });
    }

    if (err.status == null) {
      return toast.error(err.message || "Network error. Check your connection.", {
        id: TOAST_IDS.NETWORK_ERROR,
      });
    }

    const description = validationSummary(err.errors);
    return toast.error(apiErrorMessage(err, fallback), {
      description,
    });
  },

  fromApiSuccess(
    res: Pick<ApiResponse<unknown>, "message">,
    fallback: string,
    opts?: ExternalToast,
  ) {
    return toast.success(apiSuccessMessage(res, fallback), opts);
  },
};
