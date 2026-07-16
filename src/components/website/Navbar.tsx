import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FlaskConical,
  Menu,
  X,
  HeartPulse,
  ChevronRight,
} from "lucide-react";

// ── Portal selector config ────────────────────────────────────────────────────

const PORTALS = [
  {
    id: "staff",
    title: "Lab Staff",
    subtitle: "Managers, scientists, and receptionists",
    Icon: FlaskConical,
    iconClass: "text-primary bg-primary/10",
    routes: { signin: "/signin", signup: "/signup" },
  },
  {
    id: "patient",
    title: "Patient",
    subtitle: "View your results and appointments",
    Icon: HeartPulse,
    iconClass: "text-sky-600 bg-sky-500/10",
    routes: { signin: "/patient/signin", signup: "/patient/signin" },
  },
] as const;

type Intent = "signin" | "signup";

// ── PortalDropdown ────────────────────────────────────────────────────────────

interface PortalDropdownProps {
  intent: Intent;
  onClose: () => void;
}

function PortalDropdown({ intent, onClose }: PortalDropdownProps) {
  const navigate = useNavigate();

  const handleSelect = (routes: (typeof PORTALS)[number]["routes"]) => {
    onClose();
    navigate(routes[intent]);
  };

  return (
    <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
      <p className="px-4 pt-3 pb-2 text-xs font-bold text-muted-foreground">
        Which portal are you accessing?
      </p>
      <div className="flex flex-col px-2 pb-2 gap-1">
        {PORTALS.map((portal) => (
          <button
            key={portal.id}
            onClick={() => handleSelect(portal.routes)}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border border-border hover:border-muted-foreground/30 hover:bg-muted/50 transition-colors"
          >
            <span
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                portal.iconClass,
              )}
            >
              <portal.Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13.5px] font-bold leading-tight">
                {portal.title}
              </span>
              <span className="block text-[11.5px] text-muted-foreground leading-tight mt-0.5">
                {portal.subtitle}
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

const navLinks = [
  { path: "/", label: "Home", exact: true },
  { path: "/features", label: "Features" },
  { path: "/pricing", label: "Pricing" },
  { path: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selector, setSelector] = useState<{
    open: boolean;
    intent: Intent;
  }>({ open: false, intent: "signin" });

  const selectorRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!selector.open) return;
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelector((p) => ({ ...p, open: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selector.open]);

  const openSelector = (intent: Intent) => {
    setSelector({ open: true, intent });
  };

  const closeSelector = () => setSelector((p) => ({ ...p, open: false }));

  const isActive = (path: string, exact?: boolean) =>
    exact
      ? window.location.pathname === path
      : window.location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary">Lab</span>
              <span className="text-xl font-bold text-foreground">OS</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.path, link.exact)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA with portal selector */}
          <div className="hidden md:flex items-center gap-3 relative" ref={selectorRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openSelector("signin")}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="gap-2 shadow-glow"
              onClick={() => openSelector("signup")}
            >
              Get Started Free
            </Button>

            {selector.open && (
              <PortalDropdown intent={selector.intent} onClose={closeSelector} />
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-border mt-1 pt-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.path, link.exact)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile: show portal options inline */}
            <div className="pt-3 px-2 space-y-1 border-t border-border mt-2">
              <p className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
                Sign In as…
              </p>
              {PORTALS.map((portal) => (
                <Link
                  key={portal.id}
                  to={portal.routes.signin}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      portal.iconClass,
                    )}
                  >
                    <portal.Icon className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{portal.title}</span>
                    <span className="block text-xs text-muted-foreground">{portal.subtitle}</span>
                  </span>
                </Link>
              ))}
              <Button
                className="w-full mt-2"
                size="sm"
                onClick={() => {
                  setMobileOpen(false);
                }}
                asChild
              >
                <Link to="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
