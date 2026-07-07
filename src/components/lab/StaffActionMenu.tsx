import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  RefreshCw,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { StaffRole, StaffStatus } from "@/api/types/enums";

const CHANGEABLE_ROLES: StaffRole[] = ["scientist", "receptionist"];

const ROLE_LABELS: Record<StaffRole, string> = {
  manager: "Manager",
  technician: "Technician",
  scientist: "Lab Scientist",
  receptionist: "Receptionist",
};

interface Props {
  id: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  onResend: (id: string) => Promise<void>;
  onEditRole: (id: string, newRole: StaffRole) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  onActivate: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

type ActionKey = "resend" | "editRole" | "deactivate" | "activate" | "remove";

export function StaffActionMenu({
  id,
  name,
  role,
  status,
  onResend,
  onEditRole,
  onDeactivate,
  onActivate,
  onRemove,
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<ActionKey | null>(null);
  const [confirm, setConfirm] = useState<"deactivate" | "remove" | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [newRole, setNewRole] = useState<StaffRole>(role);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: ActionKey, payload?: StaffRole) => {
    setLoading(action);
    setError(null);
    try {
      if (action === "resend") {
        await onResend(id);
        toast({
          title: "Invite resent",
          description: `Invite resent to ${name}.`,
        });
      }
      if (action === "editRole") {
        await onEditRole(id, payload!);
        toast({
          title: "Role updated",
          description: `${name} is now a ${ROLE_LABELS[payload!]}.`,
        });
        setEditOpen(false);
      }
      if (action === "deactivate") {
        await onDeactivate(id);
        toast({
          title: "Staff deactivated",
          description: `${name} has been deactivated.`,
        });
      }
      if (action === "activate") {
        await onActivate(id);
        toast({
          title: "Staff activated",
          description: `${name} has been reactivated.`,
        });
      }
      if (action === "remove") {
        await onRemove(id);
        toast({
          title: "Staff removed",
          description: `${name} has been removed.`,
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
      setConfirm(null);
    }
  };

  const isManager = role === "manager";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!!loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreHorizontal className="w-4 h-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {/* Pending */}
          {status === "pending" && (
            <>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => run("resend")}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resend Invite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => setConfirm("remove")}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </DropdownMenuItem>
            </>
          )}

          {/* Active */}
          {status === "active" && (
            <>
              {!isManager && (
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => {
                    setNewRole(role);
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Role
                </DropdownMenuItem>
              )}
              {!isManager && (
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => setConfirm("deactivate")}
                >
                  <UserX className="w-3.5 h-3.5" />
                  Deactivate
                </DropdownMenuItem>
              )}
              {!isManager && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={() => setConfirm("remove")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}

          {/* Inactive */}
          {status === "inactive" && (
            <>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => run("activate")}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Activate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => setConfirm("remove")}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}

      {/* Deactivate confirm */}
      <Dialog
        open={confirm === "deactivate"}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate {name}?</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              They will lose access immediately.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!!loading}
              onClick={() => run("deactivate")}
            >
              {loading === "deactivate" && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm */}
      <Dialog
        open={confirm === "remove"}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {name}?</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Remove {name} from the lab? This cannot be undone.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!!loading}
              onClick={() => run("remove")}
            >
              {loading === "remove" && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Select a new role for {name}.
            </p>
          </DialogHeader>
          <Select
            value={newRole}
            onValueChange={(v) => setNewRole(v as StaffRole)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANGEABLE_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!!loading || newRole === role}
              onClick={() => run("editRole", newRole)}
            >
              {loading === "editRole" && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
