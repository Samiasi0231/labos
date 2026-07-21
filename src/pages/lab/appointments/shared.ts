import type { AppointmentStatus } from "@/api/types/appointments";

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  scheduled: {
    label: "Scheduled",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  completed: {
    label: "Completed",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  no_show: {
    label: "No Show",
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
};

export const ALL_STATUSES: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

export function formatDateTime(scheduledAt: string): string {
  const d = new Date(scheduledAt);
  return d.toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function patientName(p: { firstName: string; lastName: string }): string {
  return `${p.firstName} ${p.lastName}`.trim();
}
