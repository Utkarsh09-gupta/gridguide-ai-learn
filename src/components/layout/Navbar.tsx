import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Zap } from "lucide-react";
import { nav } from "@/data/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

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

          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" className="hidden md:inline-flex bg-gradient-to-r from-electric to-cyan text-primary-foreground hover:opacity-90 border-0">
              <Link to="/learning-path">Start Learning</Link>
            </Button>
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
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5"
                >
                  <n.icon className="w-4 h-4 text-electric" />
                  {n.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
