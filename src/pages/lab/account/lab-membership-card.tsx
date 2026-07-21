import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/use-store";
import { useCurrentLab, useMyPermissions } from "@/hooks/use-api";
import dayjs from "dayjs";

export function LabMembershipCard() {
  const { user } = useStore();
  const { lab } = useCurrentLab();
  const { role } = useMyPermissions();

  const staffStatus = user?.staff?.status ?? "active";
  const joinedAt = user?.staff?.joinedAt ?? "";

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
      </CardContent>
    </Card>
  );
}
