import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ConnectWallet } from "./ConnectWallet";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/explore", label: "Explore" },
  { to: "/launch", label: "Launch" },
  { to: "/profile", label: "Profile" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-4">
      <nav
        className={cn(
          "glass-strong relative flex w-full max-w-5xl items-center justify-between rounded-full transition-all duration-300",
          scrolled ? "h-12 px-2 sm:px-3 shadow-[0_8px_40px_-12px_rgba(60,120,255,0.35)]" : "h-14 px-2.5 sm:px-3.5",
        )}
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.05), 0 10px 40px -16px rgba(60,120,255,0.35)",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 font-display text-lg font-semibold tracking-tight"
        >
          <span className="relative inline-block h-5 w-5">
            <span className="absolute inset-0 rounded-full bg-gradient-neon blur-[6px] opacity-80" />
            <span className="absolute inset-0 rounded-full bg-chrome animate-chrome" />
          </span>
          <span className="text-chrome">Ideon</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => {
            const active = location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-foreground/70 hover:text-white",
                )}
              >
                {active && (
                  <span
                    className="absolute inset-0 -z-10 rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, color-mix(in oklab, var(--neon-blue) 70%, transparent), color-mix(in oklab, var(--deep-blue) 60%, transparent))",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.25), 0 0 22px -4px color-mix(in oklab, var(--neon-blue) 70%, transparent)",
                    }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Connect + mobile toggle */}
        <div className="flex items-center gap-1.5">
          <ConnectWallet size="sm" />
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-white md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="glass-strong absolute left-2 right-2 top-[calc(100%+8px)] flex flex-col gap-1 rounded-2xl p-2 md:hidden">
            {NAV_LINKS.map((l) => {
              const active = location.pathname.startsWith(l.to);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium",
                    active ? "bg-white/10 text-white" : "text-foreground/80",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
}
