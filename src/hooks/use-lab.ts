import { useApi, useMutation } from "@/hooks/use-api";
import { labEndpoints } from "@/api/endpoints/lab";
import type { Lab, UpdateLabPayload, UpdateLabLogoPayload, UpdateLabLogoResponse } from "@/api/types/lab";

export function useUpdateLab() {
  const mutation = useMutation<Lab, UpdateLabPayload>(labEndpoints.update, {
    method: "PATCH",
    skipErrorHandling: true,
  });

  const updateLab = async (payload: UpdateLabPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to update lab");
    return res.data;
  };

  return { updateLab, isLoading: mutation.isLoading };
}

export function useUpdateLabLogo() {
  const mutation = useMutation<UpdateLabLogoResponse, UpdateLabLogoPayload>(labEndpoints.updateLogo, {
    method: "PATCH",
    skipErrorHandling: true,
  });

  const updateLogo = async (logo: string) => {
    const res = await mutation.trigger({ logo });
    if (!res) throw new Error("Failed to update logo");
    return res.data;
  };

  return { updateLogo, isLoading: mutation.isLoading };
}

export function useLab() {
  const { data, error, isLoading, mutate } = useApi<Lab>(labEndpoints.me);
  return {
    lab: data?.data ?? null,
    error,
    isLoading,
    refetch: mutate,
  };
}
  