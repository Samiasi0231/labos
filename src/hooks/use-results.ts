import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  LabResult,
  ResultListResponse,
  ResultListQuery,
  ResultEntryFormResponse,
  SaveResultDraftPayload,
  ReturnResultPayload,
} from "@/api/types/results";

function buildListUrl(query: ResultListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.patient) params.set("patient", query.patient);
  if (query.testOrder) params.set("testOrder", query.testOrder);
  params.set("page", String(query.page ?? 1));
  params.set("limit", String(query.limit ?? 50));
  return `${endpoint.lab.results.list}?${params.toString()}`;
}

export function useResultsList(query: ResultListQuery = {}) {
  const url = buildListUrl(query);
  const { data, error, isLoading, isValidating, mutate } = useApi<ResultListResponse>(url);

  return {
    results: data?.data?.docs ?? [],
    pagination: data?.data
      ? { totalDocs: data.data.totalDocs, page: data.data.page, totalPages: data.data.totalPages }
      : null,
    error,
    isLoading,
    isValidating,
    refetch: mutate,
    listUrl: url,
  };
}

export function useResult(resultId: string | null) {
  const { data, error, isLoading, mutate } = useApi<LabResult>(
    resultId ? endpoint.lab.results.get(resultId) : null
  );
  return { result: data?.data ?? null, error, isLoading, refetch: mutate };
}

export function useApproveResult(invalidate: string[] = [endpoint.lab.results.list]) {
  const mutation = useMutation<LabResult, void>("results/approve", { skipErrorHandling: true, invalidate });
  const approve = async (resultId: string) => {
    const res = await mutation.trigger(undefined, endpoint.lab.results.approve(resultId));
    if (!res) throw new Error("Failed to approve result");
    return res.data;
  };
  return { approve, isLoading: mutation.isLoading };
}

export function useReturnResult(invalidate: string[] = [endpoint.lab.results.list]) {
  const mutation = useMutation<LabResult, ReturnResultPayload>("results/return", { skipErrorHandling: true, invalidate });
  const returnResult = async (resultId: string, comments: string) => {
    const res = await mutation.trigger({ comments }, endpoint.lab.results.return(resultId));
    if (!res) throw new Error("Failed to return result");
    return res.data;
  };
  return { returnResult, isLoading: mutation.isLoading };
}

export function useReleaseResult(invalidate: string[] = [endpoint.lab.results.list]) {
  const mutation = useMutation<LabResult, void>("results/release", { skipErrorHandling: true, invalidate });
  const release = async (resultId: string) => {
    const res = await mutation.trigger(undefined, endpoint.lab.results.release(resultId));
    if (!res) throw new Error("Failed to release result");
    return res.data;
  };
  return { release, isLoading: mutation.isLoading };
}


export function useResultEntryForm(orderId: string | null, itemId: string | null) {
  const url = orderId && itemId ? endpoint.lab.resultEntry.entryForm(orderId, itemId) : null;
  const { data, error, isLoading, mutate } = useApi<ResultEntryFormResponse>(url);
  return { form: data?.data ?? null, error, isLoading, refetch: mutate };
}

export function useSaveResultDraft() {
  const mutation = useMutation<LabResult, SaveResultDraftPayload>("results/save-draft", {
    method: "PUT",
    skipErrorHandling: true,
  });

  const saveDraft = async (orderId: string, itemId: string, values: SaveResultDraftPayload["values"]) => {
    const res = await mutation.trigger({ values }, endpoint.lab.resultEntry.saveDraft(orderId, itemId));
    if (!res) throw new Error("Failed to save draft");
    return res.data;
  };

  return { saveDraft, isLoading: mutation.isLoading };
}

export function useSubmitResult() {
  const mutation = useMutation<LabResult, void>("results/submit", { skipErrorHandling: true });

  const submitResult = async (orderId: string, itemId: string) => {
    const res = await mutation.trigger(undefined, endpoint.lab.resultEntry.submit(orderId, itemId));
    if (!res) throw new Error("Failed to submit result");
    return res.data;
  };

  return { submitResult, isLoading: mutation.isLoading };
}