// ── Inventory ────────────────────────────────────────────────

export type InventoryCategory = "reagent" | "kit" | "consumable";
export type InventoryStatus = "active" | "inactive";
export type MovementType = "restock" | "consumption" | "adjustment" | "expired";

export interface InventoryItem {
  _id: string;
  lab: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number;
  supplier?: string;
  expiryDate?: string;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryListResponse {
  docs: InventoryItem[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface InventoryListQuery {
  search?: string;
  category?: InventoryCategory;
  status?: InventoryStatus;
  lowStock?: boolean;
  expiringBefore?: string;
  page?: number;
  limit?: number;
}

export interface CreateInventoryItemPayload {
  name: string;
  sku: string;
  category: InventoryCategory;
  unit: string;
  reorderLevel: number;
  unitCost: number;
  supplier?: string;
  expiryDate?: string;
  status?: InventoryStatus;
}

export interface UpdateInventoryItemPayload {
  name?: string;
  sku?: string;
  category?: InventoryCategory;
  unit?: string;
  reorderLevel?: number;
  unitCost?: number;
  supplier?: string;
  expiryDate?: string;
  status?: InventoryStatus;
}

export interface RestockPayload {
  quantity: number;
  unitCost?: number;
  supplier?: string;
  expiryDate?: string;
  note?: string;
}

export interface AdjustStockPayload {
  quantityChange: number;
  reason: string;
  type?: "adjustment" | "expired";
}


export interface StockMovement {
  _id: string;
  lab: string;
  inventoryItem: string;
  type: MovementType;
  quantityChange: number;
  quantityAfter: number;
  referenceType?: string;
  referenceId?: string;
  reason?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}


export interface StockMutationResponse {
  item: InventoryItem;
  movement: StockMovement;
}

export interface StockMovementListResponse {
  docs: StockMovement[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface StockMovementListQuery {
  itemId?: string;
  type?: MovementType;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}