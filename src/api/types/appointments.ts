export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface AppointmentPatient {
  _id: string;
  firstName: string;
  lastName: string;
  code: string;
  phone: string;
}

export interface AppointmentTestCatalog {
  _id: string;
  name: string;
  code: string;
  category: string;
}

export interface AppointmentBranch {
  _id: string;
  name: string;
  location?: string;
}

export interface AppointmentBookedBy {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface AppointmentTestOrder {
  _id: string;
  status: string;
  totalPrice: number;
  priority: string;
  date: string;
}

export interface Appointment {
  _id: string;
  patient: AppointmentPatient;
  testCatalogs: AppointmentTestCatalog[];
  branch?: AppointmentBranch;
  bookedBy?: AppointmentBookedBy;
  testOrder?: AppointmentTestOrder;
  status: AppointmentStatus;
  scheduledAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentListResponse {
  docs: Appointment[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateAppointmentPayload {
  patient: string;
  testCatalogs: string[];
  scheduledAt: string;
  branch?: string;
  notes?: string;
}

export interface UpdateAppointmentStatusPayload {
  status: AppointmentStatus;
}

export interface CheckInPayload {
  priority?: "routine" | "urgent" | "stat";
  notes?: string;
}
