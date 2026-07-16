import type { PortalAccessType } from "@/api/types/enums";

const authEndpoints = {
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


const labEndpoints = {
  create: "/labs",
  update: "/labs",
  me: "/labs/me",
  updateLogo: "/labs/logo",
  dashboard: "/labs/dashboard",
  invite: "/labs/invite",
  resendInvite: "/labs/resend-invite",
  revokeInvite: (accessType: PortalAccessType, identifier: string) =>
    `/labs/invite/${accessType}/${identifier}`,
} as const;

const staffEndpoints = {
  invite: "/staff",
  list: "/staff",
  search: "/staff/search",
  myPermissions: "/staff/me/permissions",
  get: (membershipId: string) => `/staff/${membershipId}`,
  updateRole: (membershipId: string) => `/staff/${membershipId}`,
  updateStatus: (membershipId: string) => `/staff/${membershipId}/status`,
  updatePermissions: (membershipId: string) => `/staff/${membershipId}/permissions`,
  remove: (membershipId: string) => `/staff/${membershipId}`,
} as const;

const userEndpoints = {
  me: "/users/me",
  updateProfile: "/users/me",
  changePassword: "/users/me/password",
  myLabs: "/users/me/labs",
} as const;

const patientEndpoints = {
  create: "/patients",
  list: "/patients",
  search: "/patients/search",
  get: (patientId: string) => `/patients/${patientId}`,
  update: (patientId: string) => `/patients/${patientId}`,
  remove: (patientId: string) => `/patients/${patientId}`,
  activitySummary: (patientId: string) => `/patients/${patientId}/activity-summary`,
} as const;

const doctorEndpoints = {
  create: "/doctors",
  list: "/doctors",
  get: (doctorId: string) => `/doctors/${doctorId}`,
  update: (doctorId: string) => `/doctors/${doctorId}`,
  updateStatus: (doctorId: string) => `/doctors/${doctorId}/status`,
  remove: (doctorId: string) => `/doctors/${doctorId}`,
} as const;

const inventoryEndpoints = {
  create: "/inventory/items",
  list: "/inventory/items",
  get: (itemId: string) => `/inventory/items/${itemId}`,
  update: (itemId: string) => `/inventory/items/${itemId}`,
  remove: (itemId: string) => `/inventory/items/${itemId}`,
  restock: (itemId: string) => `/inventory/items/${itemId}/restock`,
  adjust: (itemId: string) => `/inventory/items/${itemId}/adjust`,
  movements: "/inventory/movements",
  listPresets: "/inventory/presets",
  importPresets: "/inventory/presets/import",
} as const;

const testCatalogEndpoints = {
  create: "/test-catalog",
  list: "/test-catalog",
  get: (testId: string) => `/test-catalog/${testId}`,
  update: (testId: string) => `/test-catalog/${testId}`,
  remove: (testId: string) => `/test-catalog/${testId}`,
  updateStatus: (testId: string) => `/test-catalog/${testId}/status`,
  addParameter: (testId: string) => `/test-catalog/${testId}/parameters`,
  updateParameter: (testId: string, paramId: string) => `/test-catalog/${testId}/parameters/${paramId}`,
  removeParameter: (testId: string, paramId: string) => `/test-catalog/${testId}/parameters/${paramId}`,
  addMaterial: (testId: string) => `/test-catalog/${testId}/materials`,
  updateMaterial: (testId: string, materialId: string) => `/test-catalog/${testId}/materials/${materialId}`,
  removeMaterial: (testId: string, materialId: string) => `/test-catalog/${testId}/materials/${materialId}`,
  listPresets: "/test-catalog/presets",
  importPresets: "/test-catalog/presets/import",
} as const;

const resultsEndpoints = {
  list: "/results",
  get: (resultId: string) => `/results/${resultId}`,
  approve: (resultId: string) => `/results/${resultId}/approve`,
  return: (resultId: string) => `/results/${resultId}/return`,
  release: (resultId: string) => `/results/${resultId}/release`,
  download: (resultId: string) => `/results/${resultId}/download`,
} as const;

const resultEntryEndpoints = {
  entryForm: (orderId: string, itemId: string) =>
    `/test-orders/${orderId}/items/${itemId}/entry-form`,
  saveDraft: (orderId: string, itemId: string) =>
    `/test-orders/${orderId}/items/${itemId}/results`,
  submit: (orderId: string, itemId: string) =>
    `/test-orders/${orderId}/items/${itemId}/results/submit`,
} as const;

const testOrderEndpoints = {
  create: "/test-orders",
  list: "/test-orders",
  get: (orderId: string) => `/test-orders/${orderId}`,
  update: (orderId: string) => `/test-orders/${orderId}`,
  cancel: (orderId: string) => `/test-orders/${orderId}/cancel`,

  collectSample: (orderId: string, itemId: string) =>
    `/test-orders/${orderId}/items/${itemId}/collect-sample`,

  listItems: (orderId: string) => `/test-orders/${orderId}/items`,
  addItems: (orderId: string) => `/test-orders/${orderId}/items`,
  updateItem: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}`,
  removeItem: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}`,

  assignItem: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}/assign`,
  startTest: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}/start-test`,
  updateItemStatus: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}/status`,

  assignments: "/test-orders/assignments",
  downloadResults: (orderId: string) => `/test-orders/${orderId}/results/download`,
} as const;

const activityEndpoints = {
  list: "/labs/activity-logs",
} as const;

const appointmentEndpoints = {
  list: "/appointments",
  get: (id: string) => `/appointments/${id}`,
  create: "/appointments",
  update: (id: string) => `/appointments/${id}`,
  status: (id: string) => `/appointments/${id}/status`,
  checkIn: (id: string) => `/appointments/${id}/check-in`,
} as const;

const searchEndpoints = {
  global: "/labs/search",
} as const;

// ── Patient Portal (self-service) ─────────────────────────────────────────────

const patientPortalEndpoints = {
  // Profile
  me: "/patient/me",
  updateMe: "/patient/me",
  // Results (patient-visible released results only)
  results: "/patient/results",
  result: (resultId: string) => `/patient/results/${resultId}`,
  downloadResult: (resultId: string) => `/patient/results/${resultId}/download`,
  // Test orders
  orders: "/patient/test-orders",
  order: (orderId: string) => `/patient/test-orders/${orderId}`,
  downloadOrder: (orderId: string) => `/patient/test-orders/${orderId}/results/download`,
} as const;

const endpoint = {
  auth: authEndpoints,

  /** Lab portal — all lab management endpoints */
  lab: {
    ...labEndpoints,
    staff: staffEndpoints,
    patients: patientEndpoints,
    doctors: doctorEndpoints,
    inventory: inventoryEndpoints,
    testCatalog: testCatalogEndpoints,
    results: resultsEndpoints,
    resultEntry: resultEntryEndpoints,
    testOrders: testOrderEndpoints,
    activity: activityEndpoints,
    appointments: appointmentEndpoints,
    search: searchEndpoints,
  },

  /** Patient portal — self-service endpoints */
  patient: patientPortalEndpoints,

  /** User account endpoints */
  user: userEndpoints,
};

export default endpoint;
