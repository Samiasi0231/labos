import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/use-api";
import { useMyPermissions } from "@/hooks/use-api";
import { roleBadgeVariant } from "./shared";
import { concatStrings, initials } from "@/lib/utils";

export function IdentityCard() {
  const { user } = useCurrentUser();
  const { role } = useMyPermissions();

  if (!user) return null;

  const fullName = concatStrings(user.firstName, user.lastName, " ");

  return (
    <Card className="shadow-card">
      <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
        {/* Avatar */}
        <div className="w-[72px] h-[72px] rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-primary">{initials(fullName)}</span>
        </div>

        <div>
          <p className="text-base font-bold leading-tight">{fullName || "—"}</p>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">{user.email}</p>
        </div>

        <div className="flex gap-1.5 flex-wrap justify-center mt-1">
          {role && (
            <Badge variant={roleBadgeVariant(role)} className="capitalize text-[11px]">
              {role}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[11px] text-green-600 border-green-500/30 bg-green-500/10"
          >
            Active
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
