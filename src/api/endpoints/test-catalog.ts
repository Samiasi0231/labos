export const testCatalogEndpoints = {
  create: "/test-catalog",
  list: "/test-catalog",
  get: (testId: string) => `/test-catalog/${testId}`,
  update: (testId: string) => `/test-catalog/${testId}`,
  remove: (testId: string) => `/test-catalog/${testId}`,
  updateStatus: (testId: string) => `/test-catalog/${testId}/status`,
  addParameter: (testId: string) => `/test-catalog/${testId}/parameters`,
  updateParameter: (testId: string, paramId: string) => `/test-catalog/${testId}/parameters/${paramId}`,
  removeParameter: (testId: string, paramId: string) => `/test-catalog/${testId}/parameters/${paramId}`,
} as const;