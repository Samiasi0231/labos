
export type PatientGender = "male" | "female" | "other";
export type PatientStatus = "active" | "inactive";

export interface PatientAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
}

/** Shape returned inside GET /patients (list) docs — no address/updatedAt included */
export interface PatientListItem {
  _id: string;
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: PatientGender;
  dob: string;
  email?: string;
  status: PatientStatus;
  /**
   * Linked user ID if portal access has been granted, otherwise null/undefined.
   * NOTE: this alone cannot distinguish "invited but not yet accepted" from
   * "active/accepted" — the API doesn't currently expose invite status here.
   */
  user?: string | null;
  createdAt: string;
}

/** Full shape from POST /patients, GET /patients/:id */
export interface Patient extends PatientListItem {
  lab: string;
  address?: PatientAddress;
  updatedAt: string;
}

export interface PatientListResponse {
  docs: PatientListItem[];
  totalDocs: number;
  limit: number;
  page: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PatientListQuery {
  search?: string;
  status?: PatientStatus;
  gender?: PatientGender;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  phone: string;
  gender: PatientGender;
  dob: string;
  email?: string;
  address?: PatientAddress;
}

export interface UpdatePatientPayload {
  firstName?: string;
  lastName?: string;
  gender?: PatientGender;
  dob?: string;
  address?: Partial<PatientAddress>;
}