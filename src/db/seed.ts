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
    {
      id: "rtu",
      name: "RTU",
      full: "Remote Terminal Unit",
      tag: "SCADA",
      description: "Field device that acquires telemetry from substation and communicates to control centre.",
      imageUrl: "/images/equipment/rtu.png",
      standards: "IEC 60870-5-101, IEC 60870-5-104, DNP3 Serial/TCP, IEEE 1613",
      interfaces: "RS-232, RS-485, RJ45 Ethernet, Dry Contact DI, Relay DO, 4-20mA Analog Inputs",
      detailedContent: `### Working Principle & Telemetry
The Remote Terminal Unit (RTU) serves as the primary gateway between substation field equipment and the SCADA Master Station. It monitors digital inputs (isolator state, breaker position), analog inputs (active power, voltage, temperature via transducers), and executes supervisory control outputs (breaker open/close command relays).

### Typical Wiring & Interface
Analog transducers convert voltage (e.g., 110V AC) and current (e.g., 1A AC) into proportional DC current loops (4-20 mA) connected to the RTU's AI cards. Digital status inputs are wired through optical couplers (opto-isolators) to prevent electrical surges from entering the main board, usually operating at 110V or 220V DC auxiliary power.

### Commissioning Steps & Loop Testing
1. **DI Loop Test**: Manually operate the breaker in the switchyard and verify that the status change (Open/Closed contact) registers correctly on the RTU's local diagnostics utility.
2. **DO Command Check**: Perform command execution tests using the RTU command relay outputs into trip/close coils, checking interlock conditions.
3. **Transducer Calibration**: Verify that the 4-20mA input corresponds exactly to the primary active power values.
4. **Point-to-Point Testing**: Establish communication with the SLDC Master Station over IEC 104 and verify telemetry mapping for every single database point.

### Common Substation Faults & Troubleshooting
* **Link Down / Telemetry Failure**: Verify ping response over the WAN gate. Check terminal connections on RS-485 serial ports or fiber switch transceivers.
* **Contact Chattering**: An input fluctuates rapidly due to a faulty mechanical limit switch. Implement debounce timers (e.g., 50ms) in the RTU configuration to filter out spikes.
* **Analog Offset**: Value drifts due to thermal degradation of the transducers. Re-calibrate or replace the transducer module.`
    },
    {
      id: "ied",
      name: "IED",
      full: "Intelligent Electronic Device",
      tag: "Automation",
      description: "Microprocessor-based controller handling protection, control and monitoring.",
      imageUrl: "/images/equipment/ied.png",
      standards: "IEC 61850 Edition 2, IEC 60255, IEEE C37.90",
      interfaces: "Fiber Optic LC, RJ45 Ethernet, IRIG-B Time Sync, RS-485",
      detailedContent: `### Working Principle & Telemetry
An Intelligent Electronic Device (IED) is a microprocessor-based controller designed to execute protection logic, bay monitoring, and interlocking controls. It samples local current and voltage inputs at high sampling rates (e.g. 64 or 128 samples per cycle), runs numerical algorithms, and triggers rapid outputs (e.g. trips breaker in < 15ms during faults).

### Substation Automation Integration
Under the IEC 61850 standard, IEDs publish high-speed multicast peer-to-peer messages called **GOOSE** (Generic Object Oriented Substation Events) over the local Ethernet LAN. GOOSE is used for horizontal interlocks and breaker failure protection, bypassing physical copper trip wiring.

### Commissioning Steps & Loop Testing
1. **Secondary Injection Test**: Inject simulated three-phase current and voltage into the IED terminal blocks using a test kit (e.g. Omicron) to verify pickup thresholds and trip curves (Overcurrent, Distance).
2. **GOOSE Latency Validation**: Trace ethernet traffic using a packet analyzer to ensure GOOSE transmission latency is below 3 milliseconds.
3. **Time Synchronization**: Ensure the local clock matches the GPS master clock within 1 microsecond using IRIG-B or PTP (IEEE 1588).

### Common Substation Faults & Troubleshooting
* **Time Sync Loss**: Shows "GPS Sync Fault". Check active optical antenna cable or PTP master clock availability.
* **MMS Connection Drop**: Station HMI loses control of the IED. Verify network switch port settings and VLAN memberships.
* **Trip Circuit Blocked**: Alert indicating circuit breakdown. Troubleshoot trip coil circuit continuity.`
    },
    {
      id: "ct",
      name: "CT",
      full: "Current Transformer",
      tag: "Measurement",
      description: "Steps down primary current for metering and protection.",
      imageUrl: "/images/equipment/ct.png",
      standards: "IEC 61869-2, IEEE C57.13, IS 2705",
      interfaces: "Primary Terminal Studs, Secondary Terminal Box, Metallic Ground Straps",
      detailedContent: `### Working Principle & Telemetry
A Current Transformer (CT) is an instrument transformer that steps down bulk primary line current (e.g., 800A) to a standardized secondary value (1A or 5A) for protection relays and measuring instruments.

### Technical Specifications
* **Metering CTs**: Designed with high accuracy (Class 0.2S or 0.5) over a small range (e.g., 5% to 120% of rated current). They saturate quickly to protect sensitive energy meters during faults.
* **Protection CTs**: Designed with high saturation limits (Class 5P20 or PS). They must reproduce primary fault current waveforms accurately (e.g., up to 20 times rated current) so protective relays can trip.

### Commissioning Steps & Testing
1. **Insulation Resistance (Megger)**: Measure insulation between primary-to-ground, secondary-to-ground, and primary-to-secondary.
2. **Ratio & Polarity Test**: Inject a primary current and verify the secondary current matches the ratio. Use the flick method to check current direction (polarity).
3. **Knee-point Voltage (KPV) Test**: For class PS CTs, plot the magnetization curve to identify the voltage point where a 10% increase in voltage results in a 50% increase in magnetizing current.

### Common Substation Faults & Safety Warnings
* **Secondary Open Circuit**: **CRITICAL DANGER**. If a CT secondary is open-circuited under load, the primary current acts entirely as magnetizing current, creating extreme high-voltage spikes across the open terminals that can cause insulation breakdown, explosions, and lethal electric shock. Always short-circuit secondary cores before working on meters or relays.
* **Moisture Ingress**: Water entering the terminal box causes grounding leakage and ratio errors. Ensure proper seals.`
    },
    {
      id: "pt",
      name: "PT",
      full: "Potential Transformer",
      tag: "Measurement",
      description: "Steps down primary voltage for metering and protection.",
      imageUrl: "/images/equipment/pt.png",
      standards: "IEC 61869-3, IEEE C57.13",
      interfaces: "High-Voltage Terminal Stud, Secondary Winding Junction Box",
      detailedContent: `### Working Principle & Telemetry
A Potential Transformer (PT), or Voltage Transformer (VT), steps down high system voltages (e.g., 400kV / $\\sqrt{3}$) to standardized secondary voltages (e.g., 110V / $\\sqrt{3}$) for protection relays, synchrocheck inputs, and meters.

### Substation Configuration
PTs are connected in parallel with the power line. Electromagnetic PTs are common at lower voltages, while Capacitor Voltage Transformers (CVTs) are used at higher transmission levels (132kV to 765kV) because the capacitor stack acts both as a voltage divider and a coupling capacitor for PLCC communication signals.

### Commissioning Steps & Testing
1. **Insulation Resistance**: Measure winding-to-ground and primary-to-secondary insulation.
2. **Ratio and Phase Angle Error**: Inject a known voltage on the primary and measure secondary terminal outputs to verify accuracy classes.
3. **Dielectric Dissipation Factor (Tan Delta)**: Test the insulating oil or solid insulation to identify aging or moisture accumulation.

### Common Substation Faults & Troubleshooting
* **VT Fuse Blown**: Blown secondary fuses result in a drop in measured voltage, triggering "Voltage Transformer Fuse Fail" alerts on numerical relays and disabling voltage-dependent protection functions (like distance relays).
* **Ferroresonance**: An unstable low-frequency oscillation between the non-linear inductance of the PT core and line capacitance. Mitigated by installing damping resistors across the open-delta secondary.`
    },
    {
      id: "relay",
      name: "Relay",
      full: "Protective Relay",
      tag: "Protection",
      description: "Detects faults and issues trip commands to breakers.",
      imageUrl: "/images/equipment/relay.png",
      standards: "IEC 60255, IEEE C37.90, ANSI Device Codes (21, 50, 51, 87)",
      interfaces: "Dry Contact Outputs, CT/PT Current/Voltage Inputs, RJ45 Ethernet",
      detailedContent: `### Working Principle & Telemetry
A digital protective relay continuously monitors currents and voltages from CTs and PTs. It compares calculated values with user-configured pickup settings. If a fault is detected (e.g. overcurrent, phase mismatch, distance zone violation), it energizes high-speed contact outputs, completing the trip circuit to open the circuit breaker.

### ANSI Protection Schemes
* **ANSI 21**: Distance Protection (calculates line impedance $Z = V/I$ to detect faults within specific zones).
* **ANSI 87**: Differential Protection (compares current entering and leaving a zone, used for transformers and generators).
* **ANSI 50/51**: Instantaneous and Time-Delay Overcurrent.

### Commissioning Steps & Testing
1. **Secondary Current Injection**: Verify pickup thresholds and timing characteristics of ANSI 50/51 elements using injection test sets.
2. **Trip Scheme Test**: Inject fault parameters and verify that the relay physically triggers the breaker's trip coil.
3. **Virtual Interlocks**: Verify that the binary input logic correctly blocks or enables specific protection zones.

### Common Substation Faults & Troubleshooting
* **Maloperation (False Tripping)**: Relay trips for a fault outside its protected zone. Check settings, CT saturation, or directional wiring polarities.
* **Auxiliary DC Supply Fail**: Total loss of auxiliary DC control voltage. Relay loses power and protection is compromised. Set up redundant DC feeders.`
    },
    {
      id: "cb",
      name: "Circuit Breaker",
      full: "Circuit Breaker",
      tag: "Switching",
      description: "Interrupts fault current and isolates faulty section.",
      imageUrl: "/images/equipment/cb.png",
      standards: "IEC 62271-100, IEC 62271-1, IEEE C37.04",
      interfaces: "Close Coil, Trip Coil 1, Trip Coil 2, Auxiliary Contacts, SF6 Gas Valve",
      detailedContent: `### Working Principle & Telemetry
The Circuit Breaker is the primary switching device responsible for closing and interrupting transmission circuits under normal load or extreme fault conditions (fault currents of up to 40kA or 50kA).

### Arc Extinction & SF6 Gas
To safely extinguish the high-temperature plasma arc generated when contacts separate, high-voltage breakers use Sulfur Hexafluoride (SF6) gas. SF6 has excellent dielectric strength and electronegativity, capturing free electrons to suppress the arc within milliseconds.

### Commissioning Steps & Testing
1. **Breaker Timing Test**: Measure the exact open and close times of the contacts in milliseconds. Main contact opening time must be less than 25-30ms.
2. **Contact Resistance Measurement (CRM)**: Inject high DC current (e.g., 100A) through the closed contacts and measure microvolt drops to determine contact wear and health (should be < 50 micro-ohms).
3. **SF6 Leakage & Dew Point Test**: Verify gas pressure and measure moisture content to prevent internal flashovers.

### Common Substation Faults & Troubleshooting
* **SF6 Low Gas Pressure Lockout**: If gas pressure drops below critical limits (e.g. 5.0 bar), the lockout relay prevents the breaker from operating. Locate leaks and top up SF6 gas.
* **Trip/Close Coil Burnout**: If a coil remains energized due to a stuck auxiliary limit switch, it burns out. Troubleshoot switch logic and replace the coil.
* **Spring Charging Motor Failure**: The mechanical spring fails to charge after an operation, disabling the next auto-reclose sequence. Check motor supply fuses and microswitch alignment.`
    },
    {
      id: "ups",
      name: "UPS",
      full: "Uninterruptible Power Supply",
      tag: "Aux Supply",
      description: "Provides clean, backed-up AC/DC power to critical loads.",
      imageUrl: "/images/equipment/ups.png",
      standards: "IEC 62040-3, IEEE 1184",
      interfaces: "Dry Contact Alarms, Modbus TCP Network Card, SNMP, AC Output Busbars",
      detailedContent: `### Working Principle & Telemetry
The Uninterruptible Power Supply (UPS) provides continuous, regulated, clean AC power to critical substation auxiliary loads, including SCADA servers, communication panels, HMI terminals, and firewall switches.

### Double Conversion Topology
Under normal conditions, the incoming AC grid power is rectified to DC, which charges the battery bank and feeds the static inverter. The inverter reconstructs a pure sine wave AC output. If the grid fails, the batteries feed the inverter instantly with zero transition time.

### Commissioning Steps & Testing
1. **Static Bypass Transfer Test**: Verify that the UPS switches load to static bypass without interrupting power if the inverter fails or experiences a heavy short circuit.
2. **Inverter Load Run**: Load the UPS to 100% capacity using a portable load bank and monitor output voltage stability.

### Common Substation Faults & Troubleshooting
* **Battery Overtemperature**: High ambient temperature degrades batteries. Monitor HVAC systems and activate thermal alarms.
* **Static Bypass Locked**: Static switch fails to transfer due to phase asynchronous mismatch. Verify input grid frequency synchronization limits.`
    },
    {
      id: "battery-bank",
      name: "Battery Bank",
      full: "Station Battery Bank",
      tag: "DC Supply",
      description: "Backup DC source for protection, control and comms.",
      imageUrl: "/images/equipment/battery-bank.png",
      standards: "IEEE 450 (Vented Lead-Acid), IEEE 1188 (VRLA), IEC 60896",
      interfaces: "Copper Busbar Intercell Connectors, Terminal Cables, Temperature Probe",
      detailedContent: `### Working Principle & Telemetry
The Station Battery Bank serves as the final, absolute line of defense for substation safety. It supplies critical 110V or 220V DC power to trip coils, numerical relays, emergency lighting, and PLCC terminals. Unlike AC power, the battery-backed DC network must remain active even during a total blackout to allow protection relays to operate.

### Battery Room Safety & Maintenance
Batteries are configured in series to achieve the target DC voltage (e.g. 55 lead-acid cells of 2V each for a 110V system). Vented lead-acid (VLA) cells emit explosive hydrogen gas during charging, requiring dedicated ventilation systems.

### Commissioning Steps & Testing
1. **Specific Gravity Check**: For flooded cells, measure the electrolyte specific gravity using a hydrometer to confirm state of charge (nominal ~1.20 to 1.22).
2. **Capacity Discharge Test (Battery Load Run)**: Discharge the battery bank at a constant current rate for 8 or 10 hours to measure actual capacity in Ampere-hours (Ah).
3. **Cell Impedance Test**: Measure internal resistance to locate high-resistance cells.

### Common Substation Faults & Troubleshooting
* **DC Earth Fault**: Insulation breakdown on field wiring causes positive or negative DC leads to touch ground. This can cause false tripping of breakers if a second fault occurs. Locate and isolate the faulty terminal using a ground fault locator.
* **Sulphation**: White lead sulphate crystals form on battery plates due to prolonged undercharging, causing loss of capacity. Apply equalization charge.`
    },
    {
      id: "router",
      name: "Router",
      full: "Router",
      tag: "Comms",
      description: "Routes IP traffic between substation LANs and WAN.",
      imageUrl: "/images/equipment/router.png",
      standards: "IEC 61850-3, IEEE 1613, RFC 2544",
      interfaces: "10G SFP+ Fiber Ports, RJ45 Gigabit Ethernet, Serial Console Port, Dual DC Power Inlets",
      detailedContent: `### Working Principle & Telemetry
An industrial substation router routes network traffic between local substation networks (LANs) and the wide-area network (WAN) communicating with State and Regional Load Dispatch Centers.

### Substation Environmental Hardening
Substation routers must comply with **IEC 61850-3** and **IEEE 1613** standards, which require protection against electromagnetic interference (EMI), electrostatic discharges (ESD), and wide temperature ranges (-40°C to +85°C) without using internal cooling fans.

### Commissioning Steps & Testing
1. **WAN Link Latency Check**: Test network latency (ping/traceroute) to the SLDC gateway, verifying it matches SLA limits (typically < 10-15ms).
2. **Redundant Path Failover**: Simulate WAN fiber failure and verify that routing protocols (like OSPF or BGP) failover to the backup link within 1 second.

### Common Substation Faults & Troubleshooting
* **Link Flapping**: Fiber optic link drops and recovers repeatedly. Check patch cords, clean the SFP transceiver faces, or measure optic Rx power.
* **Routing Loop**: Telemetry data packets bounce between routers, overloading CPU. Verify routing table parameters and interface metrics.`
    },
    {
      id: "switch",
      name: "Switch",
      full: "Ethernet Switch",
      tag: "Comms",
      description: "Managed switch for station and process bus networks.",
      imageUrl: "/images/equipment/switch.png",
      standards: "IEC 61850-3, IEEE 1613, IEEE 1588v2 PTP",
      interfaces: "SFP Fiber Optic Ports, RJ45 Ethernet, VLAN Access/Trunk Configs",
      detailedContent: `### Working Principle & Telemetry
Substation Ethernet Switches connect bay level IEDs, bay controllers, and HMIs together inside a local network.

### IEC 61850 Station Bus and Process Bus
* **Station Bus (VLAN 10/20)**: Carries MMS control messages and GOOSE tripping signals.
* **Process Bus (VLAN 30)**: Carries high-speed Sampled Values (SV) from Merging Units to relays, requiring strict bandwidth reservation and Quality of Service (QoS) priorities.
* **IEEE 1588 PTP**: Distributes nanosecond-accurate GPS time stamps across the Ethernet network for synchrophasor applications.

### Commissioning Steps & Testing
1. **VLAN Segmentation**: Verify that Sampled Values and GOOSE traffic are isolated into separate VLANs to prevent switch port buffer overflows.
2. **RSTP/MSTP Loop Prevention**: Enable Rapid Spanning Tree Protocol and simulate a link cut to verify recovery in < 50ms.

### Common Substation Faults & Troubleshooting
* **Broadcast Storm**: A loop in switch wiring creates a flood of broadcast frames, freezing all telemetry. Trace network loops and enable broadcast storm control.
* **Packet Drops / Buffer Overruns**: Switch drops GOOSE messages during grid disturbances. Configure strict QoS priority queues for GOOSE traffic.`
    },
    {
      id: "firewall",
      name: "Firewall",
      full: "Firewall",
      tag: "OT Security",
      description: "Filters and segments OT traffic per IEC 62443 zones.",
      imageUrl: "/images/equipment/firewall.png",
      standards: "IEC 62443-4-2, NERC CIP Compliance, IEC 61850-3",
      interfaces: "WAN Port, DMZ Port, LAN Interface, Console Port",
      detailedContent: `### Working Principle & Cyber Security
The OT Firewall protects the substation control system from unauthorized network access. It performs Deep Packet Inspection (DPI) on SCADA protocols, ensuring only legitimate commands (e.g. read telemetry) are permitted, while blocking malicious commands (e.g. unauthorized firmware upload or breaker trip commands).

### Security Segmentation (IEC 62443)
OT firewalls separate the network into security zones:
* **Zone 1 (Process Bus)**: Extremely restricted, no external access.
* **Zone 2 (Station Bus)**: Restricts HMI and SCADA server traffic.
* **Zone 3 (DMZ)**: Houses intermediate database gateways for external SLDC connections.

### Commissioning Steps & Testing
1. **Ruleset Audit**: Verify the firewall policy blocklist blocks unauthorized IP addresses, telnet, and web access.
2. **DPI Logic Verification**: Inject simulated IEC 104 write commands from outside the authorized range and verify they are blocked and logged.

### Common Substation Faults & Troubleshooting
* **False Positive Blocking**: The firewall blocks legitimate telemetry traffic due to an overly restrictive protocol signature. Audit firewall logs and adjust rule parameters.
* **Syslog Overflow**: The firewall fills its memory logs, slowing down performance. Set up remote log collection servers.`
    },
    {
      id: "otdr",
      name: "OTDR",
      full: "Optical Time-Domain Reflectometer",
      tag: "Fiber",
      description: "Characterizes optical fibers, faults, splices and losses.",
      imageUrl: "/images/equipment/otdr.png",
      standards: "IEC 60793-1-40, ITU-T G.652 (Single Mode)",
      interfaces: "FC/UPC Optical Adaptor, USB Export Interface, Handheld Screen",
      detailedContent: `### Working Principle & Telemetry
An Optical Time-Domain Reflectometer (OTDR) is an instrument used to characterize optical fiber communication paths (such as OPGW - Optical Ground Wire) running along transmission lines.

### Technical Function
It injects a series of high-power optical pulses into the fiber and measures the intensity of light reflected back (Rayleigh backscattering and Fresnel reflections). This allows engineers to measure total line loss, joint loss, splice health, and identify the exact distance to a fiber break or fault.

### Commissioning Steps & Testing
1. **Fiber Characterization**: Connect the OTDR to the patch panel at the substation control room and launch testing pulses.
2. **Trace Analysis**: Verify splice losses (must be < 0.05 dB per splice) and identify the position of macro-bends.

### Common Substation Faults & Troubleshooting
* **Dirty Fiber Connector**: Causes a massive initial reflection spike, blocking the rest of the fiber trace. Clean the connector tip with lint-free wipes and alcohol.
* **High Insertion Loss**: Indicates fiber stress due to incorrect tension on the OPGW line. Readjust mechanical clamps.`
    }
  ];

  for (const eq of equipmentList) {
    await db.insert(equipment).values(eq).onConflictDoUpdate({
      target: equipment.id,
      set: {
        imageUrl: eq.imageUrl,
        standards: eq.standards,
        interfaces: eq.interfaces,
        detailedContent: eq.detailedContent,
      }
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
