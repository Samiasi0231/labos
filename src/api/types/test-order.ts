export type TestOrderStatus =
  | "pending"
  | "sample_collected"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TestOrderPriority = "routine" | "urgent" | "stat";

// pending → assigned → in_progress → completed  (per guide)
export type TestOrderItemStatus = "pending" | "assigned" | "in_progress" | "completed";

export interface AssignedTo {
  _id: string;
  role: string;
  user: { _id: string; firstName: string; lastName: string } | string;
}

export interface TestOrderItemParameter {
  _id: string;
  parameterId: string;
  name: string;
  price: number;
  unit?: string;
  type?: string;
  referenceRange?: {
    male?: { min: number; max: number };
    female?: { min: number; max: number };
    general?: { min: number; max: number };
  };
}

export interface MaterialUsage {
  catalogMaterialId: string;
  inventoryItem: string | { _id: string; name: string; unit: string; quantityOnHand: number };
  phase: "collection" | "analysis";
  quantity: number;
}

export interface TestOrderItem {
  _id: string;
  lab: string;
  testOrder: string;
  patient: string;
  testCatalog: string;
  testName: string;
  /** Array of sample descriptions e.g. ["EDTA whole blood"] */
  samples: string[];
  sampleCollectedAt: string | null;
  testStartedAt: string | null;
  subtotal: number;
  parameters: TestOrderItemParameter[];
  materials: MaterialUsage[];
  assignedTo?: AssignedTo | null;
  status: TestOrderItemStatus;
  createdAt: string;
  updatedAt: string;
}
export interface TestOrderPatient {
  _id: string;
  name: string;
  gender?: "Male" | "Female";
  [key: string]: unknown;
}

export interface TestOrder {
  _id: string;
  lab: string;
  patient: TestOrderPatient | string;
  priority: TestOrderPriority;
  status: TestOrderStatus;
  totalPrice: number;
  items: TestOrderItem[];
  containerType?: string;
  sampleCollectedBy?: string;
  sampleCollectedAt?: string;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestOrderListResponse {
  docs: TestOrder[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TestOrderListQuery {
  patient?: string;
  status?: TestOrderStatus;
  priority?: TestOrderPriority;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}


export interface CreateTestOrderItemInput {
  testCatalogId: string;
  parameterIds: string[];
}

export interface CreateTestOrderPayload {
  patient: string;
  priority: TestOrderPriority;
  notes?: string;
  items: CreateTestOrderItemInput[];
}

export interface UpdateTestOrderPayload {
  priority?: TestOrderPriority;
  notes?: string;
}

/** Per-item collect-sample payload — POST /test-orders/:orderId/items/:itemId/collect-sample */
export interface MaterialInput {
  catalogMaterialId: string;
  quantity: number;
}

export interface CollectSamplePayload {
  /** What was physically collected e.g. ["EDTA whole blood"] */
  samples: string[];
  /** Collection-phase inventory items consumed (can be empty) */
  materials: MaterialInput[];
}

/** Per-item start-test payload — POST /test-orders/:orderId/items/:itemId/start-test */
export interface StartTestPayload {
  /** Analysis-phase inventory items consumed (can be empty) */
  materials: MaterialInput[];
}

export interface AddTestOrderItemsPayload {
  items: CreateTestOrderItemInput[];
}

export interface UpdateTestOrderItemPayload {
  parameterIds: string[];
}

export interface AssignTestOrderItemPayload {
  assignedTo: string;
}

export interface UpdateTestOrderItemStatusPayload {
  status: TestOrderItemStatus;
}

// ── Assignments (GET /test-orders/assignments) ─────────────────────────────

export interface AssignmentPatient {
  _id: string;
  firstName: string;
  lastName: string;
  code?: string;
  phone?: string;
  gender?: string;
}

export interface AssignmentOrder {
  _id: string;
  status: TestOrderStatus;
  priority: TestOrderPriority;
  date: string;
  patient: AssignmentPatient;
}

/** A TestOrderItem with its parent order + patient populated */
export interface AssignmentItem extends Omit<TestOrderItem, "testOrder" | "patient"> {
  testOrder: AssignmentOrder;
}

export interface AssignmentListResponse {
  docs: AssignmentItem[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AssignmentListQuery {
  status?: TestOrderItemStatus;
  page?: number;
  limit?: number;
}