import type { PortalAccess } from "@/data/mockData";

/**
 * Best-effort derivation of portal access state from an entity's linked
 * `user` field. The backend currently only exposes whether a user is
 * linked, not whether the invite has been accepted — so this cannot
 * distinguish "invite_sent" from "active". Until the API exposes invite
 * status explicitly, both states collapse to "active" here.
 */
export function derivePortalAccess(userId?: string | null): PortalAccess {
  return userId ? "active" : "none";
}