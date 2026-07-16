import { notify } from "@/lib/notify";

type ToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

/**
 * Sonner-backed adapter matching the previous Radix toast API.
 * Prefer `notify` from `@/lib/notify` for new code.
 */
function toast({ title, description, variant }: ToastInput) {
  const primary = title?.trim() || description?.trim() || "Done";
  const opts =
    title && description
      ? { description }
      : undefined;

  if (variant === "destructive") {
    return notify.error(primary, opts);
  }

  // Description-only (no title) → neutral info
  if (!title && description) {
    return notify.info(description);
  }

  return notify.success(primary, opts);
}

function useToast() {
  return {
    toast,
    dismiss: notify.dismiss,
  };
}

export { useToast, toast };
