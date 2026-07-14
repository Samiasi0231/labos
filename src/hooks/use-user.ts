import { useApi, useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  CurrentUser,
  UpdateUserProfilePayload,
  UpdateUserProfileResponse,
  ChangePasswordPayload,
  UserAccessibleLab,
} from "@/api/types/user";

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useApi<CurrentUser>(endpoint.user.me);
  return { user: data?.data ?? null, error, isLoading, refetch: mutate };
}

export function useUserLabs() {
  const { data, error, isLoading, mutate } = useApi<UserAccessibleLab[]>(endpoint.user.myLabs);
  return { labs: data?.data ?? [], error, isLoading, refetch: mutate };
}

export function useUpdateProfile() {
  const mutation = useMutation<UpdateUserProfileResponse, UpdateUserProfilePayload>(
    endpoint.user.updateProfile,
    { method: "PATCH", skipErrorHandling: true, invalidate: [endpoint.user.me] }
  );

  const updateProfile = async (payload: UpdateUserProfilePayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to update profile");
    return res.data;
  };

  return { updateProfile, isLoading: mutation.isLoading };
}

export function useChangePassword() {
  const mutation = useMutation<unknown, ChangePasswordPayload>(endpoint.user.changePassword, {
    method: "PATCH",
    skipErrorHandling: true,
  });

  const changePassword = async (payload: ChangePasswordPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to change password");
  };

  return { changePassword, isLoading: mutation.isLoading };
}