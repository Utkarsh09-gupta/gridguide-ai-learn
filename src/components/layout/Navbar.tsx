import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Zap, LogOut, User as UserIcon } from "lucide-react";
import { nav } from "../../data/site";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="glass-strong rounded-2xl px-4 py-2.5 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-electric to-cyan glow-primary">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </span>
            <span className="font-display font-semibold tracking-tight text-lg">
              GridGuide<span className="text-electric"> AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {nav.map((n) => {
              // Hide Profile tab from navbar if user is not logged in
              if (n.to === "/profile" && !user) return null;
              
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors",
                    active && "text-foreground bg-white/5"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Button asChild size="sm" className="hidden md:inline-flex bg-gradient-to-r from-electric to-cyan text-primary-foreground hover:opacity-90 border-0">
              <Link to="/learning-path">Start Learning</Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none cursor-pointer">
                    <Avatar className="w-9 h-9 border border-white/15 hover:border-cyan/50 transition">
                      <AvatarFallback className="bg-gradient-to-br from-electric to-cyan text-primary-foreground font-semibold text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 glass-strong border-white/10 text-foreground">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      {user.organization && (
                        <p className="text-[10px] text-cyan font-mono mt-1">{user.organization}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                    <Link to="/profile" className="flex items-center w-full">
                      <UserIcon className="mr-2 h-4 w-4 text-cyan" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10 focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" variant="outline" className="glass border-white/15 text-foreground hover:bg-white/10">
                <Link to="/auth">Log In</Link>
              </Button>
            )}

            <button
              className="lg:hidden p-2 rounded-lg glass"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass-strong rounded-2xl mt-2 p-2 lg:hidden"
            >
              {nav.map((n) => {
                if (n.to === "/profile" && !user) return null;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                  >
                    <n.icon className="w-4 h-4 text-electric" />
                    {n.label}
                  </Link>
                );
              })}
              {user && (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
