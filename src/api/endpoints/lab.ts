import type { PortalAccessType } from "@/api/types/enums";

export const labEndpoints = {
  create: "/labs",
  update: "/labs",
  me: "/labs/me",
  updateLogo: "/labs/logo",
  invite: "/labs/invite",
  resendInvite: "/labs/resend-invite",
  revokeInvite: (accessType: PortalAccessType, identifier: string) =>
    `/labs/invite/${accessType}/${identifier}`,
} as const;