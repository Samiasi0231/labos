import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  TestCatalogEntry,
  TestCatalogListResponse,
  TestCatalogListQuery,
  CreateTestCatalogPayload,
  UpdateTestCatalogPayload,
  UpdateTestCatalogStatusPayload,
  CreateParameterPayload,
  UpdateParameterPayload,
} from "@/api/types/test-catalog";

function buildListUrl(query: TestCatalogListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.samples) params.set("samples", query.samples);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(Math.min(query.limit ?? 100, 100)));
  return `${endpoint.lab.testCatalog.list}?${params.toString()}`;
}

export function useTestCatalogList(query: TestCatalogListQuery = {}) {
  const url = buildListUrl(query);
  const { data, error, isLoading, isValidating, mutate } = useApi<TestCatalogListResponse>(url);

  return {
    tests: data?.data?.docs ?? [],
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

export function useCreateTest(invalidate: string[] = [endpoint.lab.testCatalog.list]) {
  const mutation = useMutation<TestCatalogEntry, CreateTestCatalogPayload>(endpoint.lab.testCatalog.create, {
    skipErrorHandling: true,
    invalidate,
  });

  const createTest = async (payload: CreateTestCatalogPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to add test to catalog");
    return res.data;
  };

  return { createTest, isLoading: mutation.isLoading };
}

export function useUpdateTest(invalidate: string[] = [endpoint.lab.testCatalog.list]) {
  const mutation = useMutation<TestCatalogEntry, UpdateTestCatalogPayload>("test-catalog/update", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateTest = async (testId: string, payload: UpdateTestCatalogPayload) => {
    const res = await mutation.trigger(payload, endpoint.lab.testCatalog.update(testId));
    if (!res) throw new Error("Failed to update test");
    return res.data;
  };

  return { updateTest, isLoading: mutation.isLoading };
}

export function useRemoveTest(invalidate: string[] = [endpoint.lab.testCatalog.list]) {
  const mutation = useMutation<unknown, void>("test-catalog/remove", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const removeTest = async (testId: string) => {
    const res = await mutation.trigger(undefined, endpoint.lab.testCatalog.remove(testId));
    if (!res) throw new Error("Failed to delete test");
  };

  return { removeTest, isLoading: mutation.isLoading };
}

export function useUpdateTestStatus(invalidate: string[] = [endpoint.lab.testCatalog.list]) {
  const mutation = useMutation<TestCatalogEntry, UpdateTestCatalogStatusPayload>("test-catalog/update-status", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateStatus = async (testId: string, isActive: boolean) => {
    const res = await mutation.trigger({ isActive }, endpoint.lab.testCatalog.updateStatus(testId));
    if (!res) throw new Error("Failed to update test status");
    return res.data;
  };

  return { updateStatus, isLoading: mutation.isLoading };
}

export function useAddParameter(invalidate: string[] = [endpoint.lab.testCatalog.list]) {
  const mutation = useMutation<TestCatalogEntry, CreateParameterPayload>("test-catalog/add-parameter", {
    skipErrorHandling: true,
    invalidate,
  });

  const addParameter = async (testId: string, payload: CreateParameterPayload) => {
    const res = await mutation.trigger(payload, endpoint.lab.testCatalog.addParameter(testId));
    if (!res) throw new Error("Failed to add parameter");
    return res.data;
  };

  return { addParameter, isLoading: mutation.isLoading };
}

export function useUpdateParameter(invalidate: string[] = [endpoint.lab.testCatalog.list]) {
  const mutation = useMutation<TestCatalogEntry, UpdateParameterPayload>("test-catalog/update-parameter", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateParameter = async (testId: string, paramId: string, payload: UpdateParameterPayload) => {
    const res = await mutation.trigger(payload, endpoint.lab.testCatalog.updateParameter(testId, paramId));
    if (!res) throw new Error("Failed to update parameter");
    return res.data;
  };

  return { updateParameter, isLoading: mutation.isLoading };
}

export function useRemoveParameter(invalidate: string[] = [endpoint.lab.testCatalog.list]) {
  const mutation = useMutation<TestCatalogEntry, void>("test-catalog/remove-parameter", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const removeParameter = async (testId: string, paramId: string) => {
    const res = await mutation.trigger(undefined, endpoint.lab.testCatalog.removeParameter(testId, paramId));
    if (!res) throw new Error("Failed to remove parameter");
    return res.data;
  };

  return { removeParameter, isLoading: mutation.isLoading };
}