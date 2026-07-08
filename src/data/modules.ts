import type { LucideIcon } from "lucide-react";
import {
  Zap, Radio, Monitor, Wifi, Cpu, BatteryCharging,
  ShieldCheck, Building2, Activity, CalendarClock,
} from "lucide-react";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Module {
  id: string;
  index: number;
  title: string;
  description: string;
  icon: LucideIcon;
  difficulty: Difficulty;
  time: string;
  progress: number;
  accent: string;
}

export const modules: Module[] = [
  { id: "power-fundamentals", index: 1, title: "Power System Fundamentals", description: "Generation, transmission, distribution and grid basics.", icon: Zap, difficulty: "Beginner", time: "4h", progress: 82, accent: "from-electric to-cyan" },
  { id: "sldc-dispatch", index: 2, title: "SLDC & Load Dispatch", description: "How State/Regional load dispatch centres balance the grid.", icon: CalendarClock, difficulty: "Beginner", time: "3h", progress: 60, accent: "from-cyan to-success" },
  { id: "scada", index: 3, title: "SCADA", description: "Supervisory Control And Data Acquisition end-to-end.", icon: Monitor, difficulty: "Intermediate", time: "6h", progress: 65, accent: "from-electric to-cyan" },
  { id: "communication", index: 4, title: "Communication Systems", description: "PLCC, OPGW, MPLS, IEC 60870-5-101/104 protocols.", icon: Wifi, difficulty: "Intermediate", time: "5h", progress: 30, accent: "from-cyan to-electric" },
  { id: "ems", index: 5, title: "Energy Management System", description: "SE, OPF, AGC and applications on top of SCADA.", icon: Cpu, difficulty: "Advanced", time: "7h", progress: 20, accent: "from-electric to-success" },
  { id: "power-supply", index: 6, title: "Power Supply", description: "UPS, DCDB, ACDB and auxiliary supply schemes.", icon: BatteryCharging, difficulty: "Beginner", time: "3h", progress: 45, accent: "from-success to-cyan" },
  { id: "protection", index: 7, title: "Protection System", description: "Relays, CT/PT, distance & differential protection.", icon: ShieldCheck, difficulty: "Advanced", time: "6h", progress: 10, accent: "from-electric to-cyan" },
  { id: "substation-automation", index: 8, title: "Substation Automation", description: "IEC 61850, bay controllers, station bus.", icon: Building2, difficulty: "Advanced", time: "5h", progress: 0, accent: "from-cyan to-electric" },
  { id: "pmu-wams", index: 9, title: "PMU & WAMS", description: "Synchrophasors, PDCs and wide-area monitoring.", icon: Activity, difficulty: "Advanced", time: "4h", progress: 0, accent: "from-electric to-cyan" },
  { id: "grid-operation", index: 10, title: "Grid Operation & Scheduling", description: "Scheduling, DSM, frequency & voltage control.", icon: Radio, difficulty: "Intermediate", time: "5h", progress: 0, accent: "from-success to-electric" },
];
