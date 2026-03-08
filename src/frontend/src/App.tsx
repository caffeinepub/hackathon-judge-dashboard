import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  ChevronDown,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { LeaderboardPage } from "./components/LeaderboardPage";
import { TeamsPage } from "./components/TeamsPage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin } from "./hooks/useQueries";

type Tab = "leaderboard" | "teams";

function NavTab({
  active,
  icon: Icon,
  label,
  onClick,
  ocid,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: isAdmin, isLoading: loadingAdmin } = useIsAdmin();

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-4)}`
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header / Nav ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 h-16">
            {/* Brand */}
            <div className="flex items-center gap-2 mr-4 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground hidden sm:block">
                HackJudge
              </span>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-1">
              <NavTab
                active={activeTab === "leaderboard"}
                icon={Trophy}
                label="Leaderboard"
                onClick={() => setActiveTab("leaderboard")}
                ocid="nav.leaderboard.tab"
              />
              <NavTab
                active={activeTab === "teams"}
                icon={Users}
                label="Teams"
                onClick={() => setActiveTab("teams")}
                ocid="nav.teams.tab"
              />
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Admin badge */}
            {isLoggedIn && !loadingAdmin && isAdmin && (
              <Badge variant="secondary" className="gap-1.5 hidden sm:flex">
                <ShieldCheck className="w-3 h-3 text-primary" />
                Admin
              </Badge>
            )}

            {/* Auth */}
            {isInitializing ? (
              <Skeleton className="h-9 w-24 rounded-lg" />
            ) : isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">
                        {shortPrincipal?.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-xs font-mono">
                      {shortPrincipal}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                      Signed in as
                    </p>
                    <p className="text-xs font-mono text-foreground truncate mt-0.5">
                      {principal}
                    </p>
                  </div>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-primary text-sm gap-2"
                        disabled
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clear}
                    className="text-destructive gap-2"
                    data-ocid="nav.logout.button"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="nav.login.button"
                className="gap-2"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "leaderboard" ? (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <LeaderboardPage />
            </motion.div>
          ) : (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <TeamsPage isAdmin={!!isAdmin} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-muted/30 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
