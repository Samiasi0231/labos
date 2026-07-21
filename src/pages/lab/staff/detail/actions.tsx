import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useMutation } from "@/hooks/use-api";
import endpoint from "@/api/endpoints";
import type { StaffRole } from "@/api/types/enums";
import { ROLE_LABELS, ROLE_COLORS } from "./shared";
import type { StaffDetail } from "./shared";
import { cn } from "@/lib/utils";

const ASSIGNABLE_ROLES: StaffRole[] = ["scientist", "technician", "receptionist"];

// ── Change Role Dialog ────────────────────────────────────────────────────────

interface ChangeRoleProps {
  staff: StaffDetail;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChangeRoleDialog({ staff, open, onClose, onSuccess }: ChangeRoleProps) {
  const [draft, setDraft] = useState<StaffRole>(staff.role);

  const updateRole = useMutation<unknown, { role: StaffRole }>(
    endpoint.lab.staff.updateRole(staff._id),
    {
      method: "PATCH",
      successToast: "Role updated — custom permission overrides were reset.",
      onSuccess,
    },
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Current role */}
          <div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground mb-1.5">
              Current Role
            </p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border",
                ROLE_COLORS[staff.role],
              )}
            >
              {ROLE_LABELS[staff.role]}
            </span>
          </div>

          {/* Radio options */}
          <div className="flex flex-col gap-2">
            {ASSIGNABLE_ROLES.map((r) => (
              <label
                key={r}
                className={cn(
                  "flex items-center gap-2.5 border rounded-[var(--radius)] px-3 py-2.5 cursor-pointer transition-colors",
                  draft === r
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40",
                )}
              >
                <input
                  type="radio"
                  name="new-role"
                  checked={draft === r}
                  onChange={() => setDraft(r)}
                  className="accent-primary"
                />
                <span className="text-[13.5px] font-semibold">{ROLE_LABELS[r]}</span>
              </label>
            ))}
          </div>

          {/* Warning banner */}
          <div className="flex gap-2 items-start bg-warning/8 border border-warning/25 rounded-[var(--radius)] px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground leading-relaxed">
              Changing the role will reset any custom permission overrides.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="default"
            disabled={updateRole.isLoading || draft === staff.role}
            onClick={() => updateRole.trigger({ role: draft })}
          >
            {updateRole.isLoading ? "Saving…" : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Remove Dialog ─────────────────────────────────────────────────────────────

interface RemoveProps {
  staff: StaffDetail;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RemoveDialog({ staff, open, onClose, onSuccess }: RemoveProps) {
  const remove = useMutation<unknown, void>(endpoint.lab.staff.remove(staff._id), {
    method: "DELETE",
    successToast: "Staff member removed",
    onSuccess,
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>
            Remove {staff.user.firstName} {staff.user.lastName} from the lab?
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 items-start bg-destructive/8 border border-destructive/25 rounded-[var(--radius)] px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-foreground leading-relaxed">
            This will revoke their access immediately. This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="default"
            disabled={remove.isLoading}
            onClick={() => remove.trigger()}
          >
            {remove.isLoading ? "Removing…" : "Remove Staff"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
