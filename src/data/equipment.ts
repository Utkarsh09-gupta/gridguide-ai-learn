import type { LucideIcon } from "lucide-react";
import {
  Cpu, CircuitBoard, Gauge, Activity, ShieldAlert, Power,
  BatteryCharging, Battery, Router, Network, ShieldCheck, Waypoints,
} from "lucide-react";

export interface Equipment {
  id: string;
  name: string;
  full: string;
  tag: string;
  description: string;
  icon: LucideIcon;
}

export const equipment: Equipment[] = [
  { id: "rtu", name: "RTU", full: "Remote Terminal Unit", tag: "SCADA", description: "Field device that acquires data from substation and communicates to control centre.", icon: Cpu },
  { id: "ied", name: "IED", full: "Intelligent Electronic Device", tag: "Automation", description: "Microprocessor-based controller handling protection, control and monitoring.", icon: CircuitBoard },
  { id: "ct", name: "CT", full: "Current Transformer", tag: "Measurement", description: "Steps down primary current for metering and protection.", icon: Gauge },
  { id: "pt", name: "PT", full: "Potential Transformer", tag: "Measurement", description: "Steps down primary voltage for metering and protection.", icon: Activity },
  { id: "relay", name: "Relay", full: "Protective Relay", tag: "Protection", description: "Detects faults and issues trip commands to breakers.", icon: ShieldAlert },
  { id: "cb", name: "Circuit Breaker", full: "Circuit Breaker", tag: "Switching", description: "Interrupts fault current and isolates faulty section.", icon: Power },
  { id: "ups", name: "UPS", full: "Uninterruptible Power Supply", tag: "Aux Supply", description: "Provides clean, backed-up AC/DC power to critical loads.", icon: BatteryCharging },
  { id: "battery-bank", name: "Battery Bank", full: "Station Battery Bank", tag: "DC Supply", description: "Backup DC source for protection, control and comms.", icon: Battery },
  { id: "router", name: "Router", full: "Router", tag: "Comms", description: "Routes IP traffic between substation LANs and WAN.", icon: Router },
  { id: "switch", name: "Switch", full: "Ethernet Switch", tag: "Comms", description: "Managed switch for station and process bus networks.", icon: Network },
  { id: "firewall", name: "Firewall", full: "Firewall", tag: "OT Security", description: "Filters and segments OT traffic per IEC 62443 zones.", icon: ShieldCheck },
  { id: "otdr", name: "OTDR", full: "Optical Time-Domain Reflectometer", tag: "Fiber", description: "Characterizes optical fibers, faults, splices and losses.", icon: Waypoints },
];
