export const resultsEndpoints = {
  list: "/results",
  get: (resultId: string) => `/results/${resultId}`,
  approve: (resultId: string) => `/results/${resultId}/approve`,
  return: (resultId: string) => `/results/${resultId}/return`,
  release: (resultId: string) => `/results/${resultId}/release`,
} as const;


export const resultEntryEndpoints = {
  entryForm: (orderId: string, itemId: string) =>
    `/test-orders/${orderId}/items/${itemId}/entry-form`,
  saveDraft: (orderId: string, itemId: string) =>
    `/test-orders/${orderId}/items/${itemId}/results`,
  submit: (orderId: string, itemId: string) =>
    `/test-orders/${orderId}/items/${itemId}/results/submit`,
} as const;