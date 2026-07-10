export type TestOrderStatus =
  | "pending"
  | "sample_collected"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TestOrderPriority = "routine" | "urgent" | "stat";
import type { PopulatedRef } from "./results";
export type TestOrderItemStatus = "pending" | "in_progress" | "completed";

export interface TestOrderItemParameter {
  _id: string;
  parameterId: string;
  name: string;
  price: number;
}

export interface TestOrderItem {
  _id: string;
  lab: string;
  testOrder: string;
  patient: string;
  testCatalog: string;
  testName: string;
  sampleType: string;
  subtotal: number;
  parameters: TestOrderItemParameter[];
  assignedTo?: PopulatedRef<{ user: string }> | null;
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

export interface CollectSampleItemInput {
  itemId: string;
  sampleType: string;
}

export interface CollectSamplePayload {
  containerType: string;
  items: CollectSampleItemInput[];
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