import { db } from "./client";
import { users, modules, equipment, userProgress, quizzes, questions } from "./schema";
import { hashPassword } from "../lib/auth";

async function main() {
  console.log("Seeding database...");

  // 1. Seed default user
  const userId = "aarav";
  const now = Date.now();
  await db.insert(users).values({
    id: userId,
    name: "Aarav Kumar",
    email: "aarav.kumar@upsldc.in",
    passwordHash: hashPassword("testing"),
    organization: "UPSLDC",
    streakCount: 14,
    lastActiveAt: now,
    createdAt: now,
  }).onConflictDoNothing();

  // 2. Seed Modules
  const modulesList = [
    { id: "power-fundamentals", index: 1, title: "Power System Fundamentals", description: "Generation, transmission, distribution and grid basics.", difficulty: "Beginner", time: "4h", accent: "from-electric to-cyan" },
    { id: "sldc-dispatch", index: 2, title: "SLDC & Load Dispatch", description: "How State/Regional load dispatch centres balance the grid.", difficulty: "Beginner", time: "3h", accent: "from-cyan to-success" },
    { id: "scada", index: 3, title: "SCADA", description: "Supervisory Control And Data Acquisition end-to-end.", difficulty: "Intermediate", time: "6h", accent: "from-electric to-cyan" },
    { id: "communication", index: 4, title: "Communication Systems", description: "PLCC, OPGW, MPLS, IEC 60870-5-101/104 protocols.", difficulty: "Intermediate", time: "5h", accent: "from-cyan to-electric" },
    { id: "ems", index: 5, title: "Energy Management System", description: "SE, OPF, AGC and applications on top of SCADA.", difficulty: "Advanced", time: "7h", accent: "from-electric to-success" },
    { id: "power-supply", index: 6, title: "Power Supply", description: "UPS, DCDB, ACDB and auxiliary supply schemes.", difficulty: "Beginner", time: "3h", accent: "from-success to-cyan" },
    { id: "protection", index: 7, title: "Protection System", description: "Relays, CT/PT, distance & differential protection.", difficulty: "Advanced", time: "6h", accent: "from-electric to-cyan" },
    { id: "substation-automation", index: 8, title: "Substation Automation", description: "IEC 61850, bay controllers, station bus.", difficulty: "Advanced", time: "5h", accent: "from-cyan to-electric" },
    { id: "pmu-wams", index: 9, title: "PMU & WAMS", description: "Synchrophasors, PDCs and wide-area monitoring.", difficulty: "Advanced", time: "4h", accent: "from-electric to-cyan" },
    { id: "grid-operation", index: 10, title: "Grid Operation & Scheduling", description: "Scheduling, DSM, frequency & voltage control.", difficulty: "Intermediate", time: "5h", accent: "from-success to-electric" },
  ];

  for (const m of modulesList) {
    await db.insert(modules).values(m).onConflictDoNothing();
  }

  // 3. Seed Equipment
  const equipmentList = [
    { id: "rtu", name: "RTU", full: "Remote Terminal Unit", tag: "SCADA", description: "Field device that acquires data from substation and communicates to control centre." },
    { id: "ied", name: "IED", full: "Intelligent Electronic Device", tag: "Automation", description: "Microprocessor-based controller handling protection, control and monitoring." },
    { id: "ct", name: "CT", full: "Current Transformer", tag: "Measurement", description: "Steps down primary current for metering and protection." },
    { id: "pt", name: "PT", full: "Potential Transformer", tag: "Measurement", description: "Steps down primary voltage for metering and protection." },
    { id: "relay", name: "Relay", full: "Protective Relay", tag: "Protection", description: "Detects faults and issues trip commands to breakers." },
    { id: "cb", name: "Circuit Breaker", full: "Circuit Breaker", tag: "Switching", description: "Interrupts fault current and isolates faulty section." },
    { id: "ups", name: "UPS", full: "Uninterruptible Power Supply", tag: "Aux Supply", description: "Provides clean, backed-up AC/DC power to critical loads." },
    { id: "battery-bank", name: "Battery Bank", full: "Station Battery Bank", tag: "DC Supply", description: "Backup DC source for protection, control and comms." },
    { id: "router", name: "Router", full: "Router", tag: "Comms", description: "Routes IP traffic between substation LANs and WAN." },
    { id: "switch", name: "Switch", full: "Ethernet Switch", tag: "Comms", description: "Managed switch for station and process bus networks." },
    { id: "firewall", name: "Firewall", full: "Firewall", tag: "OT Security", description: "Filters and segments OT traffic per IEC 62443 zones." },
    { id: "otdr", name: "OTDR", full: "Optical Time-Domain Reflectometer", tag: "Fiber", description: "Characterizes optical fibers, faults, splices and losses." },
  ];

  for (const eq of equipmentList) {
    await db.insert(equipment).values(eq).onConflictDoNothing();
  }

  // 4. Seed User Progress
  const progressList = [
    { userId, moduleId: "power-fundamentals", progress: 82, completedTopics: '["grid-intro", "transmission-basics"]', updatedAt: now },
    { userId, moduleId: "sldc-dispatch", progress: 60, completedTopics: '["load-balancing", "ldc-hierarchy"]', updatedAt: now },
    { userId, moduleId: "scada", progress: 65, completedTopics: '["scada-intro", "rtu-basics"]', updatedAt: now },
    { userId, moduleId: "communication", progress: 30, completedTopics: '["protocol-intro"]', updatedAt: now },
    { userId, moduleId: "ems", progress: 20, completedTopics: '["agc-basics"]', updatedAt: now },
    { userId, moduleId: "power-supply", progress: 45, completedTopics: '["ups-basics"]', updatedAt: now },
    { userId, moduleId: "protection", progress: 10, completedTopics: '["relay-intro"]', updatedAt: now },
    { userId, moduleId: "substation-automation", progress: 0, completedTopics: '[]', updatedAt: now },
    { userId, moduleId: "pmu-wams", progress: 0, completedTopics: '[]', updatedAt: now },
    { userId, moduleId: "grid-operation", progress: 0, completedTopics: '[]', updatedAt: now },
  ];

  for (const prog of progressList) {
    await db.insert(userProgress).values(prog).onConflictDoNothing();
  }

  // 5. Seed Quiz
  const quizId = "quick-quiz";
  await db.insert(quizzes).values({
    id: quizId,
    moduleId: "scada",
    title: "Quick Quiz",
    description: "A short 4-question set on grid & SCADA fundamentals.",
  }).onConflictDoNothing();

  // 6. Seed Quiz Questions
  const questionsList = [
    {
      id: "q1",
      quizId,
      questionText: "Which protocol is commonly used between SCADA master and RTU over TCP/IP?",
      options: JSON.stringify(["IEC 60870-5-101", "IEC 60870-5-104", "Modbus ASCII", "HART"]),
      correctAnswerIndex: 1,
    },
    {
      id: "q2",
      quizId,
      questionText: "The primary purpose of a PMU is to measure:",
      options: JSON.stringify(["Insulation resistance", "Synchrophasors", "Harmonic distortion only", "DC offset"]),
      correctAnswerIndex: 1,
    },
    {
      id: "q3",
      quizId,
      questionText: "AGC in an EMS primarily regulates:",
      options: JSON.stringify(["Voltage", "Frequency and tie-line flows", "Reactive power only", "Transformer tap"]),
      correctAnswerIndex: 1,
    },
    {
      id: "q4",
      quizId,
      questionText: "IEC 61850 is a standard for:",
      options: JSON.stringify(["Substation automation", "HVDC control", "PLCC modems", "Fire protection"]),
      correctAnswerIndex: 0,
    },
  ];

  for (const q of questionsList) {
    await db.insert(questions).values(q).onConflictDoNothing();
  }

  console.log("Database seeded successfully!");
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
