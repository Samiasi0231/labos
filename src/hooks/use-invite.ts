import { useApi, useMutation } from "@/hooks/use-api";

interface InviteInfo {
  type: "staff" | "patient" | "doctor";
  firstName: string;
  lastName: string;
  email: string;
  labName: string;
  hasPassword: boolean;
}

interface AcceptInvitePayload {
  token: string;
  password?: string;
}

export function useInviteInfo(token: string | null) {
  const { data, error, isLoading } = useApi<InviteInfo>(
    token ? `/auth/invite/${token}` : null
  );
  return { info: data?.data ?? null, error, isLoading };
}

export function useAcceptInvite() {
  const mutation = useMutation<unknown, AcceptInvitePayload>("/auth/invite/accept", {
    skipErrorHandling: true,
  });

  const acceptInvite = async (token: string, password?: string) => {
    const res = await mutation.trigger({ token, password });
    if (!res) throw new Error("Failed to accept invite");
    return res.data;
  };

  return { acceptInvite, isLoading: mutation.isLoading };
}