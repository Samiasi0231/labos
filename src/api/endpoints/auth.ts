export const authEndpoints = {
  register: "/auth/register",
  verifyEmail: "/auth/verify-email",
  resendVerification: "/auth/resend-verification",
  login: "/auth/login",
  switch: "/auth/switch",
  refresh: "/auth/refresh-token",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  logout: "/auth/logout",
  inviteInfo: (token: string) => `/auth/invite/${token}`,
  acceptInvite: "/auth/invite/accept",
} as const;


export const endpoints = authEndpoints;