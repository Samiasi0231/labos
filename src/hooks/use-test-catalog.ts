import { useApi, useMutation } from "@/hooks/use-api";
import { testCatalogEndpoints } from "@/api/endpoints/test-catalog";
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
  if (query.sampleType) params.set("sampleType", query.sampleType);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(Math.min(query.limit ?? 100, 100)));
  return `${testCatalogEndpoints.list}?${params.toString()}`;
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

export function useCreateTest(invalidate: string[] = [testCatalogEndpoints.list]) {
  const mutation = useMutation<TestCatalogEntry, CreateTestCatalogPayload>(testCatalogEndpoints.create, {
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

export function useUpdateTest(invalidate: string[] = [testCatalogEndpoints.list]) {
  const mutation = useMutation<TestCatalogEntry, UpdateTestCatalogPayload>("test-catalog/update", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateTest = async (testId: string, payload: UpdateTestCatalogPayload) => {
    const res = await mutation.trigger(payload, testCatalogEndpoints.update(testId));
    if (!res) throw new Error("Failed to update test");
    return res.data;
  };

  return { updateTest, isLoading: mutation.isLoading };
}

export function useRemoveTest(invalidate: string[] = [testCatalogEndpoints.list]) {
  const mutation = useMutation<unknown, void>("test-catalog/remove", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const removeTest = async (testId: string) => {
    const res = await mutation.trigger(undefined, testCatalogEndpoints.remove(testId));
    if (!res) throw new Error("Failed to delete test");
  };

  return { removeTest, isLoading: mutation.isLoading };
}

export function useUpdateTestStatus(invalidate: string[] = [testCatalogEndpoints.list]) {
  const mutation = useMutation<TestCatalogEntry, UpdateTestCatalogStatusPayload>("test-catalog/update-status", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateStatus = async (testId: string, isActive: boolean) => {
    const res = await mutation.trigger({ isActive }, testCatalogEndpoints.updateStatus(testId));
    if (!res) throw new Error("Failed to update test status");
    return res.data;
  };

  return { updateStatus, isLoading: mutation.isLoading };
}

export function useAddParameter(invalidate: string[] = [testCatalogEndpoints.list]) {
  const mutation = useMutation<TestCatalogEntry, CreateParameterPayload>("test-catalog/add-parameter", {
    skipErrorHandling: true,
    invalidate,
  });

  const addParameter = async (testId: string, payload: CreateParameterPayload) => {
    const res = await mutation.trigger(payload, testCatalogEndpoints.addParameter(testId));
    if (!res) throw new Error("Failed to add parameter");
    return res.data;
  };

  return { addParameter, isLoading: mutation.isLoading };
}

export function useUpdateParameter(invalidate: string[] = [testCatalogEndpoints.list]) {
  const mutation = useMutation<TestCatalogEntry, UpdateParameterPayload>("test-catalog/update-parameter", {
    method: "PATCH",
    skipErrorHandling: true,
    invalidate,
  });

  const updateParameter = async (testId: string, paramId: string, payload: UpdateParameterPayload) => {
    const res = await mutation.trigger(payload, testCatalogEndpoints.updateParameter(testId, paramId));
    if (!res) throw new Error("Failed to update parameter");
    return res.data;
  };

  return { updateParameter, isLoading: mutation.isLoading };
}

export function useRemoveParameter(invalidate: string[] = [testCatalogEndpoints.list]) {
  const mutation = useMutation<TestCatalogEntry, void>("test-catalog/remove-parameter", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const removeParameter = async (testId: string, paramId: string) => {
    const res = await mutation.trigger(undefined, testCatalogEndpoints.removeParameter(testId, paramId));
    if (!res) throw new Error("Failed to remove parameter");
    return res.data;
  };

  return { removeParameter, isLoading: mutation.isLoading };
}