import type { ReactNode } from "react";
import { motion } from "motion/react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function PageShell({
  eyebrow,
  title,
  description,
  backUrl,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  backUrl?: string;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <section className="relative mx-auto max-w-7xl px-4 pt-14 pb-8">
        <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {backUrl && (
            <Link
              to={backUrl}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors mb-4 border border-white/5 bg-white/5 px-3 py-1.5 rounded-xl hover:bg-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          )}
          {eyebrow && (
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cyan">
              <span className="h-px w-6 bg-cyan/60" />
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold text-gradient">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
          )}
        </motion.div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16">{children}</section>
    </SiteLayout>
  );
}

