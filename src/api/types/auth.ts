import type { NextAction } from "./enums";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  role: string | null;
  labId: string | null;
  nextAction: NextAction;
  access_type?: "staff" | "patient" | "doctor";
}

export interface SwitchTokens {
  access_token: string;
  refresh_token: string;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  role: string;
  labId: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterResponse {
  id: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  access_type: "staff" | "patient";
}

export interface LoginResponse extends AuthTokens {}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface SwitchLabPayload {
  /** Membership _id — backend field name is `identifier` */
  identifier: string;
  access_type: "staff" | "patient" | "doctor";
}

export interface AcceptInvitePayload {
  token: string;
  password?: string;
}

export interface LogoutPayload {
  refresh_token: string;
}