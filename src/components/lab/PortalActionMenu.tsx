import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PermissionButton } from "@/components/button";
import { usePermission } from "@/hooks/use-permission";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, Send, RefreshCw, ShieldOff, Loader2, Pencil } from "lucide-react";
import type { PortalAccess } from "@/data/mockData";

interface Props {
  id: string;
  name: string;
  email?: string;
  portalAccess: PortalAccess;
  onGrant:  (id: string) => Promise<unknown | null>;
  onResend: (id: string) => Promise<unknown | null>;
  onRevoke: (id: string) => Promise<unknown | null>;
  onEdit?:  () => void;
  editLabel?: string;
  /** 'menu' = kebab dropdown for list rows; 'buttons' = labeled buttons for detail view */
  variant?: "menu" | "buttons";
}

type ActionKey = "grant" | "resend" | "revoke";

export function PortalActionMenu({
  id, name, email, portalAccess, onGrant, onResend, onRevoke, onEdit, editLabel = "Edit", variant = "menu",
}: Props) {
  const [loading, setLoading] = useState<ActionKey | null>(null);
  const [confirm, setConfirm] = useState<"grant" | "revoke" | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const { can } = usePermission();
  const canManageAccess = can("lab.manage_access");

  const run = async (action: ActionKey) => {
    setLoading(action);
    setError(null);
    let result: unknown | null = null;
    if (action === "grant") result = await onGrant(id);
    if (action === "resend") result = await onResend(id);
    if (action === "revoke") result = await onRevoke(id);
    if (result === null) {
      setLoading(null);
      setConfirm(null);
      return;
    }
    setLoading(null);
    setConfirm(null);
  };

  const grantDialog = (
    <Dialog open={confirm === "grant"} onOpenChange={o => !o && setConfirm(null)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Grant Portal Access</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Send a portal invite to <strong>{name}</strong>?
          </p>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
          <PermissionButton
            permission="lab.manage_access"
            fallback="hide"
            isLoading={loading === "grant"}
            onClick={() => run("grant")}
          >
            Send Invite
          </PermissionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const revokeDialog = (
    <Dialog open={confirm === "revoke"} onOpenChange={o => !o && setConfirm(null)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Revoke Portal Access</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            This will remove <strong>{name}</strong>'s access to the patient portal. They will
            need to be re-invited to regain access.
          </p>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
          <PermissionButton
            variant="destructive"
            permission="lab.manage_access"
            fallback="hide"
            isLoading={loading === "revoke"}
            onClick={() => run("revoke")}
          >
            Revoke Access
          </PermissionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ── Buttons variant (detail / side-panel view) ───────────────
  if (variant === "buttons") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {canManageAccess && portalAccess === "none" && (
          <PermissionButton permission="lab.manage_access" fallback="hide" size="sm" className="gap-2" isLoading={loading === "grant"} leftIcon={<Send className="w-3.5 h-3.5" />} onClick={() => setConfirm("grant")}>
            Grant Portal Access
          </PermissionButton>
        )}
        {canManageAccess && portalAccess === "invite_sent" && (
          <>
            <PermissionButton permission="lab.manage_access" fallback="hide" size="sm" variant="outline" className="gap-2" isLoading={loading === "resend"} leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => run("resend")}>
              Resend Invite
            </PermissionButton>
            <PermissionButton permission="lab.manage_access" fallback="hide" size="sm" variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive" isLoading={loading === "revoke"} leftIcon={<ShieldOff className="w-3.5 h-3.5" />} onClick={() => setConfirm("revoke")}>
              Revoke Access
            </PermissionButton>
          </>
        )}
        {canManageAccess && portalAccess === "active" && (
          <PermissionButton permission="lab.manage_access" fallback="hide" size="sm" variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive" isLoading={loading === "revoke"} leftIcon={<ShieldOff className="w-3.5 h-3.5" />} onClick={() => setConfirm("revoke")}>
            Revoke Access
          </PermissionButton>
        )}
        {error && <p className="w-full text-xs text-destructive">{error}</p>}
        {grantDialog}
        {revokeDialog}
      </div>
    );
  }

  // ── Menu variant (list rows) ──────────────────────────────────
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={!!loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onEdit && (
            <>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onEdit}>
                <Pencil className="w-3.5 h-3.5" />{editLabel}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {canManageAccess && portalAccess === "none" && (
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setConfirm("grant")}>
              <Send className="w-3.5 h-3.5" />Grant Portal Access
            </DropdownMenuItem>
          )}
          {canManageAccess && portalAccess === "invite_sent" && (
            <>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => run("resend")}>
                <RefreshCw className="w-3.5 h-3.5" />Resend Invite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => setConfirm("revoke")}>
                <ShieldOff className="w-3.5 h-3.5" />Revoke Access
              </DropdownMenuItem>
            </>
          )}
          {canManageAccess && portalAccess === "active" && (
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => setConfirm("revoke")}>
              <ShieldOff className="w-3.5 h-3.5" />Revoke Access
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
      {grantDialog}
      {revokeDialog}
    </>
  );
}
