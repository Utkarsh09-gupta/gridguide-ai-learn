import { db } from "./client";
import { users, modules, equipment, userProgress, quizzes, questions, topics } from "./schema";
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
    { id: "ems", index: 5, title: "Energy Management System", description: "State Estimation, AGC and power dispatch applications.", difficulty: "Advanced", time: "7h", accent: "from-electric to-success" },
    { id: "power-supply", index: 6, title: "Power Supply", description: "UPS, DCDB, ACDB and auxiliary supply schemes.", difficulty: "Beginner", time: "3h", accent: "from-success to-cyan" },
    { id: "protection", index: 7, title: "Protection System", description: "Relays, CT/PT, distance & differential protection.", difficulty: "Advanced", time: "6h", accent: "from-electric to-cyan" },
    { id: "substation-automation", index: 8, title: "Substation Automation", description: "IEC 61850, bay controllers, station bus and process bus.", difficulty: "Advanced", time: "5h", accent: "from-cyan to-electric" },
    { id: "pmu-wams", index: 9, title: "PMU & WAMS", description: "Synchrophasors, PDCs and wide-area monitoring.", difficulty: "Advanced", time: "4h", accent: "from-electric to-cyan" },
    { id: "grid-operation", index: 10, title: "Grid Operation & Scheduling", description: "Scheduling, DSM, frequency & voltage control.", difficulty: "Intermediate", time: "5h", accent: "from-success to-electric" },
  ];

  for (const m of modulesList) {
    await db.insert(modules).values(m).onConflictDoNothing();
  }

  // 3. Seed Equipment
  const equipmentList = [
    { id: "rtu", name: "RTU", full: "Remote Terminal Unit", tag: "SCADA", description: "Field device that acquires data from substation and communicates to control centre.", imageUrl: "/images/equipment/rtu.png" },
    { id: "ied", name: "IED", full: "Intelligent Electronic Device", tag: "Automation", description: "Microprocessor-based controller handling protection, control and monitoring.", imageUrl: "/images/equipment/ied.png" },
    { id: "ct", name: "CT", full: "Current Transformer", tag: "Measurement", description: "Steps down primary current for metering and protection.", imageUrl: "/images/equipment/ct.png" },
    { id: "pt", name: "PT", full: "Potential Transformer", tag: "Measurement", description: "Steps down primary voltage for metering and protection.", imageUrl: "/images/equipment/pt.png" },
    { id: "relay", name: "Relay", full: "Protective Relay", tag: "Protection", description: "Detects faults and issues trip commands to breakers.", imageUrl: "/images/equipment/relay.png" },
    { id: "cb", name: "Circuit Breaker", full: "Circuit Breaker", tag: "Switching", description: "Interrupts fault current and isolates faulty section.", imageUrl: "/images/equipment/cb.png" },
    { id: "ups", name: "UPS", full: "Uninterruptible Power Supply", tag: "Aux Supply", description: "Provides clean, backed-up AC/DC power to critical loads.", imageUrl: "/images/equipment/ups.png" },
    { id: "battery-bank", name: "Battery Bank", full: "Station Battery Bank", tag: "DC Supply", description: "Backup DC source for protection, control and comms.", imageUrl: "/images/equipment/battery-bank.png" },
    { id: "router", name: "Router", full: "Router", tag: "Comms", description: "Routes IP traffic between substation LANs and WAN.", imageUrl: "/images/equipment/router.png" },
    { id: "switch", name: "Switch", full: "Ethernet Switch", tag: "Comms", description: "Managed switch for station and process bus networks.", imageUrl: "/images/equipment/switch.png" },
    { id: "firewall", name: "Firewall", full: "Firewall", tag: "OT Security", description: "Filters and segments OT traffic per IEC 62443 zones.", imageUrl: "/images/equipment/firewall.png" },
    { id: "otdr", name: "OTDR", full: "Optical Time-Domain Reflectometer", tag: "Fiber", description: "Characterizes optical fibers, faults, splices and losses.", imageUrl: "/images/equipment/otdr.png" },
  ];

  for (const eq of equipmentList) {
    await db.insert(equipment).values(eq).onConflictDoUpdate({
      target: equipment.id,
      set: { imageUrl: eq.imageUrl }
    });
  }

  // 4. Seed User Progress
  const progressList = [
    { userId, moduleId: "power-fundamentals", progress: 66, completedTopics: '["power-fundamentals-1", "power-fundamentals-2"]', updatedAt: now },
    { userId, moduleId: "sldc-dispatch", progress: 50, completedTopics: '["sldc-dispatch-1"]', updatedAt: now },
    { userId, moduleId: "scada", progress: 66, completedTopics: '["scada-1", "scada-2"]', updatedAt: now },
    { userId, moduleId: "communication", progress: 33, completedTopics: '["communication-1"]', updatedAt: now },
    { userId, moduleId: "ems", progress: 0, completedTopics: '[]', updatedAt: now },
    { userId, moduleId: "power-supply", progress: 0, completedTopics: '[]', updatedAt: now },
    { userId, moduleId: "protection", progress: 0, completedTopics: '[]', updatedAt: now },
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

  // 7. Seed Topics / Lessons
  const topicsList = [
    // Module 1
    {
      id: "power-fundamentals-1",
      moduleId: "power-fundamentals",
      index: 1,
      title: "Grid Architecture Fundamentals",
      timeToRead: "8 mins",
      content: `### Power Grid Structure

An electrical power grid is a complex, interconnected network designed to deliver electricity from producers to consumers. It is logically divided into three primary segments:

1. **Generation**:
   Power is generated at high capacities in power stations (Thermal, Hydro, Nuclear, or large-scale Wind/Solar farms). Typical generation voltages range between **11 kV and 25 kV** to balance generator stator insulation limits and current-carrying requirements.

2. **Transmission System**:
   To minimize resistive losses ($I^2R$) over long distances, the voltage is stepped up using step-up transformers to high voltages (e.g., **132 kV, 220 kV, 400 kV, 765 kV**). High Voltage (HV) and Extra High Voltage (EHV) transmission lines carry bulk power across provinces and regions.
   
3. **Distribution System**:
   At load centers, the voltage is stepped down at sub-stations to sub-transmission levels (33 kV or 66 kV) and then to primary distribution levels (**11 kV**). Finally, distribution transformers step it down to the service voltage (e.g., **415 V three-phase / 240 V single-phase**) for residential and commercial consumption.

\`\`\`
[Gen: 11kV] ──> [Step-Up Trans: 400kV] ──> (Transmission Lines) ──> [Substation: 132kV/11kV] ──> [Dist. Trans: 415V/240V]
\`\`\`
`
    },
    {
      id: "power-fundamentals-2",
      moduleId: "power-fundamentals",
      index: 2,
      title: "AC vs DC Transmission Systems",
      timeToRead: "10 mins",
      content: `### High Voltage AC (HVAC) vs High Voltage DC (HVDC)

The choice between AC and DC transmission involves tradeoffs in engineering complexity, distance, control, and station cost.

#### HVAC (High Voltage AC)
HVAC is the dominant transmission standard globally. 
* **Advantages**: Simple voltage stepping using passive transformer components, standardized switchgear, and ease of tap-offs at intermediate points.
* **Limitations**: AC lines suffer from inductive and capacitive reactance. Over long distances, line charging currents consume the line's thermal capacity, and grid synchronization must be maintained between the transmitting and receiving ends.

#### HVDC (High Voltage DC)
HVDC transmission converter stations convert AC to DC for transmission and back to AC at the receiving end.
* **Advantages**: No reactive power limits, higher power capacity per conductor, no skin effect, and the ability to asynchronously link two grids running at different frequencies or phase angles.
* **Break-even Distance**: Because converter stations are highly expensive, HVDC is typically only economically viable for overhead lines exceeding **600 to 800 km**, or submarine cables longer than **50 km**.
`
    },
    {
      id: "power-fundamentals-3",
      moduleId: "power-fundamentals",
      index: 3,
      title: "Active, Reactive & Apparent Power",
      timeToRead: "8 mins",
      content: `### Components of AC Electrical Power

In alternating current (AC) networks, voltage and current waveforms are not always in phase, leading to three types of power:

1. **Active Power (P)**:
   Also known as real power, measured in **Watts (W)** or **Megawatts (MW)**. This is the power that does useful work (e.g., heating, mechanical torque).
   $$P = V I \\cos \\theta$$

2. **Reactive Power (Q)**:
   Measured in **Volt-Amperes Reactive (VAR)** or **Megavars (MVAR)**. This power oscillates between the source and inductive/capacitive elements. It is required to establish magnetic fields in motor windings and transformers, but performs no useful work.
   $$Q = V I \\sin \\theta$$

3. **Apparent Power (S)**:
   Measured in **Volt-Amperes (VA)** or **Megavolt-Amperes (MVA)**. It is the vector combination of active and reactive power. Transmission lines and transformers are rated in MVA.
   $$S = V I = \\sqrt{P^2 + Q^2}$$

#### Power Factor (PF)
The ratio of Active Power to Apparent Power ($\\cos \\theta$). A low PF (due to inductive loads) draws higher current for the same work, increasing grid line losses. SLDCs monitor power factor and dispatch capacitor banks or STATCOMs to maintain voltage profiles.
`
    },

    // Module 2
    {
      id: "sldc-dispatch-1",
      moduleId: "sldc-dispatch",
      index: 1,
      title: "Grid Control Center Hierarchy",
      timeToRead: "8 mins",
      content: `### Hierarchy of Load Dispatch Centers

To manage secure, real-time power system operations, control centers are organized in a strict hierarchical tier:

1. **NLDC (National Load Dispatch Centre)**:
   The apex body responsible for scheduling inter-regional power transfers, coordinating the national grid frequency, and ensuring security across regional boundaries.
   
2. **RLDC (Regional Load Dispatch Centre)**:
   Manages the regional power grid. In India, there are 5 regional centers (Northern, Southern, Eastern, Western, North-Eastern). They coordinate interstate scheduling, monitor regional parameters, and act as regional authority.
   
3. **SLDC (State Load Dispatch Centre)**:
   The nerve center of state grid operations (like UPSLDC in Uttar Pradesh). Responsible for:
   * Real-time monitoring of state generation and internal transmission lines.
   * State load forecasting and scheduling.
   * Merit order dispatching of state generators.
   * Maintaining system frequency within operating bands by monitoring drawl from the central grid.
`
    },
    {
      id: "sldc-dispatch-2",
      moduleId: "sldc-dispatch",
      index: 2,
      title: "Load Scheduling & Generation Dispatch",
      timeToRead: "10 mins",
      content: `### Day-Ahead Scheduling & Merit Order

Load dispatch centers perform generation scheduling and dispatch based on economic principles and security constraints:

#### Day-Ahead Scheduling
1. **Demand Forecasting**: SLDCs forecast state demand block-by-block (96 blocks of 15 minutes each) based on historical load, weather forecasts, and industrial calendars.
2. **Declaration of Capability (DC)**: Power plants declare their available capacity for each block of the next day.
3. **Requisitioning**: Discoms requisition power based on their share of central/state plants and bilateral contracts.

#### Economic Merit Order Dispatch
Generators are sorted in ascending order of their variable costs (fuel cost per unit).
* SLDCs dispatch generators starting from the cheapest (e.g., base-load nuclear and run-of-river hydro) to progressively more expensive plants (coal thermal, gas turbines) until the demand is met.
* Must-run plants (like renewable solar/wind) are dispatched first, regardless of cost.
`
    },

    // Module 3
    {
      id: "scada-1",
      moduleId: "scada",
      index: 1,
      title: "SCADA Master Station Architecture",
      timeToRead: "12 mins",
      content: `### SCADA Control Center Architecture

The Supervisory Control And Data Acquisition (SCADA) Master Station is the central system that gathers telemetry data from substations and executes supervisory controls.

#### Key Components:
1. **Front-End Processors (FEPs)**:
   Dedicated servers that handle communication protocols (like IEC 104, DNP3). They poll Remote Terminal Units (RTUs), unpack data packets, stamp timestamps, and forward clean data to the main SCADA servers.
   
2. **SCADA Real-Time Servers**:
   Maintain the real-time database (in-memory). They calculate alarms, limit checks, and distribute live values to operator HMIs. SCADA servers operate in a **Hot-Standby Redundant** configuration.
   
3. **HMI (Human-Machine Interface) Consoles**:
   Graphic terminals allowing dispatchers to view single-line diagrams, voltage charts, alarms, and click breaker icons to issue open/close commands.
   
4. **Historical Database**:
   Saves historical telemetry values and event logs for post-fault analysis and planning studies.
`
    },
    {
      id: "scada-2",
      moduleId: "scada",
      index: 2,
      title: "Remote Terminal Units (RTUs) & IEDs",
      timeToRead: "10 mins",
      content: `### Substation Telemetry Hardware

Substations use field devices to interface high-voltage physical equipment with the master station communication lines:

#### Remote Terminal Unit (RTU)
A central microprocessor-based device installed in the control room.
* **Input Modules**: Digital inputs (breaker/isolator positions, alarm contacts) and Analog inputs (MW, MVAR, voltages via transducers).
* **Output Modules**: Digital outputs (relay contacts to trip/close breakers) and Analog outputs.
* **Features**: Precision GPS clock synchronization (IRIG-B or NTP) for Sequence-of-Event (SOE) recording with 1-millisecond resolution.

#### Intelligent Electronic Devices (IEDs)
Modern substation components (like numerical relays, bay controllers, energy meters).
* Unlike passive RTU terminal cards, IEDs perform local processing, high-speed protective calculations, and communicate directly using ethernet protocols.
* RTUs often act as **data concentrators**, polling substation IEDs over serial or LAN, consolidating the data, and forwarding it to the SLDC.
`
    },
    {
      id: "scada-3",
      moduleId: "scada",
      index: 3,
      title: "Telemetry Polling & Scanning Cycles",
      timeToRead: "9 mins",
      content: `### Telemetry Acquisition & Polling Cycles

SCADA masters gather data from substations using dynamic scanning schemes to optimize bandwidth and speed:

1. **Cyclic Polling**:
   The Front-End Processor regularly sends request packets to RTUs.
   * **Analog Scanning**: Voltages, currents, and load flows are scanned every **2 to 10 seconds** to maintain a fresh grid state without overloading the channel.
   * **Status Scanning**: Digital statuses (breaker positions) are scanned periodically (every 10-30 seconds) as a backup integrity check.

2. **Report by Exception (RBE) / Change-of-State**:
   Instead of continuously transmitting unchanged data, the RTU buffers digital events and analog swings.
   * When a breaker trips, the RTU immediately transmits the change-of-state packet without waiting for a poll.
   * For analog values, the RTU only transmits the value if it exceeds a predefined **deadband** (e.g., a change $>0.5\\%$ in frequency).
`
    },

    // Module 4
    {
      id: "communication-1",
      moduleId: "communication",
      index: 1,
      title: "Power Line Carrier Communication (PLCC)",
      timeToRead: "10 mins",
      content: `### Power Line Carrier Communication (PLCC)

PLCC is a classical, highly robust utility communication system that uses existing high-voltage transmission lines to transmit voice, telemetry, and protection signals.

#### Key Components:
1. **Coupling Capacitor (CC)**:
   Presents a high impedance to power frequency (50 Hz) and low impedance to high-frequency carrier signals (50 kHz to 500 kHz). It connects the carrier equipment to the high-voltage line.
   
2. **Line Trap / Wave Trap**:
   An LC parallel resonant circuit tuned to block high-frequency carrier signals from entering substation busbars and shunt them onto the transmission line, while letting 50 Hz power pass through unaffected.
   
3. **PLCC Terminal / Modems**:
   Modulates data onto radio frequencies.
   
4. **Protective Coupler**:
   Interfaces protection relays. When a fault occurs, it transmits an instantaneous carrier trip signal (direct trip/permissive trip) to the remote end breaker in **under 15 milliseconds**.
`
    },
    {
      id: "communication-2",
      moduleId: "communication",
      index: 2,
      title: "OPGW (Optical Fiber Ground Wire)",
      timeToRead: "8 mins",
      content: `### Optical Fiber Ground Wire (OPGW)

Modern power grid communications have shifted heavily from PLC carrier bands to high-bandwidth fiber optic networks.

#### What is OPGW?
OPGW replaces the conventional earth wire (shield wire) at the very top of transmission towers.
* **Dual Functionality**: It shields transmission phase conductors from direct lightning strikes, and houses optical fibers internally for communications.
* **Benefits**: 
  * Massive bandwidth capacity compared to PLCC (Gigabits vs Kilobits).
  * Immune to electromagnetic interference (EMI) and corona noise.
  * No wave traps or coupling capacitors needed.
  * Allows SLDCs to implement high-speed Ethernet routing (MPLS-TP) for EMS, PMUs, and control room VoIP communications.
`
    },
    {
      id: "communication-3",
      moduleId: "communication",
      index: 3,
      title: "IEC 60870-5-104 & DNP3 Protocols",
      timeToRead: "12 mins",
      content: `### Tele-control Protocols: IEC 104 vs DNP3

SCADA systems utilize specialized open industrial standards to communicate between RTUs and Master Stations over IP networks.

#### IEC 60870-5-104 (IEC 104)
The dominant standard in European and Asian power grids.
* **Transport**: Runs over TCP/IP, using dedicated port **2404**.
* **Structure**: Uses Application Service Data Units (ASDUs) containing:
  * **Type Identifier**: Single point status, double point status (for breakers), measured value (normalized, scaled, or short float).
  * **Cause of Transmission (COT)**: Why the packet was sent (spontaneous, cyclic, interrogation).
  * **Information Object Address (IOA)**: The specific point identifier (database index) mapping to a physical terminal.

#### DNP3 (Distributed Network Protocol)
Widely used in North America.
* Uses TCP/UDP port **20000**.
* **Key Features**: Highly structured data classes (Class 0 for static state, Class 1-3 for event priorities). Supports native data fragmentation, encryption, and unsolicited reporting (RBE).
`
    },

    // Module 5
    {
      id: "ems-1",
      moduleId: "ems",
      index: 1,
      title: "State Estimation in Power Systems",
      timeToRead: "10 mins",
      content: `### State Estimation (SE)

State Estimation is the mathematical core of the Energy Management System (EMS) that filters noisy or incomplete telemetry readings to compute the most likely physical state of the grid.

* **Why it is needed**: Transducer failures, communication dropouts, and measurement noise mean raw SCADA flows often violate Kirchhoff's laws.
* **Algorithm**: Uses the **Weighted Least Squares (WLS)** method to estimate complex bus voltages (magnitude and phase angle).
* **Gross Error Detection**: Compares measurement residuals to flag bad data (e.g. a failed breaker status indicating 'open' when line flows are 300 MW).
`
    },
    {
      id: "ems-2",
      moduleId: "ems",
      index: 2,
      title: "Automatic Generation Control (AGC)",
      timeToRead: "10 mins",
      content: `### Automatic Generation Control (AGC)

AGC is a closed-loop control system that dynamically adjusts generator outputs to maintain grid frequency and scheduled tie-line flows.

#### Area Control Error (ACE)
The controller monitors the Area Control Error, defined as:
$$ACE = \\Delta P_{net} + B \\cdot \\Delta f$$
Where:
* $\\Delta P_{net}$ is the net tie-line power flow deviation.
* $\\Delta f$ is the frequency deviation.
* $B$ is the frequency bias coefficient.

If frequency falls or import exceeds schedule, ACE becomes negative, prompting AGC to issue digital pulse raise commands directly to the governors of active state generators.
`
    },

    // Module 6
    {
      id: "power-supply-1",
      moduleId: "power-supply",
      index: 1,
      title: "Station Batteries & DC Systems",
      timeToRead: "8 mins",
      content: `### Substation DC Auxiliary Supplies

Substation protection and control equipment cannot rely on AC grid power, as a grid blackout would render safety systems inoperative.

* **DC Voltage Levels**: Standard substation DC battery banks operate at **110 V DC** or **220 V DC** for breaker tripping circuits, and **48 V DC** for telecommunication gear.
* **Chargers**: Operating schemes use redundant float-cum-boost chargers (FCBC). In float mode, the charger feeds the load and keeps the batteries charged. In boost mode, it recharges fully depleted banks.
`
    },
    {
      id: "power-supply-2",
      moduleId: "power-supply",
      index: 2,
      title: "ACDB and DCDB Panels",
      timeToRead: "8 mins",
      content: `### AC and DC Distribution Boards

* **ACDB (AC Distribution Board)**:
  Distributes AC auxiliary supplies derived from local station transformers. Feeds non-critical utility loads like transformer cooling fans, tape changers, control room lighting, and battery chargers.
* **DCDB (DC Distribution Board)**:
  Distributes DC power directly from the battery banks to numeric protection relays, circuit breaker trip coils, emergency lighting, and RTUs. DC circuits are kept floating (unearthed) and continuously monitored by leakage detectors.
`
    },

    // Module 7
    {
      id: "protection-1",
      moduleId: "protection",
      index: 1,
      title: "Protective Relaying Principles",
      timeToRead: "12 mins",
      content: `### Protection Relays

Protective relays monitor electrical parameters and trigger circuit breakers to isolate faulted components instantly.

#### Types of Protection:
1. **Overcurrent & Earth Fault**:
   Simplest type; trips when currents exceed threshold settings. Used mainly in radial distribution lines.
2. **Distance Protection (ANSI 21)**:
   Measures voltage-to-current ratio ($Z = V/I$) to compute electrical impedance. Used to protect high-voltage transmission lines by defining zones (Zone 1 protects $80\\%$, Zone 2 extends past the remote bus).
3. **Differential Protection (ANSI 87)**:
   Compares incoming current to outgoing current ($I_{in} - I_{out} = 0$). Any difference indicates an internal fault. Used for transformers and busbars.
`
    },
    {
      id: "protection-2",
      moduleId: "protection",
      index: 2,
      title: "Instrument Transformers (CT & PT)",
      timeToRead: "9 mins",
      content: `### Current & Potential Transformers

Protection relays cannot interface directly with high-voltage lines. They rely on instrument transformers to step down parameters.

* **Current Transformers (CT)**:
  Connected in series with the line. Steps down currents to standard secondary limits (typically **1 A** or **5 A**). Must never be open-circuited while primary is energized due to high induction hazards.
* **Potential Transformers (PT)**:
  Connected in parallel (line-to-ground). Steps down primary phase voltage to standard secondary levels (typically **110 V AC** line-to-line).
`
    },

    // Module 8
    {
      id: "substation-automation-1",
      moduleId: "substation-automation",
      index: 1,
      title: "IEC 61850 Substation Standard",
      timeToRead: "12 mins",
      content: `### IEC 61850 Standardization

IEC 61850 is the global open standard for communication and configuration within electrical substations.

* **Logical Nodes**: Equipment behavior is modeled using object-oriented Logical Nodes (e.g., **XCBR** for circuit breakers, **PTOC** for time-overcurrent protection).
* **Engineering Files**: Configuration is handled via XML-based files:
  * **SSD (System Specification Description)**: Substation topology.
  * **CID (Configured IED Description)**: Specific configuration for a relay.
  * **SCD (Substation Configuration Description)**: Complete station engineering file.
`
    },
    {
      id: "substation-automation-2",
      moduleId: "substation-automation",
      index: 2,
      title: "Station Bus, Process Bus & GOOSE",
      timeToRead: "10 mins",
      content: `### Substation Network Architecture

IEC 61850 divides the substation communication network into two distinct levels:

#### Station Bus
Connects bay level IEDs (relays) to the station computer (HMI, gateway). It carries monitoring, alarm, and control packets.

#### Process Bus
Replaces hundreds of hardwired copper cables from yard primary switchgear with optical fiber networks.
* **Sampled Values (SV)**: Merging units digitize analog waveforms from CTs/PTs and stream them at 4000/4800 Hz.
* **GOOSE (Generic Object Oriented Substation Events)**: High-speed peer-to-peer multicast messages used for inter-relay interlocking and breaker tripping. GOOSE messages must transmit in **under 3 milliseconds**.
`
    },

    // Module 9
    {
      id: "pmu-wams-1",
      moduleId: "pmu-wams",
      index: 1,
      title: "Synchrophasor Measurement Basics",
      timeToRead: "10 mins",
      content: `### Phasor Measurement Units (PMUs)

PMUs are advanced grid measurement sensors that calculate high-speed voltage and current phasors synchronized to absolute GPS time.

* **Phasor Representation**: Represents AC waves as magnitude and phase angle.
* **GPS Sync**: Using a highly accurate GPS time pulse (1 microsecond accuracy), PMUs across the country tag measurements.
* **Reporting Rates**: Traditional SCADA scans values every 2-10 seconds. PMUs report measurements **25 to 50 times per second**, capturing dynamic grid oscillations and transient swings.
`
    },
    {
      id: "pmu-wams-2",
      moduleId: "pmu-wams",
      index: 2,
      title: "Wide-Area Monitoring Systems (WAMS)",
      timeToRead: "10 mins",
      content: `### Wide-Area Monitoring Systems (WAMS)

WAMS utilizes distributed PMU sensors and centralized data aggregators to monitor the grid's dynamic stability.

#### Key Functions:
* **Phasor Data Concentrators (PDCs)**:
  Gather synchrophasor packets from local PMUs, align them by their GPS timestamps, filter duplicates, and forward the composite stream to the SLDC/RLDC.
* **Angular Separation**:
  Monitors phase angle differences between distant nodes (e.g., North grid vs South grid). A high angular separation indicates heavy line loading and risk of system instability or tripping.
`
    },

    // Module 10
    {
      id: "grid-operation-1",
      moduleId: "grid-operation",
      index: 1,
      title: "Grid Code & Operating Margins",
      timeToRead: "10 mins",
      content: `### Grid Code Regulations

The Grid Code (such as IEGC in India) defines the technical rules, boundaries, and responsibilities for all power utilities operating on the grid.

* **Frequency Band**: The grid is designed to run close to **50.00 Hz**. The allowable operating frequency band is narrow (typically **49.90 Hz to 50.05 Hz**).
* **Spinning Reserves**: Generators must keep a portion of their capacity unloaded and synchronized to react immediately to frequency drops (primary and secondary response).
`
    },
    {
      id: "grid-operation-2",
      moduleId: "grid-operation",
      index: 2,
      title: "Load Shedding & Black Start",
      timeToRead: "10 mins",
      content: `### Grid Contingency & Restoration

#### Under-Frequency Load Shedding (UFLS)
If a major generator trips, grid frequency falls rapidly. If it drops below critical triggers (e.g., 49.2 Hz), automatic relays trip pre-selected radial feeders to shed load, matching demand to remaining generation and saving the grid from a total blackout.

#### Black Start Restoration
In the event of a total grid collapse:
1. **Black Start Generator**: Gas turbines or hydro units that can boot up using local diesel generators without drawing outside grid power.
2. **Charging the Line**: Re-energize critical transmission lines slowly.
3. **Synchronization**: Progressively synch thermal stations and load centers block-by-block under SLDC dispatch commands.
`
    }
  ];

  for (const t of topicsList) {
    await db.insert(topics).values(t).onConflictDoNothing();
  }

  console.log("Database seeded successfully!");
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
