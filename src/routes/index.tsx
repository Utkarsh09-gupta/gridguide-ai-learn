import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Sparkles, ArrowRight, Play, Search, Bot, Download, ListChecks,
  GitBranch, CheckCircle2, Activity, Cpu, Radio, Zap, Waves,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { modules } from "@/data/modules";
import { equipment } from "@/data/equipment";
import { stats, whyPoints, recentLearning } from "@/data/site";
import { ModuleCard } from "@/components/ModuleCard";
import { EquipmentCard } from "@/components/EquipmentCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GridGuide AI — Smart Learning for Power System & SCADA Interns" },
      { name: "description", content: "Learn SCADA, EMS, Protection, Communication Systems and Power Grid Operations from one AI-powered platform built for UPSLDC, PGCIL and RLDC interns." },
      { property: "og:title", content: "GridGuide AI — Smart Learning for Power System & SCADA Interns" },
      { property: "og:description", content: "Learn SCADA, EMS, Protection, Communication Systems and Power Grid Operations from one AI-powered platform built for UPSLDC, PGCIL and RLDC interns." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <SiteLayout>
      <Hero />
      <Stats />
      <QuickActions />
      <Roadmap />
      <Equipment />
      <Continue />
      <Why />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-12 gap-10 items-center relative">
        <div className="lg:col-span-7">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-muted-foreground"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
            AI-powered · Built for Load Dispatch Centre interns
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-5 text-5xl md:text-7xl font-semibold leading-[1.02] tracking-tight"
          >
            <span className="text-gradient">GridGuide AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg text-muted-foreground max-w-xl"
          >
            The smart learning platform for Power System & SCADA interns. Learn
            SCADA, EMS, Protection, Communication Systems and Power Grid
            Operations — all from one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0 hover:opacity-90 glow-primary">
              <Link to="/learning-path">
                Start Learning <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass border-white/15">
              <Link to="/equipment">
                <Play className="w-4 h-4 mr-1.5" /> Explore Modules
              </Link>
            </Button>
          </motion.div>

          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> UPSLDC ready</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> PGCIL topics</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-success" /> IEC 61850 · 60870</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-electric/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan/20 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse-ring" />
            <span className="text-xs text-muted-foreground">Grid Status · Live</span>
          </div>
          <span className="text-xs text-muted-foreground">50.02 Hz</span>
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-3">
          {[
            { icon: Cpu, label: "RTU", val: "OK" },
            { icon: Activity, label: "PMU", val: "Sync" },
            { icon: Radio, label: "SCADA", val: "104" },
          ].map((x, i) => (
            <motion.div
              key={x.label}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3 + i, repeat: Infinity }}
              className="glass rounded-xl p-3"
            >
              <x.icon className="w-4 h-4 text-cyan" />
              <div className="mt-2 text-xs text-muted-foreground">{x.label}</div>
              <div className="text-sm font-semibold">{x.val}</div>
            </motion.div>
          ))}
        </div>

        <div className="relative mt-5 glass rounded-xl p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground inline-flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-electric" /> Load — Northern Region
            </span>
            <span className="text-success">+2.4%</span>
          </div>
          <svg viewBox="0 0 300 80" className="mt-3 w-full h-20">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="oklch(0.68 0.19 250)" />
                <stop offset="1" stopColor="oklch(0.82 0.15 210)" />
              </linearGradient>
            </defs>
            <path
              d="M0 60 Q30 40 50 45 T100 30 T150 42 T200 22 T250 35 T300 18"
              fill="none"
              stroke="url(#g)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M0 60 Q30 40 50 45 T100 30 T150 42 T200 22 T250 35 T300 18 L300 80 L0 80 Z"
              fill="url(#g)"
              opacity="0.15"
            />
          </svg>
        </div>

        <div className="relative mt-4 flex items-center gap-2">
          <div className="grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-electric to-cyan">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="text-xs">
            <div className="text-muted-foreground">Next lesson</div>
            <div className="font-medium">SCADA · Master–Slave Polling</div>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
        </div>
      </div>
    </motion.div>
  );
}

function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="text-3xl md:text-4xl font-semibold text-gradient font-display">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function QuickActions() {
  const actions = [
    { icon: Search, label: "Search Topics" },
    { icon: Bot, label: "Ask AI" },
    { icon: Download, label: "Download Notes" },
    { icon: ListChecks, label: "Take Quiz" },
    { icon: GitBranch, label: "View Flowcharts" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 mt-14">
      <SectionHead eyebrow="Quick actions" title="Jump straight in" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
        {actions.map((a, i) => (
          <motion.button
            key={a.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -2 }}
            className="glass rounded-2xl p-4 text-left group hover:border-electric/40 transition-colors"
          >
            <div className="grid place-items-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 text-cyan group-hover:text-electric transition">
              <a.icon className="w-5 h-5" />
            </div>
            <div className="mt-3 font-medium">{a.label}</div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section className="mx-auto max-w-7xl px-4 mt-20">
      <SectionHead eyebrow="Learning roadmap" title="10 modules · from fundamentals to WAMS" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {modules.map((m, i) => <ModuleCard key={m.id} m={m} i={i} />)}
      </div>
    </section>
  );
}

function Equipment() {
  return (
    <section className="mx-auto max-w-7xl px-4 mt-20">
      <SectionHead eyebrow="Featured equipment" title="Every device in the control room" />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mt-8">
        {equipment.map((e, i) => <EquipmentCard key={e.id} e={e} i={i} />)}
      </div>
    </section>
  );
}

function Continue() {
  return (
    <section className="mx-auto max-w-7xl px-4 mt-20">
      <SectionHead eyebrow="Recent learning" title="Continue where you left off" />
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        {recentLearning.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-cyan">In progress</div>
                <div className="mt-1 text-lg font-semibold">{r.title}</div>
              </div>
              <div className="text-2xl font-display font-semibold text-gradient">{r.progress}%</div>
            </div>
            <Progress value={r.progress} className="mt-4 h-1.5" />
            <Button asChild size="sm" variant="ghost" className="mt-4 -ml-2 text-cyan hover:text-cyan">
              <Link to="/learning-path">Continue <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="mx-auto max-w-7xl px-4 mt-24">
      <SectionHead eyebrow="Why GridGuide AI" title="Built like a product, not a college project" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        {whyPoints.map((w, i) => (
          <motion.div
            key={w.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-5"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric to-cyan grid place-items-center">
              <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="mt-3 font-semibold">{w.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 mt-24">
      <div className="glass-strong relative rounded-3xl p-10 md:p-14 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="absolute -top-20 right-0 w-80 h-80 rounded-full bg-electric/25 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-gradient">Ready to master the grid?</h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Start with fundamentals or jump into SCADA. Your AI tutor is on call 24/7.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" className="bg-gradient-to-r from-electric to-cyan text-primary-foreground border-0 glow-primary">
              <Link to="/learning-path">Start Learning</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass border-white/15">
              <Link to="/ai-assistant">Talk to AI Tutor</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-cyan">
        <span className="h-px w-6 bg-cyan/60" />
        {eyebrow}
      </span>
      <h2 className="mt-2 text-3xl md:text-4xl font-semibold">{title}</h2>
    </div>
  );
}
