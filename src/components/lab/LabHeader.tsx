import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  User,
  FlaskConical,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";
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
import { useCurrentUser, useGlobalSearch, useMutation } from "@/hooks/use-api";
import { useStore } from "@/hooks/use-store";
import endpoint from "@/api/endpoints";
import type { LogoutPayload } from "@/api/types/auth";
import type { SearchResourceType, SearchHit } from "@/api/types/search";

interface LabHeaderProps {
  onMenuClick: () => void;
  pageTitle: string;
}

const notifications = [
  { id: 1, text: "Result approved: Emeka Chukwu – Malaria", time: "5m ago", unread: true },
  { id: 2, text: "Low stock alert: FBC Reagent (12 remaining)", time: "1h ago", unread: true },
  { id: 3, text: "New test request from Dr. Uchenna Obi", time: "2h ago", unread: false },
];

const GROUP_META: Record<
  SearchResourceType,
  { label: string; icon: React.ElementType; route: (id: string) => string }
> = {
  patients: { label: "Patients", icon: User, route: (id) => `/lab/patients/${id}` },
  staff: { label: "Staff", icon: Users, route: () => `/lab/staff` },
  tests: { label: "Tests", icon: FlaskConical, route: () => `/lab/test-catalog` },
  orders: { label: "Orders", icon: ClipboardList, route: (id) => `/lab/tests/${id}` },
  results: { label: "Results", icon: FileText, route: (id) => `/lab/results/${id}` },
};

export function LabHeader({ onMenuClick, pageTitle }: LabHeaderProps) {
  const navigate = useNavigate();
  const { auth, unsetAuth } = useStore();
  const { user } = useCurrentUser();
  const logoutMutation = useMutation<unknown, LogoutPayload>(endpoint.auth.logout, {
    method: "POST",
    skipErrorHandling: true,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
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

  const unreadCount = notifications.filter((n) => n.unread).length;

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading: isSearching, hasQuery } = useGlobalSearch(searchQuery);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const roleTitle = user?.membership?.role ?? "";

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowResults(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleHitClick = (type: SearchResourceType, hit: SearchHit) => {
    navigate(GROUP_META[type].route(hit.id));
    setShowResults(false);
    setSearchQuery("");
  };

  const groups = results?.groups
    ? (Object.entries(results.groups) as [SearchResourceType, SearchHit[]][]).filter(
        ([, hits]) => hits.length > 0
      )
    : [];
  const hasResults = groups.length > 0;

  return (
    <header className="h-16 border-b border-border bg-card flex items-center gap-4 px-4 md:px-6 flex-shrink-0 relative z-30">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground leading-tight">{pageTitle}</h1>
        <p className="text-xs text-muted-foreground leading-tight hidden sm:block">{roleTitle}</p>
      </div>

      {/* Global Search */}
      <div className="hidden md:block relative w-[340px]" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
        <Input
          ref={inputRef}
          placeholder="Search patients, tests…"
          className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />

        {showResults && hasQuery && (
          <div className="absolute top-full mt-1.5 left-0 w-[420px] bg-card border border-border rounded-xl shadow-elevated z-40 max-h-[420px] overflow-y-auto">
            {isSearching ? (
              /* Skeleton rows while loading */
              <div className="p-2.5 flex flex-col gap-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-1.5 py-2">
                    <div className="w-[26px] h-[26px] rounded-md bg-muted animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-[70%] rounded bg-muted animate-pulse" />
                      <div className="h-2.5 w-[45%] rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasResults ? (
              <p className="text-center text-sm text-muted-foreground py-6 px-4">
                No results for "{searchQuery}"
              </p>
            ) : (
              groups.map(([type, hits]) => {
                const { label, icon: Icon } = GROUP_META[type] ?? {
                  label: type,
                  icon: Search,
                };
                return (
                  <div key={type}>
                    <p className="px-3.5 pt-2.5 pb-1 text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
                      {label}
                    </p>
                    {hits.map((hit) => (
                      <button
                        key={hit.id}
                        className="w-full flex items-center gap-2.5 px-3.5 py-1.5 hover:bg-muted/50 transition-colors text-left"
                        onClick={() => handleHitClick(type, hit)}
                      >
                        <span className="w-[26px] h-[26px] rounded-[6px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-[13px] h-[13px] text-primary" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-semibold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                            {hit.title}
                          </span>
                          {hit.subtitle && (
                            <span className="block text-[11.5px] text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                              {hit.subtitle}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}
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
                  className={`text-sm leading-snug ${
                    n.unread ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {n.text}
                </span>
              </div>
              <span className="text-xs text-muted-foreground ml-4">{n.time}</span>
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
