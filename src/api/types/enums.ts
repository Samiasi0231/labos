export type NextAction =
  | "create_lab"
  | "select_lab"
  | null;

export type StaffRole =
  | "manager"
  | "scientist"
  | "technician"
  | "receptionist";

export type StaffStatus =
  | "active"
  | "inactive"
  | "pending";

export type LabStatus =
  | "active"
  | "suspended";

export type PortalAccessType =
  | "staff"
  | "patient"
  | "doctor";