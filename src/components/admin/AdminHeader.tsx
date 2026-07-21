import { Bell, Menu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  onMenuClick: () => void;
  pageTitle: string;
}

const alerts = [
  { title: "New lab registration", desc: "MedPath Labs just signed up", time: "2m ago" },
  { title: "Subscription expiring", desc: "CityDiag Ikeja — 3 days left", time: "1h ago" },
  { title: "API rate limit hit", desc: "HealthFirst Lab exceeded quota", time: "4h ago" },
];

export function AdminHeader({ onMenuClick, pageTitle }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center gap-4 px-4 md:px-6 flex-shrink-0">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-2 flex-1">
        <Globe className="w-4 h-4 text-primary hidden sm:block" />
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground hidden md:flex">
        <span className="w-2 h-2 rounded-full bg-success inline-block" />
        <span>All systems operational</span>
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-destructive text-destructive-foreground border-0">
              {alerts.length}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Platform Alerts</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {alerts.map((a, i) => (
            <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5 py-3 cursor-pointer">
              <span className="font-medium text-sm">{a.title}</span>
              <span className="text-xs text-muted-foreground">{a.desc}</span>
              <span className="text-xs text-muted-foreground/60">{a.time}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 pl-2 pr-3 h-9">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">SA</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium">System Admin</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>super@ezralabs.ng</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Audit Logs</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
