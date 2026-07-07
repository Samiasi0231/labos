export const staffEndpoints = {
  invite: "/staff",
  list: "/staff",
  get: (membershipId: string) => `/staff/${membershipId}`,
  updateRole: (membershipId: string) => `/staff/${membershipId}`,
  updateStatus: (membershipId: string) => `/staff/${membershipId}/status`,
  remove: (membershipId: string) => `/staff/${membershipId}`,
} as const;