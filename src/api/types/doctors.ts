
export type DoctorStatus = "active" | "inactive";

export interface Doctor {
  _id: string;
  lab: string;
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
  email: string;
  hospital: string;
  status: DoctorStatus;
  /** Linked user ID if portal access has been granted — see derivePortalAccess() limitation notes */
  user?: string | null;
  requestsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListResponse {
  docs: Doctor[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DoctorListQuery {
  search?: string;
  status?: DoctorStatus;
  specialty?: string;
  page?: number;
  limit?: number;
}

export interface CreateDoctorPayload {
  firstName: string;
  lastName: string;
  specialty: string;
  phone: string;
  email: string;
  hospital: string;
}

export interface UpdateDoctorPayload {
  firstName?: string;
  lastName?: string;
  specialty?: string;
  phone?: string;
  hospital?: string;
}

export interface UpdateDoctorStatusPayload {
  status: DoctorStatus;
}