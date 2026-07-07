import type { User } from "./user";
import type {
  StaffRole,
  StaffStatus,
} from "./enums";
import type { PaginatedResponse } from "./pagination";

export interface StaffMember {
  _id: string;
  user: User;
  firstName: string;
  lastName: string;
  role: StaffRole;
  status: StaffStatus;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type StaffListResponse =
  PaginatedResponse<StaffMember>;

export interface InviteStaffPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  phone?: string;
}

export interface InviteStaffResponse {
  membershipId: string;
}

export interface UpdateStaffRolePayload {
  role: StaffRole;
}

export interface UpdateStaffRoleResponse {
  membershipId: string;
  role: StaffRole;
}

export interface UpdateStaffStatusPayload {
  status: StaffStatus;
}

export interface UpdateStaffStatusResponse {
  membershipId: string;
  status: StaffStatus;
}

export interface StaffListQuery {
  role?: StaffRole;
  status?: StaffStatus;
  page?: number;
  limit?: number;
}