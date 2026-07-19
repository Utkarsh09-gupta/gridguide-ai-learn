import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import {
  Cpu, CircuitBoard, Gauge, Activity, ShieldAlert, Power,
  BatteryCharging, Battery, Router as RouterIcon, Network, ShieldCheck, Waypoints
} from "lucide-react";

export interface DbEquipment {
  id: string;
  name: string;
  full: string;
  tag: string;
  description: string;
  imageUrl?: string | null;
}

export function getEquipmentIcon(id: string) {
  const icons: Record<string, any> = {
    rtu: Cpu,
    ied: CircuitBoard,
    ct: Gauge,
    pt: Activity,
    relay: ShieldAlert,
    cb: Power,
    ups: BatteryCharging,
    "battery-bank": Battery,
    router: RouterIcon,
    switch: Network,
    firewall: ShieldCheck,
    otdr: Waypoints,
  };
  return icons[id] || Cpu;
}

export function EquipmentCard({ e, i = 0 }: { e: DbEquipment; i?: number }) {
  const Icon = getEquipmentIcon(e.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.2) }}
      className="gpu-layer h-full"
    >
      <Link
        to="/equipment/$id"
        params={{ id: e.id }}
        className="glass block rounded-2xl p-3 h-full group hover:border-electric/40 transition-colors overflow-hidden"
      >
        <div className="w-full h-32 rounded-xl overflow-hidden relative mb-3 bg-navy/60 border border-white/5">
          <img
            src={e.imageUrl || `/images/equipment/${e.id}.png`}
            alt={e.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 grid place-items-center w-8 h-8 rounded-lg bg-navy/80 backdrop-blur-md border border-white/10 text-cyan group-hover:text-electric transition-colors">
            <Icon className="w-4 h-4" />
          </div>
          <div className="absolute top-2 right-2 grid place-items-center w-7 h-7 rounded-lg bg-navy/80 backdrop-blur-md border border-white/10 text-muted-foreground group-hover:text-foreground transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-electric font-semibold">{e.tag}</div>
          <h3 className="font-bold text-sm text-foreground group-hover:text-cyan transition-colors mt-0.5">{e.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{e.full}</p>
        </div>
      </Link>
    </motion.div>
  );
}
