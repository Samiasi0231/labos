
export interface PasswordStrength {
  pct: number;
  label: string;
  colorClass: string;
}

export function evalPasswordStrength(pwd: string): PasswordStrength {
  if (!pwd) return { pct: 0, label: "", colorClass: "" };
  if (pwd.length < 6) return { pct: 30, label: "Weak", colorClass: "bg-destructive" };
  if (pwd.length < 10) return { pct: 65, label: "Fair", colorClass: "bg-yellow-500" };
  return { pct: 100, label: "Strong", colorClass: "bg-green-500" };
}

export interface PermGroup {
  resource: string;
  key: string;
  actions: { label: string }[];
}

/** Parse "resource.action" or "resource:action" permission strings into display groups. */
export function groupPermissions(perms: string[]): PermGroup[] {
  const map = new Map<string, Set<string>>();
  for (const p of perms) {
    const sep = p.includes(".") ? "." : ":";
    const [res, action] = p.split(sep);
    if (!res || !action) continue;
    if (!map.has(res)) map.set(res, new Set());
    map.get(res)!.add(action);
  }
  return Array.from(map.entries()).map(([key, actions]) => ({
    key,
    resource: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    actions: Array.from(actions).map((a) => ({
      label: a.replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
  }));
}

export function roleBadgeVariant(role: string | null): "default" | "secondary" | "outline" {
  const r = role?.toLowerCase() ?? "";
  if (r === "manager") return "default";
  if (r === "scientist" || r === "technician") return "outline";
  return "secondary";
}
