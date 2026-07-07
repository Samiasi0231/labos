export const testOrderEndpoints = {
  create: "/test-orders",
  list: "/test-orders",
  get: (orderId: string) => `/test-orders/${orderId}`,
  update: (orderId: string) => `/test-orders/${orderId}`,
  cancel: (orderId: string) => `/test-orders/${orderId}/cancel`,
  collectSample: (orderId: string) => `/test-orders/${orderId}/collect-sample`,
  listItems: (orderId: string) => `/test-orders/${orderId}/items`,
  addItems: (orderId: string) => `/test-orders/${orderId}/items`,
  updateItem: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}`,
  removeItem: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}`,
  assignItem: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}/assign`,
  updateItemStatus: (orderId: string, itemId: string) => `/test-orders/${orderId}/items/${itemId}/status`,
} as const;