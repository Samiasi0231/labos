import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@/hooks/use-api";
import { useStore } from "@/hooks/use-store";
import endpoint from "@/api/endpoints";
import type { LogoutPayload } from "@/api/types/auth";

interface PatientHeaderProps {
  onMenuClick: () => void;
  pageTitle: string;
}

const notifications = [
  { title: "Result Ready", desc: "Your Full Blood Count result is available", time: "2h ago", unread: true },
  { title: "Appointment Confirmed", desc: "Malaria test — Jun 20 at 9:00 AM", time: "1d ago", unread: true },
  { title: "Report Downloaded", desc: "Liver Function Test — Jun 15", time: "3d ago", unread: false },
];

export function PatientHeader({ onMenuClick, pageTitle }: PatientHeaderProps) {
  const { auth, unsetAuth } = useStore();
  const unread = notifications.filter(n => n.unread).length;
  const logoutMutation = useMutation<unknown, LogoutPayload>(endpoint.auth.logout, {
    method: "POST",
    skipErrorHandling: true,
  });
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try {
      if (auth?.refresh_token) {
        await logoutMutation.trigger({ refresh_token: auth.refresh_token });
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      unsetAuth();
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center gap-4 px-4 md:px-6 flex-shrink-0">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-destructive text-destructive-foreground border-0">
                {unread}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.map((n, i) => (
            <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5 py-3 cursor-pointer">
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium text-sm flex-1">{n.title}</span>
                {n.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              </div>
              <span className="text-xs text-muted-foreground">{n.desc}</span>
              <span className="text-xs text-muted-foreground/60">{n.time}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 pl-2 pr-3 h-9">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">AO</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium">Amara Okonkwo</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>PAT-001</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>My Profile</DropdownMenuItem>
          <DropdownMenuItem>Download Records</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            disabled={loggingOut}
            onSelect={() => logout()}
          >
            {loggingOut ? "Signing out…" : "Sign Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
