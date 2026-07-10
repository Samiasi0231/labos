export const inventoryEndpoints = {
  create: "/inventory/items",
  list: "/inventory/items",
  get: (itemId: string) => `/inventory/items/${itemId}`,
  update: (itemId: string) => `/inventory/items/${itemId}`,
  remove: (itemId: string) => `/inventory/items/${itemId}`,
  restock: (itemId: string) => `/inventory/items/${itemId}/restock`,
  adjust: (itemId: string) => `/inventory/items/${itemId}/adjust`,
  movements: "/inventory/movements",
} as const;