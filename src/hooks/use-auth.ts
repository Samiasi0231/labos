import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@/hooks/use-api";
import { authEndpoints } from "@/api/endpoints/auth";
import type { LogoutPayload } from "@/api/types/auth";
import { getStoredAuth, clearStoredAuth } from "@/api/client"

export function useLogout() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const mutation = useMutation<unknown, LogoutPayload>(authEndpoints.logout, {
    method: "POST",
    skipErrorHandling: true,
  });

  const logout = async () => {
    setIsLoading(true);
    try {
      const stored = getStoredAuth();
      if (stored?.refresh_token) {
        await mutation.trigger({ refresh_token: stored.refresh_token });
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      clearStoredAuth();
      setIsLoading(false);
      navigate("/login", { replace: true });
    }
  };

  return { logout, isLoading };
}