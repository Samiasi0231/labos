import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlaskConical, ChevronRight, Loader2, FolderX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { useApi, useMutation } from "@/hooks/use-api";
import { useStore } from "@/hooks/use-store";
import endpoint from "@/api/endpoints";
import type { SwitchTokens, SwitchLabPayload } from "@/api/types/auth";
import type { UserLab } from "@/api/types/user";

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

function labInitials(name: string): string {
  const cleaned = name.replace(/[—–].*/, "").trim();
  const words = cleaned.split(" ").filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
}

function RolePill({ role }: { role: string }) {
  const label = role?.replace(/_/g, " ");
  const lower = role?.toLowerCase();

  const colorClass =
    lower === "manager" || lower === "lab_owner" || lower === "lab_manager"
      ? "bg-primary/15 text-primary"
      : lower === "scientist"
        ? "bg-info/15 text-info"
        : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-px rounded-full font-bold capitalize text-[9.5px]",
        colorClass,
      )}
    >
      {label}
    </span>
  );
}

export default function SelectLab() {
  const navigate = useNavigate();
  const { auth, setAuth } = useStore();
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const { data, isLoading, error } = useApi<UserLab[]>(endpoint.user.myLabs, {
    skipErrorHandling: true,
  });
  const labs = data?.data ?? [];

  const switchMutation = useMutation<SwitchTokens, SwitchLabPayload>(
    endpoint.auth.switch,
    {
      skipErrorHandling: true,
      onSuccess: (res) => {
        if (!res.data) return;
        setAuth(res.data);
        setSwitchingId(null);
        notify.fromApiSuccess(res, "Lab selected");
        navigate(getRoleRedirect(res.data.role ?? "manager"));
      },
      onError: (err) => {
        setSwitchingId(null);
        notify.fromApiError(err, "Failed to switch lab");
      },
    },
  );

  const handleSelect = (item: UserLab) => {
    if (switchingId) return;
    setSwitchingId(item.identifier);
    switchMutation.trigger({
      identifier: item.identifier,
      access_type: auth?.access_type ?? "staff",
    });
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/signin");
  };

  // ── Page shell ──────────────────────────────────────────────────
  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[440px] flex flex-col items-center gap-7">
        {children}
      </div>
    </div>
  );

  // ── Header (shared) ─────────────────────────────────────────────
  const header = (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
        <FlaskConical className="w-[18px] h-[18px] text-white" />
      </div>
      <div>
        <h1 className="text-[20px] font-bold text-foreground m-0">
          Select a Laboratory
        </h1>
        <p className="text-[13.5px] text-muted-foreground mt-1.5 mb-0">
          You belong to multiple labs. Choose one to continue.
        </p>
      </div>
    </div>
  );

  // ── Footer (shared) ─────────────────────────────────────────────
  const footer = (
    <p className="text-[12.5px] text-muted-foreground m-0">
      Wrong account?{" "}
      <button
        type="button"
        onClick={handleSignOut}
        className="text-primary font-semibold no-underline bg-transparent border-0 cursor-pointer p-0"
      >
        Sign out
      </button>
    </p>
  );

  // ── Loading skeleton ────────────────────────────────────────────
  if (isLoading) {
    return shell(
      <div className="w-full flex flex-col gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[70px] rounded-lg bg-muted animate-pulse" />
        ))}
      </div>,
    );
  }

  // ── Empty / error ───────────────────────────────────────────────
  if (error || labs.length === 0) {
    return shell(
      <>
        {header}
        <div className="w-full bg-card border border-border rounded-lg shadow-card py-10 px-6 flex flex-col items-center gap-3.5 text-center">
          <FolderX className="w-[30px] h-[30px] text-muted-foreground" />
          <p className="text-[13.5px] text-muted-foreground m-0">
            No labs found. Please sign in again.
          </p>
          <Button variant="outline" onClick={handleSignOut}>
            Back to Sign In
          </Button>
        </div>
        {footer}
      </>,
    );
  }

  // ── Lab list ────────────────────────────────────────────────────
  return shell(
    <>
      {header}

      <div className="w-full flex flex-col gap-2.5">
        {labs.map((item) => {
          const isItemLoading = switchingId === item.identifier;
          const disabled = !!switchingId && !isItemLoading;

          return (
            <button
              key={item.identifier}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(item)}
              className={cn(
                "flex items-center gap-3.5 w-full text-left",
                "bg-card border border-border rounded-lg shadow-card px-4 py-3.5",
                "transition-colors duration-150",
                "hover:border-primary/40",
                "disabled:opacity-50 disabled:pointer-events-none",
                disabled ? "cursor-default" : "cursor-pointer",
              )}
            >
              {/* Avatar */}
              <span className="w-10 h-10 rounded-[var(--radius-md)] bg-primary/10 inline-flex items-center justify-center flex-shrink-0 text-[10.5px] font-bold text-primary">
                {labInitials(item.name)}
              </span>

              {/* Name + code + role */}
              <span className="flex-1 min-w-0 text-left">
                <span className="block text-[14.5px] font-semibold text-foreground truncate leading-tight">
                  {item.name}
                </span>
                <span className="flex items-center gap-2 mt-[3px]">
                  <span className="text-[11.5px] font-mono text-muted-foreground">
                    {item.code}
                  </span>
                  <RolePill role={item.role} />
                </span>
              </span>

              {/* Right indicator */}
              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                {isItemLoading ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <ChevronRight className="w-[18px] h-[18px] text-muted-foreground" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {footer}
    </>,
  );
}
