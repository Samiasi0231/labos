import type { Address } from "./common";
import type { LabStatus, PortalAccessType } from "./enums";

export interface CreateLabPayload {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface LabSubscriptionLimits {
  maxStaff: number;
  maxBranches: number;
  maxPatients: number;
}

export interface LabSubscription {
  plan: string;
  status: string;
  limits: LabSubscriptionLimits;
  currentPeriodEnd: string;
}

export interface Lab {
  _id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: Address;
  logo?: string;
  status: LabStatus;
  subscription?: LabSubscription;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLabPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: Partial<Address>;
}

/** Response `data` from PATCH /labs/logo (multipart upload). */
export interface UpdateLabLogoResponse {
  logo: string;
}

export interface GrantPortalAccessPayload {
  identifier: string;
  access_type: PortalAccessType;
}

export interface ResendPortalInvitePayload {
  type: PortalAccessType;
  identifier: string;
}