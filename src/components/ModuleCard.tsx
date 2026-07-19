import { motion } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, ArrowUpRight, Zap, CalendarClock, Monitor, Wifi, 
  Cpu, BatteryCharging, ShieldCheck, Building2, Activity, Radio, BookOpen 
} from "lucide-react";
import type { Module } from "@/data/modules";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const diffColor: Record<string, string> = {
  Beginner: "bg-success/20 text-success border-success/30",
  Intermediate: "bg-cyan/20 text-cyan border-cyan/30",
  Advanced: "bg-electric/20 text-electric border-electric/30",
};

const iconMap: Record<string, any> = {
  "power-fundamentals": Zap,
  "sldc-dispatch": CalendarClock,
  "scada": Monitor,
  "communication": Wifi,
  "ems": Cpu,
  "power-supply": BatteryCharging,
  "protection": ShieldCheck,
  "substation-automation": Building2,
  "pmu-wams": Activity,
  "grid-operation": Radio
};

export function ModuleCard({ m, i = 0 }: { m: any; i?: number }) {
  const Icon = m.icon || iconMap[m.id] || BookOpen;
  return (
    <Link
      to="/learning-path/$moduleId"
      params={{ moduleId: m.id }}
      className="block text-inherit no-underline"
    >
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px" }}
        transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
        whileHover={{ y: -4 }}
        className="glass gpu-layer group relative rounded-2xl p-5 overflow-hidden cursor-pointer"
      >
        <div className={cn("absolute -inset-px rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity", m.accent)} />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br text-primary-foreground", m.accent)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Module {m.index}</div>
              <h3 className="font-semibold leading-tight">{m.title}</h3>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
        </div>

        <p className="relative mt-3 text-sm text-muted-foreground">{m.description}</p>

        <div className="relative mt-4 flex items-center gap-2 text-xs">
          <Badge variant="outline" className={cn("rounded-full", diffColor[m.difficulty])}>{m.difficulty}</Badge>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" /> {m.time}
          </span>
        </div>

        <div className="relative mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{m.progress}%</span>
          </div>
          <Progress value={m.progress} className="h-1.5" />
        </div>
      </motion.article>
    </Link>
  );
}
