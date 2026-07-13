import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type {
  GrantPortalAccessPayload,
  ResendPortalInvitePayload,
} from "@/api/types/lab";
import type { PortalAccessType } from "@/api/types/enums";

export function usePortalAccess(accessType: PortalAccessType, invalidate: string[] = []) {
  const grantMutation = useMutation<unknown, GrantPortalAccessPayload>(endpoint.lab.invite, {
    skipErrorHandling: true,
    invalidate,
  });
  const resendMutation = useMutation<unknown, ResendPortalInvitePayload>(endpoint.lab.resendInvite, {
    skipErrorHandling: true,
    invalidate,
  });
  const revokeMutation = useMutation<unknown, void>("portal-access/revoke", {
    method: "DELETE",
    skipErrorHandling: true,
    invalidate,
  });

  const grant = async (identifier: string) => {
    const res = await grantMutation.trigger({ identifier, access_type: accessType });
    if (!res) throw new Error("Failed to grant portal access");
  };

  const resend = async (identifier: string) => {
    const res = await resendMutation.trigger({ type: accessType, identifier });
    if (!res) throw new Error("Failed to resend invite");
  };

  const revoke = async (identifier: string) => {
    const res = await revokeMutation.trigger(
      undefined,
      endpoint.lab.revokeInvite(accessType, identifier)
    );
    if (!res) throw new Error("Failed to revoke access");
  };

  return {
    grant,
    resend,
    revoke,
    isLoading: grantMutation.isLoading || resendMutation.isLoading || revokeMutation.isLoading,
  };
}