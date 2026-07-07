import { useApi, useMutation } from "@/hooks/use-api";
import { testOrderEndpoints } from "@/api/endpoints/test-order";
import type {
  TestOrder,
  TestOrderItem,
  TestOrderListResponse,
  TestOrderListQuery,
  CreateTestOrderPayload,
  UpdateTestOrderPayload,
  CollectSamplePayload,
  AddTestOrderItemsPayload,
  UpdateTestOrderItemPayload,
  AssignTestOrderItemPayload,
  UpdateTestOrderItemStatusPayload,
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
  return `${testOrderEndpoints.list}?${params.toString()}`;
}



export function useTestOrderList(query: TestOrderListQuery = {}) {
  const url = buildListUrl(query);
  const { data, error, isLoading, isValidating, mutate } = useApi<TestOrderListResponse>(url);

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
  const url = orderId ? testOrderEndpoints.get(orderId) : null;
  const { data, error, isLoading, isValidating, mutate } = useApi<TestOrder>(url);

  return {
    order: data?.data,
    error,
    isLoading,
    isValidating,
    refetch: mutate,
  };
}

export function useTestOrderItemList(orderId: string | null) {
  const url = orderId ? testOrderEndpoints.listItems(orderId) : null;
  const { data, error, isLoading, isValidating, mutate } = useApi<TestOrderItem[]>(url);

  return {
    items: data?.data ?? [],
    error,
    isLoading,
    isValidating,
    refetch: mutate,
  };
}

// ── Mutations ────────────────────────────────────────────────

export function useCreateTestOrder(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<TestOrder, CreateTestOrderPayload>(testOrderEndpoints.create, {
    skipErrorHandling: true,
    invalidate,
  });

  const createTestOrder = async (payload: CreateTestOrderPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to create test order");
    return res.data;
  };

  return { createTestOrder, isLoading: mutation.isLoading };
}

export function useUpdateTestOrder(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<TestOrder, UpdateTestOrderPayload>("test-orders/update", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateTestOrder = async (orderId: string, payload: UpdateTestOrderPayload) => {
    const res = await mutation.trigger(payload, testOrderEndpoints.update(orderId));
    if (!res) throw new Error("Failed to update test order");
    return res.data;
  };

  return { updateTestOrder, isLoading: mutation.isLoading };
}

export function useCancelTestOrder(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<TestOrder, void>("test-orders/cancel", {
    skipErrorHandling: true,
    invalidate,
  });

  const cancelTestOrder = async (orderId: string) => {
    const res = await mutation.trigger(undefined, testOrderEndpoints.cancel(orderId));
    if (!res) throw new Error("Failed to cancel test order");
    return res.data;
  };

  return { cancelTestOrder, isLoading: mutation.isLoading };
}

export function useCollectSample(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<TestOrder, CollectSamplePayload>("test-orders/collect-sample", {
    skipErrorHandling: true,
    invalidate,
  });

  const collectSample = async (orderId: string, payload: CollectSamplePayload) => {
    const res = await mutation.trigger(payload, testOrderEndpoints.collectSample(orderId));
    if (!res) throw new Error("Failed to record sample collection");
    return res.data;
  };

  return { collectSample, isLoading: mutation.isLoading };
}

export function useAddTestOrderItems(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<TestOrderItem[], AddTestOrderItemsPayload>("test-orders/add-items", {
    skipErrorHandling: true,
    invalidate,
  });

  const addTestOrderItems = async (orderId: string, payload: AddTestOrderItemsPayload) => {
    const res = await mutation.trigger(payload, testOrderEndpoints.addItems(orderId));
    if (!res) throw new Error("Failed to add items to test order");
    return res.data;
  };

  return { addTestOrderItems, isLoading: mutation.isLoading };
}

export function useUpdateTestOrderItem(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<TestOrderItem, UpdateTestOrderItemPayload>("test-orders/update-item", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateTestOrderItem = async (orderId: string, itemId: string, payload: UpdateTestOrderItemPayload) => {
    const res = await mutation.trigger(payload, testOrderEndpoints.updateItem(orderId, itemId));
    if (!res) throw new Error("Failed to update test order item");
    return res.data;
  };

  return { updateTestOrderItem, isLoading: mutation.isLoading };
}

export function useRemoveTestOrderItem(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<unknown, void>("test-orders/remove-item", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const removeTestOrderItem = async (orderId: string, itemId: string) => {
    const res = await mutation.trigger(undefined, testOrderEndpoints.removeItem(orderId, itemId));
    if (!res) throw new Error("Failed to remove test order item");
  };

  return { removeTestOrderItem, isLoading: mutation.isLoading };
}

export function useAssignTestOrderItem(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<TestOrderItem, AssignTestOrderItemPayload>("test-orders/assign-item", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const assignTestOrderItem = async (orderId: string, itemId: string, payload: AssignTestOrderItemPayload) => {
    const res = await mutation.trigger(payload, testOrderEndpoints.assignItem(orderId, itemId));
    if (!res) throw new Error("Failed to assign test order item");
    return res.data;
  };

  return { assignTestOrderItem, isLoading: mutation.isLoading };
}

export function useUpdateTestOrderItemStatus(invalidate: string[] = [testOrderEndpoints.list]) {
  const mutation = useMutation<TestOrderItem, UpdateTestOrderItemStatusPayload>("test-orders/update-item-status", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateTestOrderItemStatus = async (orderId: string, itemId: string, payload: UpdateTestOrderItemStatusPayload) => {
    const res = await mutation.trigger(payload, testOrderEndpoints.updateItemStatus(orderId, itemId));
    if (!res) throw new Error("Failed to update test order item status");
    return res.data;
  };

  return { updateTestOrderItemStatus, isLoading: mutation.isLoading };
}