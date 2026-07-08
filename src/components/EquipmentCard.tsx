import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Equipment } from "@/data/equipment";

export function EquipmentCard({ e, i = 0 }: { e: Equipment; i?: number }) {
  const Icon = e.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: i * 0.03 }}
    >
      <Link
        to="/equipment/$id"
        params={{ id: e.id }}
        className="glass block rounded-2xl p-4 h-full group hover:border-electric/40 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="grid place-items-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-cyan group-hover:text-electric transition-colors">
            <Icon className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
        </div>
        <div className="mt-3">
          <div className="text-[11px] uppercase tracking-wider text-electric">{e.tag}</div>
          <h3 className="font-semibold text-base">{e.name}</h3>
          <p className="text-xs text-muted-foreground">{e.full}</p>
        </div>
      </Link>
    </motion.div>
  );
}
