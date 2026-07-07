import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-user";
import { useLogout } from "@/hooks/use-auth";

interface LabHeaderProps {
  onMenuClick: () => void;
  pageTitle: string;
}


const notifications = [
  {
    id: 1,
    text: "Result approved: Emeka Chukwu – Malaria",
    time: "5m ago",
    unread: true,
  },
  {
    id: 2,
    text: "Low stock alert: FBC Reagent (12 remaining)",
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    text: "New test request from Dr. Uchenna Obi",
    time: "2h ago",
    unread: false,
  },
];

export function LabHeader({ onMenuClick, pageTitle }: LabHeaderProps) {
  const { user } = useCurrentUser();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const unreadCount = notifications.filter((n) => n.unread).length;

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const roleTitle = user?.membership?.role ?? "";

  return (
    <header className="h-16 border-b border-border bg-card flex items-center gap-4 px-4 md:px-6 flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground leading-tight">
          {pageTitle}
        </h1>
        <p className="text-xs text-muted-foreground leading-tight hidden sm:block">
          {roleTitle}
        </p>
      </div>

      {/* Search */}
      <div className="hidden md:flex relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients, tests..."
          className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm"
        />
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-destructive text-destructive-foreground border-0">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            <Badge variant="outline" className="text-xs">
              {unreadCount} new
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-1 py-3 cursor-pointer"
            >
              <div className="flex items-start gap-2 w-full">
                {n.unread && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                )}
                <span
                  className={`text-sm leading-snug ${n.unread ? "font-medium" : "text-muted-foreground"}`}
                >
                  {n.text}
                </span>
              </div>
              <span className="text-xs text-muted-foreground ml-4">
                {n.time}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 pl-2 pr-3 h-9">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
              {fullName.split(" ").slice(0, 2).join(" ")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{roleTitle}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={logout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
