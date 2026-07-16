import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Info, ChevronDown, ChevronUp, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PERM_CATALOG,
  ROLE_DEFAULTS,
  ROLE_DESC,
  ROLE_LABELS,
  ROLE_COLORS,
} from "./shared";
import type { StaffDetail } from "./shared";
import { ChangeRoleDialog } from "./actions";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";

interface Props {
  staff: StaffDetail;
  onRoleChanged: () => void;
}

interface UpdatePermissionsPayload {
  include: string[];
  exclude: string[];
}

export function TabPermissions({ staff, onRoleChanged }: Props) {
  const isManager = staff.role === "manager";
  const effective = staff.permissions ?? [];

  // Derive initial include/exclude from effective vs role defaults
  const roleDefaults = useMemo(() => ROLE_DEFAULTS[staff.role] ?? [], [staff.role]);
  const allKeys = useMemo(
    () => Object.values(PERM_CATALOG).flatMap((p) => p.map((e) => e.key)),
    [],
  );

  const [include, setInclude] = useState<string[]>(() =>
    effective.filter((p) => !roleDefaults.includes(p) && p !== "*"),
  );
  const [exclude, setExclude] = useState<string[]>(() =>
    roleDefaults.filter((p) => !effective.includes(p)),
  );
  const [extraOpen, setExtraOpen] = useState(false);
  const [revokedOpen, setRevokedOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  // For permission display: is each key granted?
  function isGranted(key: string) {
    if (isManager) return true;
    if (include.includes(key)) return true;
    if (exclude.includes(key)) return false;
    return roleDefaults.includes(key);
  }

  function getTag(key: string): { label: string; cls: string } | null {
    if (include.includes(key) && !roleDefaults.includes(key))
      return { label: "+ extra", cls: "text-info bg-info/12" };
    if (roleDefaults.includes(key) && exclude.includes(key))
      return { label: "− excluded", cls: "text-destructive bg-destructive/12" };
    if (roleDefaults.includes(key))
      return { label: "from role", cls: "text-muted-foreground bg-muted" };
    return null;
  }

  function toggleInclude(key: string) {
    setInclude((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }
  function toggleExclude(key: string) {
    setExclude((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }
  function resetToDefaults() {
    setInclude([]);
    setExclude([]);
  }

  const extraCandidates = allKeys.filter((k) => !roleDefaults.includes(k));
  const revokedCandidates = roleDefaults;

  const savePerms = useMutation<unknown, UpdatePermissionsPayload>(
    endpoint.lab.staff.updatePermissions(staff._id),
    { method: "PATCH", successToast: "Permission changes saved" },
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* ── Role card ── */}
        <Card className="shadow-card">
          <CardContent className="p-[18px]">
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3.5 py-[5px] text-[13px] font-bold border",
                  ROLE_COLORS[staff.role],
                )}
              >
                {ROLE_LABELS[staff.role]}
              </span>
              {!isManager && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setRoleOpen(true)}
                >
                  <UserCog className="w-3.5 h-3.5" />
                  Change Role
                </Button>
              )}
            </div>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed">
              {ROLE_DESC[staff.role] ?? "—"}
            </p>
          </CardContent>
        </Card>

        {/* ── Manager notice ── */}
        {isManager && (
          <div className="flex items-center gap-2.5 bg-info/8 border border-info/25 rounded-[var(--radius)] px-4 py-3">
            <Info className="w-4 h-4 text-info flex-shrink-0" />
            <p className="text-sm text-foreground">
              Manager has full access. Permissions cannot be customised.
            </p>
          </div>
        )}

        {/* ── Effective Permissions table ── */}
        <Card className="shadow-card">
          <CardContent className="p-[18px]">
            <p className="text-sm font-semibold mb-3.5">Effective Permissions</p>
            <div className="flex flex-col gap-4">
              {Object.entries(PERM_CATALOG).map(([resource, perms]) => (
                <div key={resource}>
                  <p className="text-[12px] font-bold uppercase tracking-[0.04em] text-muted-foreground mb-2">
                    {resource}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {perms.map(({ key, desc }) => {
                      const granted = isGranted(key);
                      const tag = getTag(key);
                      return (
                        <div key={key} className="flex items-center gap-2.5 py-1.5 px-1">
                          {granted ? (
                            <CheckCircle2 className="w-[15px] h-[15px] text-success flex-shrink-0" />
                          ) : (
                            <Circle className="w-[15px] h-[15px] text-border flex-shrink-0" />
                          )}
                          {/* key — flex:1 pushes everything else to the right */}
                          <span className="flex-1 text-[13px] font-mono text-foreground">
                            {key}
                          </span>
                          {/* desc + tag — right side */}
                          <span className="text-xs text-muted-foreground">{desc}</span>
                          {tag && (
                            <span className={cn("text-[10.5px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap", tag.cls)}>
                              {tag.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Override panels (non-manager only) ── */}
        {!isManager && (
          <>
            {/* Extra Permissions (Grant) */}
            <Card className="shadow-card overflow-hidden p-0">
              <button
                className="flex items-center justify-between w-full px-[18px] py-4 border-none bg-transparent cursor-pointer text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExtraOpen((v) => !v)}
              >
                <span className="text-[13.5px] font-semibold">
                  Extra Permissions{" "}
                  <span className="font-normal text-muted-foreground">(Grant)</span>
                </span>
                {extraOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {extraOpen && (
                <div className="px-[18px] pb-4 flex flex-wrap gap-2.5">
                  {extraCandidates.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-[13px] border border-border rounded-[var(--radius)] px-3 py-[7px] cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={include.includes(key)}
                        onChange={() => toggleInclude(key)}
                        className="accent-primary"
                      />
                      <span className="font-mono">{key}</span>
                    </label>
                  ))}
                </div>
              )}
            </Card>

            {/* Revoked Permissions (Remove) */}
            <Card className="shadow-card overflow-hidden p-0">
              <button
                className="flex items-center justify-between w-full px-[18px] py-4 border-none bg-transparent cursor-pointer text-left hover:bg-muted/30 transition-colors"
                onClick={() => setRevokedOpen((v) => !v)}
              >
                <span className="text-[13.5px] font-semibold">
                  Revoked Permissions{" "}
                  <span className="font-normal text-muted-foreground">(Remove)</span>
                </span>
                {revokedOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {revokedOpen && (
                <div className="px-[18px] pb-4 flex flex-wrap gap-2.5">
                  {revokedCandidates.map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-[13px] border border-border rounded-[var(--radius)] px-3 py-[7px] cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={exclude.includes(key)}
                        onChange={() => toggleExclude(key)}
                        className="accent-primary"
                      />
                      <span className="font-mono">{key}</span>
                    </label>
                  ))}
                </div>
              )}
            </Card>

            {/* Save / Reset row */}
            <div className="flex items-center justify-between">
              <button
                className="text-[12.5px] font-semibold text-muted-foreground underline cursor-pointer bg-transparent border-none"
                onClick={resetToDefaults}
              >
                Reset to Role Defaults
              </button>
              <Button
                size="default"
                disabled={savePerms.isLoading}
                onClick={() => savePerms.trigger({ include, exclude })}
              >
                {savePerms.isLoading ? "Saving…" : "Save Permission Changes"}
              </Button>
            </div>
          </>
        )}
      </div>

      <ChangeRoleDialog
        staff={staff}
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        onSuccess={() => { setRoleOpen(false); onRoleChanged(); }}
      />
    </>
  );
}
