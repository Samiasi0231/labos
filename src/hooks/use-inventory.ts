import { useApi, useMutation } from "@/hooks/use-api";
import { inventoryEndpoints } from "@/api/endpoints/inventory";
import type {
  InventoryItem,
  InventoryListResponse,
  InventoryListQuery,
  CreateInventoryItemPayload,
  UpdateInventoryItemPayload,
  RestockPayload,
  AdjustStockPayload,
  StockMutationResponse,
  StockMovementListResponse,
  StockMovementListQuery,
} from "@/api/types/inventory";

function buildListUrl(query: InventoryListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.status) params.set("status", query.status);
  if (query.lowStock !== undefined) params.set("lowStock", String(query.lowStock));
  if (query.expiringBefore) params.set("expiringBefore", query.expiringBefore);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 100));
  return `${inventoryEndpoints.list}?${params.toString()}`;
}

export function useInventoryList(query: InventoryListQuery = {}) {
  const url = buildListUrl(query);
  const { data, error, isLoading, isValidating, mutate } = useApi<InventoryListResponse>(url);

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
    listUrl: url,
  };
}

export function useInventoryItem(itemId: string | null) {
  const { data, error, isLoading, mutate } = useApi<InventoryItem>(
    itemId ? inventoryEndpoints.get(itemId) : null
  );
  return { item: data?.data ?? null, error, isLoading, refetch: mutate };
}

export function useCreateInventoryItem(invalidate: string[] = [inventoryEndpoints.list]) {
  const mutation = useMutation<InventoryItem, CreateInventoryItemPayload>(inventoryEndpoints.create, {
    skipErrorHandling: true,
    invalidate,
  });

  const createItem = async (payload: CreateInventoryItemPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to create inventory item");
    return res.data;
  };

  return { createItem, isLoading: mutation.isLoading };
}

export function useUpdateInventoryItem(invalidate: string[] = [inventoryEndpoints.list]) {
  const mutation = useMutation<InventoryItem, UpdateInventoryItemPayload>("inventory/update", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateItem = async (itemId: string, payload: UpdateInventoryItemPayload) => {
    const res = await mutation.trigger(payload, inventoryEndpoints.update(itemId));
    if (!res) throw new Error("Failed to update inventory item");
    return res.data;
  };

  return { updateItem, isLoading: mutation.isLoading };
}

export function useRemoveInventoryItem(invalidate: string[] = [inventoryEndpoints.list]) {
  const mutation = useMutation<unknown, void>("inventory/remove", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const removeItem = async (itemId: string) => {
    const res = await mutation.trigger(undefined, inventoryEndpoints.remove(itemId));
    if (!res) throw new Error("Failed to delete inventory item");
  };

  return { removeItem, isLoading: mutation.isLoading };
}

/** NOTE: response is { item, movement }, not the bare item. */
export function useRestockItem(invalidate: string[] = [inventoryEndpoints.list]) {
  const mutation = useMutation<StockMutationResponse, RestockPayload>("inventory/restock", {
    skipErrorHandling: true,
    invalidate,
  });

  const restock = async (itemId: string, payload: RestockPayload) => {
    const res = await mutation.trigger(payload, inventoryEndpoints.restock(itemId));
    if (!res) throw new Error("Failed to restock item");
    return res.data;
  };

  return { restock, isLoading: mutation.isLoading };
}

export function useAdjustStock(invalidate: string[] = [inventoryEndpoints.list]) {
  const mutation = useMutation<StockMutationResponse, AdjustStockPayload>("inventory/adjust", {
    skipErrorHandling: true,
    invalidate,
  });

  const adjust = async (itemId: string, payload: AdjustStockPayload) => {
    const res = await mutation.trigger(payload, inventoryEndpoints.adjust(itemId));
    if (!res) throw new Error("Failed to adjust stock");
    return res.data; 
  };

  return { adjust, isLoading: mutation.isLoading };
}

function buildMovementsUrl(query: StockMovementListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.itemId) params.set("itemId", query.itemId);
  if (query.type) params.set("type", query.type);
  if (query.start_date) params.set("start_date", query.start_date);
  if (query.end_date) params.set("end_date", query.end_date);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 50));
  return `${inventoryEndpoints.movements}?${params.toString()}`;
}

export function useStockMovements(query: StockMovementListQuery = {}) {
  const url = buildMovementsUrl(query);
  const { data, error, isLoading, mutate } = useApi<StockMovementListResponse>(url);
  return {
    movements: data?.data?.docs ?? [],
    pagination: data?.data ? { totalDocs: data.data.totalDocs, page: data.data.page, totalPages: data.data.totalPages } : null,
    error,
    isLoading,
    refetch: mutate,
  };
}