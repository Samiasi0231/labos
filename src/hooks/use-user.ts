import { useApi, useMutation } from "@/hooks/use-api";
import { userEndpoints } from "@/api/endpoints/users";
import type {
  CurrentUser,
  UpdateUserProfilePayload,
  UpdateUserProfileResponse,
  ChangePasswordPayload,
  UserAccessibleLab,
} from "@/api/types/user";

export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useApi<CurrentUser>(userEndpoints.me);
  return { user: data?.data ?? null, error, isLoading, refetch: mutate };
}

export function useUserLabs() {
  const { data, error, isLoading, mutate } = useApi<UserAccessibleLab[]>(userEndpoints.myLabs);
  return { labs: data?.data ?? [], error, isLoading, refetch: mutate };
}

export function useUpdateProfile() {
  const mutation = useMutation<UpdateUserProfileResponse, UpdateUserProfilePayload>(
    userEndpoints.updateProfile,
    { method: "PATCH", skipErrorHandling: true, invalidate: [userEndpoints.me] }
  );

  const updateProfile = async (payload: UpdateUserProfilePayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to update profile");
    return res.data;
  };

  return { updateProfile, isLoading: mutation.isLoading };
}

export function useChangePassword() {
  const mutation = useMutation<unknown, ChangePasswordPayload>(userEndpoints.changePassword, {
    method: "PATCH",
    skipErrorHandling: true,
  });

  const changePassword = async (payload: ChangePasswordPayload) => {
    const res = await mutation.trigger(payload);
    if (!res) throw new Error("Failed to change password");
  };

  return { changePassword, isLoading: mutation.isLoading };
}