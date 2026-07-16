import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronsUpDown, Check, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useApi, useCurrentLab, useMutation } from "@/hooks/use-api";
import { useStore } from "@/hooks/use-store";
import { notify } from "@/lib/notify";
import endpoint from "@/api/endpoints";
import type { SwitchTokens, SwitchLabPayload } from "@/api/types/auth";
import type { UserLab } from "@/api/types/user";
import { cn, initials } from "@/lib/utils";

function getRoleRedirect(role: string): string {
  switch (role) {
    case "lab_manager":
    case "lab_owner":
    case "manager":
    case "scientist":
    case "receptionist":
      return "/lab";
    case "patient":
      return "/patient";
    case "admin":
      return "/admin";
    default:
      return "/lab";
  }
}

function RolePill({ role }: { role: string }) {
  const label = role?.replace(/_/g, " ");
  const lower = role?.toLowerCase();

  const style =
    lower === "manager" || lower === "lab_owner" || lower === "lab_manager"
      ? "bg-primary/15 text-primary"
      : lower === "scientist"
        ? "bg-blue-500/15 text-blue-500"
        : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-px rounded-full font-bold capitalize",
        style,
      )}
      style={{ fontSize: "9.5px" }}
    >
      {label}
    </span>
  );
}

interface LabSwitcherProps {
  collapsed: boolean;
  isMobile: boolean;
}

export function LabSwitcher({ collapsed, isMobile }: LabSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { auth, setAuth } = useStore();
  const { lab } = useCurrentLab();

  const { data, isLoading: labsLoading } = useApi<UserLab[]>(
    endpoint.user.myLabs,
  );
  const labs = data?.data ?? [];

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const switchMutation = useMutation<SwitchTokens, SwitchLabPayload>(
    endpoint.auth.switch,
    {
      skipErrorHandling: true,
      onSuccess: (res) => {
        if (!res.data) return;
        setAuth(res.data);
        setOpen(false);
        setSwitchingId(null);
        navigate(getRoleRedirect(res.data.role));
      },
      onError: (err) => {
        setSwitchingId(null);
        notify.fromApiError(err, "Failed to switch lab");
      },
    },
  );

  const handleSwitch = (item: UserLab) => {
    if (item._id === auth?.labId) return;
    setSwitchingId(item.identifier);
    switchMutation.trigger({ membershipId: item.identifier });
  };

  const currentName = lab?.name ?? "Select Lab";
  const currentCode = lab?.code ?? "";
  const currentInitials = initials(currentName);

  if (collapsed && !isMobile) {
    return (
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          title={currentName}
          className={cn(
            "w-full flex items-center justify-center py-1.5 rounded-lg transition-colors",
            open ? "bg-sidebar-accent" : "hover:bg-sidebar-accent",
          )}
        >
          <div className="w-[30px] h-[30px] rounded-md bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-sidebar-foreground">
              {currentInitials}
            </span>
          </div>
        </button>

        {open && <DropdownPanel labs={labs} labsLoading={labsLoading} auth={auth} switchingId={switchingId} onSwitch={handleSwitch} onClose={() => setOpen(false)} navigate={navigate} />}
      </div>
    );
  }

  // ── Expanded trigger ──────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2.5 w-full border border-sidebar-border rounded-lg px-2.5 py-2 transition-colors",
          open ? "bg-sidebar-accent" : "bg-transparent hover:bg-sidebar-accent/60",
        )}
      >
        <div className="w-[30px] h-[30px] rounded-md bg-sidebar-accent flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-sidebar-foreground">
            {currentInitials}
          </span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <span className="block text-[13px] font-semibold text-sidebar-foreground truncate leading-tight">
            {currentName}
          </span>
          <span className="block text-[11px] text-sidebar-muted font-mono truncate leading-tight">
            {currentCode}
          </span>
        </div>
        <ChevronsUpDown className="w-[15px] h-[15px] text-sidebar-muted flex-shrink-0" />
      </button>

      {open && (
        <DropdownPanel
          labs={labs}
          labsLoading={labsLoading}
          auth={auth}
          switchingId={switchingId}
          onSwitch={handleSwitch}
          onClose={() => setOpen(false)}
          navigate={navigate}
        />
      )}
    </div>
  );
}

// ── Dropdown panel (shared between collapsed/expanded) ────────────

interface DropdownPanelProps {
  labs: UserLab[];
  labsLoading: boolean;
  auth: { labId?: string | null } | null;
  switchingId: string | null;
  onSwitch: (item: UserLab) => void;
  onClose: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

function DropdownPanel({
  labs,
  labsLoading,
  auth,
  switchingId,
  onSwitch,
  onClose,
  navigate,
}: DropdownPanelProps) {
  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
    >
      <p
        className="px-3 text-muted-foreground font-bold uppercase tracking-wide"
        style={{ fontSize: "10.5px", paddingTop: "9px", paddingBottom: "5px" }}
      >
        Your Labs
      </p>

      <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
        {labsLoading ? (
          <div className="space-y-1 px-2 pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : (
          labs.map((item) => {
            const isActive = item._id === auth?.labId;
            const isSwitching = switchingId === item.identifier;

            return (
              <button
                key={item.identifier}
                disabled={isActive || !!switchingId}
                onClick={() => onSwitch(item)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors",
                  isActive
                    ? "bg-primary/5 cursor-default"
                    : "hover:bg-muted/60 cursor-pointer",
                  !!switchingId && !isActive && "opacity-50 pointer-events-none",
                )}
              >
                {/* Avatar */}
                <div className="w-[26px] h-[26px] rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span
                    className="font-bold text-primary"
                    style={{ fontSize: "10.5px" }}
                  >
                    {initials(item.name)}
                  </span>
                </div>

                {/* Name + code + role */}
                <div className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-foreground truncate leading-tight">
                    {item.name}
                  </span>
                  <span className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-muted-foreground font-mono"
                      style={{ fontSize: "10.5px" }}
                    >
                      {item.code}
                    </span>
                    <RolePill role={item.role} />
                  </span>
                </div>

                {/* Checkmark / spinner */}
                <div className="w-[15px] h-[15px] flex items-center justify-center flex-shrink-0">
                  {isSwitching ? (
                    <span className="w-3.5 h-3.5 border-2 border-muted border-t-primary rounded-full animate-spin" />
                  ) : isActive ? (
                    <Check className="w-[15px] h-[15px] text-primary" />
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>

      <Separator className="bg-border" />

      <div className="p-1.5">
        <button
          onClick={() => {
            onClose();
            navigate("/lab/settings");
          }}
          className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-left text-muted-foreground hover:bg-muted/60 transition-colors"
          style={{ fontSize: "12.5px", fontWeight: 600 }}
        >
          <Settings className="w-[13px] h-[13px] flex-shrink-0" />
          Manage Lab Access
        </button>
      </div>
    </div>
  );
}
