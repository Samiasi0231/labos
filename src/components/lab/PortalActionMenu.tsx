import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, Send, RefreshCw, ShieldOff, Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PortalAccess } from "@/data/mockData";

interface Props {
  id: string;
  name: string;
  email?: string;
  portalAccess: PortalAccess;
  onGrant:  (id: string) => Promise<void>;
  onResend: (id: string) => Promise<void>;
  onRevoke: (id: string) => Promise<void>;
  onEdit?:  () => void;
  editLabel?: string;
  /** 'menu' = kebab dropdown for list rows; 'buttons' = labeled buttons for detail view */
  variant?: "menu" | "buttons";
}

type ActionKey = "grant" | "resend" | "revoke";

export function PortalActionMenu({
  id, name, email, portalAccess, onGrant, onResend, onRevoke, onEdit, editLabel = "Edit", variant = "menu",
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<ActionKey | null>(null);
  const [confirm, setConfirm] = useState<"grant" | "revoke" | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const run = async (action: ActionKey) => {
    setLoading(action);
    setError(null);
    try {
      if (action === "grant")  { await onGrant(id);  toast({ title: "Invite sent",    description: `Portal invite sent to ${name}.` }); }
      if (action === "resend") { await onResend(id); toast({ title: "Invite resent",  description: `Invite resent to ${email ?? name}.` }); }
      if (action === "revoke") { await onRevoke(id); toast({ title: "Access revoked", description: `${name}'s portal access has been removed.` }); }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
      setConfirm(null);
    }
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
          <Button disabled={!!loading} onClick={() => run("grant")}>
            {loading === "grant" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Send Invite
          </Button>
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
          <Button variant="destructive" disabled={!!loading} onClick={() => run("revoke")}>
            {loading === "revoke" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Revoke Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ── Buttons variant (detail / side-panel view) ───────────────
  if (variant === "buttons") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {portalAccess === "none" && (
          <Button size="sm" className="gap-2" disabled={!!loading} onClick={() => setConfirm("grant")}>
            {loading === "grant" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Grant Portal Access
          </Button>
        )}
        {portalAccess === "invite_sent" && (
          <>
            <Button size="sm" variant="outline" className="gap-2" disabled={!!loading} onClick={() => run("resend")}>
              {loading === "resend" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Resend Invite
            </Button>
            <Button size="sm" variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive" disabled={!!loading} onClick={() => setConfirm("revoke")}>
              {loading === "revoke" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
              Revoke Access
            </Button>
          </>
        )}
        {portalAccess === "active" && (
          <Button size="sm" variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive" disabled={!!loading} onClick={() => setConfirm("revoke")}>
            {loading === "revoke" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
            Revoke Access
          </Button>
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
          {portalAccess === "none" && (
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setConfirm("grant")}>
              <Send className="w-3.5 h-3.5" />Grant Portal Access
            </DropdownMenuItem>
          )}
          {portalAccess === "invite_sent" && (
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
          {portalAccess === "active" && (
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
