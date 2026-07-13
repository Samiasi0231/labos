import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  TestOrder,
  TestOrderItem,
  TestOrderListResponse,
  TestOrderListQuery,
  CreateTestOrderPayload,
  UpdateTestOrderPayload,
  CollectSamplePayload,
  StartTestPayload,
  AddTestOrderItemsPayload,
  UpdateTestOrderItemPayload,
  AssignTestOrderItemPayload,
  UpdateTestOrderItemStatusPayload,
  AssignmentListResponse,
  AssignmentListQuery,
} from "@/api/types/test-order";

function buildListUrl(query: TestOrderListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.patient) params.set("patient", query.patient);
  if (query.status) params.set("status", query.status);
  if (query.priority) params.set("priority", query.priority);
  if (query.start_date) params.set("start_date", query.start_date);
  if (query.end_date) params.set("end_date", query.end_date);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  return `${endpoint.lab.testOrders.list}?${params.toString()}`;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useTestOrderList(query: TestOrderListQuery = {}) {
  const url = buildListUrl(query);
  const { data, error, isLoading, isValidating, mutate } =
    useApi<TestOrderListResponse>(url);

  return {
    orders: data?.data?.docs ?? [],
    pagination: data?.data
      ? {
          totalDocs: data.data.totalDocs,
          page: data.data.page,
          totalPages: data.data.totalPages,
          hasNextPage: data.data.hasNextPage,
          hasPrevPage: data.data.hasPrevPage,
        }
      : null,
    error,
    isLoading,
    isValidating,
    refetch: mutate,
    listUrl: url,
  };
}

export function useTestOrder(orderId: string | null) {
  const url = orderId ? endpoint.lab.testOrders.get(orderId) : null;
  const { data, error, isLoading, isValidating, mutate } =
    useApi<TestOrder>(url);

  return {
    order: data?.data,
    error,
    isLoading,
    isValidating,
    refetch: mutate,
  };
}

export function useTestOrderItemList(orderId: string | null) {
  const url = orderId ? endpoint.lab.testOrders.listItems(orderId) : null;
  const { data, error, isLoading, isValidating, mutate } =
    useApi<TestOrderItem[]>(url);

  return {
    items: data?.data ?? [],
    error,
    isLoading,
    isValidating,
    refetch: mutate,
  };
}

function buildAssignmentsUrl(query: AssignmentListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 20));
  return `${endpoint.lab.testOrders.assignments}?${params.toString()}`;
}

export function useAssignments(query: AssignmentListQuery = {}) {
  const url = buildAssignmentsUrl(query);
  const { data, error, isLoading, isValidating, mutate } =
    useApi<AssignmentListResponse>(url);

  return {
    items: data?.data?.docs ?? [],
    pagination: data?.data
      ? {
          totalDocs: data.data.totalDocs,
          page: data.data.page,
          totalPages: data.data.totalPages,
          hasNextPage: data.data.hasNextPage,
          hasPrevPage: data.data.hasPrevPage,
        }
      : null,
    error,
    isLoading,
    isValidating,
    refetch: mutate,
  };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateTestOrder(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<TestOrder, CreateTestOrderPayload>(
    endpoint.lab.testOrders.create,
    { skipErrorHandling: true, invalidate },
  );

  const createTestOrder = async (payload: CreateTestOrderPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to create test order");
    return res.data;
  };

  return { createTestOrder, isLoading: mutation.isLoading };
}

export function useUpdateTestOrder(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<TestOrder, UpdateTestOrderPayload>(
    "test-orders/update",
    { method: "PATCH", skipErrorHandling: true, invalidate },
  );

  const updateTestOrder = async (
    orderId: string,
    payload: UpdateTestOrderPayload,
  ) => {
    const res = await mutation.trigger(
      payload,
      endpoint.lab.testOrders.update(orderId),
    );
    if (!res) throw new Error("Failed to update test order");
    return res.data;
  };

  return { updateTestOrder, isLoading: mutation.isLoading };
}

export function useCancelTestOrder(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<TestOrder, void>("test-orders/cancel", {
    skipErrorHandling: true,
    invalidate,
  });

  const cancelTestOrder = async (orderId: string) => {
    const res = await mutation.trigger(
      undefined,
      endpoint.lab.testOrders.cancel(orderId),
    );
    if (!res) throw new Error("Failed to cancel test order");
    return res.data;
  };

  return { cancelTestOrder, isLoading: mutation.isLoading };
}

/**
 * Collect sample for a single test item.
 * Guide: POST /test-orders/:orderId/items/:itemId/collect-sample
 * Body: { samples: string[], materials: [{ catalogMaterialId, quantity }] }
 */
export function useCollectSample(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<TestOrderItem, CollectSamplePayload>(
    "test-orders/collect-sample",
    { skipErrorHandling: true, invalidate },
  );

  const collectSample = async (
    orderId: string,
    itemId: string,
    payload: CollectSamplePayload,
  ) => {
    const res = await mutation.trigger(
      payload,
      endpoint.lab.testOrders.collectSample(orderId, itemId),
    );
    if (!res) throw new Error("Failed to collect sample");
    return res.data;
  };

  return { collectSample, isLoading: mutation.isLoading };
}

/**
 * Start test for a single item — only the assigned scientist or a manager.
 * Guide: POST /test-orders/:orderId/items/:itemId/start-test
 * Body: { materials: [{ catalogMaterialId, quantity }] }
 * Effect: item → in_progress, order → in_progress
 */
export function useStartTest(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<TestOrderItem, StartTestPayload>(
    "test-orders/start-test",
    { skipErrorHandling: true, invalidate },
  );

  const startTest = async (
    orderId: string,
    itemId: string,
    payload: StartTestPayload,
  ) => {
    const res = await mutation.trigger(
      payload,
      endpoint.lab.testOrders.startTest(orderId, itemId),
    );
    if (!res) throw new Error("Failed to start test");
    return res.data;
  };

  return { startTest, isLoading: mutation.isLoading };
}

export function useAddTestOrderItems(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<TestOrderItem[], AddTestOrderItemsPayload>(
    "test-orders/add-items",
    { skipErrorHandling: true, invalidate },
  );

  const addTestOrderItems = async (
    orderId: string,
    payload: AddTestOrderItemsPayload,
  ) => {
    const res = await mutation.trigger(
      payload,
      endpoint.lab.testOrders.addItems(orderId),
    );
    if (!res) throw new Error("Failed to add items to test order");
    return res.data;
  };

  return { addTestOrderItems, isLoading: mutation.isLoading };
}

export function useUpdateTestOrderItem(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<TestOrderItem, UpdateTestOrderItemPayload>(
    "test-orders/update-item",
    { method: "PATCH", skipErrorHandling: true, invalidate },
  );

  const updateTestOrderItem = async (
    orderId: string,
    itemId: string,
    payload: UpdateTestOrderItemPayload,
  ) => {
    const res = await mutation.trigger(
      payload,
      endpoint.lab.testOrders.updateItem(orderId, itemId),
    );
    if (!res) throw new Error("Failed to update test order item");
    return res.data;
  };

  return { updateTestOrderItem, isLoading: mutation.isLoading };
}

export function useRemoveTestOrderItem(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<unknown, void>("test-orders/remove-item", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const removeTestOrderItem = async (orderId: string, itemId: string) => {
    const res = await mutation.trigger(
      undefined,
      endpoint.lab.testOrders.removeItem(orderId, itemId),
    );
    if (!res) throw new Error("Failed to remove test order item");
  };

  return { removeTestOrderItem, isLoading: mutation.isLoading };
}

export function useAssignTestOrderItem(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<TestOrderItem, AssignTestOrderItemPayload>(
    "test-orders/assign-item",
    { method: "PATCH", skipErrorHandling: true, invalidate },
  );

  const assignTestOrderItem = async (
    orderId: string,
    itemId: string,
    payload: AssignTestOrderItemPayload,
  ) => {
    const res = await mutation.trigger(
      payload,
      endpoint.lab.testOrders.assignItem(orderId, itemId),
    );
    if (!res) throw new Error("Failed to assign test order item");
    return res.data;
  };

  return { assignTestOrderItem, isLoading: mutation.isLoading };
}

/**
 * Update item status — only in_progress → completed transition is valid.
 * Guide: PATCH /test-orders/:orderId/items/:itemId/status
 * When all items complete → order status → completed (backend handles)
 */
export function useUpdateTestOrderItemStatus(
  invalidate: string[] = [endpoint.lab.testOrders.list],
) {
  const mutation = useMutation<
    TestOrderItem,
    UpdateTestOrderItemStatusPayload
  >("test-orders/update-item-status", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateTestOrderItemStatus = async (
    orderId: string,
    itemId: string,
    payload: UpdateTestOrderItemStatusPayload,
  ) => {
    const res = await mutation.trigger(
      payload,
      endpoint.lab.testOrders.updateItemStatus(orderId, itemId),
    );
    if (!res) throw new Error("Failed to update test order item status");
    return res.data;
  };

  return { updateTestOrderItemStatus, isLoading: mutation.isLoading };
}
