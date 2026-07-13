import type { TestOrderStatus, TestOrderPriority } from "./test-order";

// ── Profile ───────────────────────────────────────────────────────────────────

export interface PatientAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}

/** Merged profile returned by GET /patient/me */
export interface PatientPortalProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  patientCode: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  address?: PatientAddress;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** PATCH /patient/me — strictObject: only these three fields accepted */
export interface UpdatePatientPortalProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ── Orders ────────────────────────────────────────────────────────────────────

/** Item shape in the orders *list* (GET /patient/test-orders) */
export interface PatientOrderListItem {
  _id: string;
  testName: string;
  status: TestOrderStatus;
}

/** Order shape in the orders *list* */
export interface PatientOrder {
  _id: string;
  status: TestOrderStatus;
  priority: TestOrderPriority;
  date: string;
  totalPrice: number;
  notes?: string;
  items: PatientOrderListItem[];
  createdAt: string;
  updatedAt: string;
}

/** Item shape in the order *detail* (GET /patient/test-orders/:orderId) */
export interface PatientOrderDetailItem {
  _id: string;
  testName: string;
  status: TestOrderStatus;
  samples: string[];
  sampleCollectedAt?: string;
  testStartedAt?: string;
  subtotal: number;
  parameters: { _id: string; name: string; unit?: string }[];
}

/** Full order shape from GET /patient/test-orders/:orderId */
export interface PatientOrderDetail extends Omit<PatientOrder, "items"> {
  lab: string;
  patient: string;
  items: PatientOrderDetailItem[];
}

export interface PatientOrderListResponse {
  docs: PatientOrder[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PatientOrderListQuery {
  page?: number;
  limit?: number;
  status?: TestOrderStatus;
}
