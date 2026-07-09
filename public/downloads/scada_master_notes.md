# SCADA Master Notes

Supervisory Control And Data Acquisition (SCADA) systems are the core operational technology (OT) platform used by State and Regional Load Dispatch Centers (SLDCs/RLDCs) to monitor and control power grids in real time.

---

## 1. Remote Telemetry Loop
Substation telemetry originates at field sensors (CTs/PTs) and flows through transducers to the RTU:
*   **Analog Inputs (AI)**: Voltage, current, active power (MW), and reactive power (MVAR) are scaled by transducers into standard DC current loops (typically **4-20 mA**). This prevents electrical noise from degrading readings over long wire runs.
*   **Digital Inputs (DI)**: State contacts (such as Circuit Breaker Open/Closed status, isolator positions, and gas alarms) are wired as dry contacts using **110V/220V DC** auxiliary station battery voltage. The signals are optically isolated (opto-couplers) at the RTU to prevent surge propagation.
*   **Digital Outputs (DO)**: Interposing command relays inside the RTU are energized by output cards, closing contacts to activate the breaker's Trip or Close coils.

---

## 2. SCADA Master Station Architecture
The Master Station (housed in the SLDC control room) runs a highly redundant network:
*   **Front-End Processors (FEP)**: Dedicated communications servers. They handle protocol translation (e.g., parsing raw serial or Ethernet packets from IEC 101/104 or DNP3), stamp the incoming data with GPS time codes, and forward clean records to the main SCADA servers.
*   **SCADA Servers (Real-Time Database)**: Run in a **Hot-Standby Redundant Configuration**. The active server continuously replicates its memory-resident database (real-time telemetry) to the standby server. If the active server fails, the standby takes over in `< 1 second` without losing state or alarm lists.
*   **Historical Database (Historian)**: A high-performance time-series database that permanently saves telemetry changes and SOE (Sequence of Events) logs for post-fault disturbance analysis.
*   **Operator Workstations (HMI)**: Display single-line diagrams (SLDs), tabular alarm displays, and dispatch control dialogs.

---

## 3. Redundancy & Cybersecurity
*   **Dual Communication Channels**: RTUs are linked to the master station over independent channels (e.g., main path via OPGW fiber network, backup path via PLCC or MPLS).
*   **Network Segmentation (IEC 62443)**: Control center networks are strictly segmented. A firewall separates the SCADA operational LAN (Zone 2) from external office networks and DMZs.
