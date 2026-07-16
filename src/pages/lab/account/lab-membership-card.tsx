import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2 } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { useCurrentLab, useMyPermissions, useApi, useMutation } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import endpoint from "@/api/endpoints";
import type { UserLab } from "@/api/types/user";
import type { SwitchLabPayload, SwitchTokens } from "@/api/types/auth";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

/**
 * Lab Membership card.
 *
 * Integrates with:
 *   GET  /users/me/labs  → endpoint.user.myLabs
 *     Returns UserLab[] where `identifier` = lab._id (set by the backend service).
 *     Note: `role` is not populated by this endpoint — role comes from useMyPermissions().
 *
 *   POST /auth/switch    → endpoint.auth.switch
 *     Payload: { membershipId: string } — the backend resolves the membership
 *     from the lab identifier returned above.
 */
export function LabMembershipCard() {
  const { user, setAuth } = useStore();
  const { lab } = useCurrentLab();
  const { role } = useMyPermissions();
  const { toast } = useToast();

  // Fetch all labs the authenticated user has access to (for the switcher)
  const { data: labsData } = useApi<UserLab[]>(endpoint.user.myLabs);
  const userLabs = labsData?.data ?? [];

  const { trigger: switchLab, isLoading: isSwitching } = useMutation<
    SwitchTokens,
    SwitchLabPayload
  >(endpoint.auth.switch, {
    onSuccess: (res) => {
      if (!res.data) return;
      // setAuth clears user/lab/permissions from the store; they re-fetch automatically
      setAuth(res.data);
      toast({ title: "Lab Switched", description: "Your session has been updated." });
    },
  });

  const staffStatus = user?.staff?.status ?? "active";
  const joinedAt = user?.staff?.joinedAt ?? "";
  const currentLabId = lab?._id ?? null;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Lab Membership</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Lab</p>
            <p className="font-semibold mt-0.5">
              {lab?.name ?? "—"}{" "}
              {lab?.code && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  {lab.code}
                </span>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Role</p>
            <p className="font-semibold mt-0.5 capitalize">{role ?? "—"}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Joined</p>
            <p className="font-semibold mt-0.5">
              {joinedAt ? dayjs(joinedAt).format("DD MMM YYYY") : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="mt-1">
              <Badge
                variant={staffStatus === "active" ? "default" : "secondary"}
                className="capitalize text-[11px]"
              >
                {staffStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Lab switcher — only rendered when the user belongs to more than one lab */}
        {userLabs.length > 1 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Switch Lab
              </p>
              <div className="flex flex-col gap-1.5">
                {userLabs.map((l) => {
                  const isActive = l._id === currentLabId;
                  return (
                    <button
                      key={l._id}
                      disabled={isActive || isSwitching}
                      onClick={() => {
                        if (!isActive) {
                          // identifier = lab._id (see myLabs service)
                          switchLab({ membershipId: l.identifier });
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg border transition-colors",
                        isActive
                          ? "border-primary/40 bg-primary/5 cursor-default"
                          : "border-border hover:border-muted-foreground/30 hover:bg-accent",
                        isSwitching && !isActive && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{l.name}</p>
                        <p className="text-xs text-muted-foreground">{l.code}</p>
                      </div>
                      {isActive && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                      {!isActive && isSwitching && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
