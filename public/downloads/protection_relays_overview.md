# Protection Relays Overview Guide

Numerical protection relays are dedicated, high-speed microprocessor devices designed to monitor substation feeders, buses, and transformers. They analyze CT/PT waveforms, identify faults, and trip circuit breakers to protect grid equipment from thermal and mechanical destruction.

---

## 1. Standard ANSI Protection Device Codes
Protection schemes are universally designated using ANSI standard numbers:
*   **ANSI 21 (Distance Protection)**: Calculates the impedance ($Z = V/I$) of the transmission line. If a fault occurs on the line, the calculated impedance drops below normal load limits. Operating zones (Zone 1: 80% instantaneous, Zone 2: 120% with 300ms delay) are set to coordinate with neighboring substations.
*   **ANSI 87 (Differential Protection)**: Compares the vector difference of currents entering and leaving a protected zone (e.g. transformer windings). If the difference exceeds threshold limits, an internal fault exists, triggering an instantaneous trip.
*   **ANSI 50/51 (Overcurrent)**:
    *   `50`: Instantaneous Overcurrent (pickup on heavy short-circuits).
    *   `51`: AC Time Overcurrent (Inverse Definite Minimum Time - IDMT, where higher fault currents trip the relay faster to preserve insulation).
*   **ANSI 59 (Overvoltage)** & **ANSI 27 (Undervoltage)**.
*   **ANSI 50BF (Breaker Failure)**: If a relay issues a trip command but the breaker fails to open within a set time (e.g., 200ms), 50BF triggers and trips all adjacent breakers on the busbar.

---

## 2. Relay Terminal Wiring & Interface
*   **Current Inputs**: Fed from CT secondary cores (1A or 5A rated currents).
*   **Voltage Inputs**: Fed from PT secondary cores (typically 110V AC phase-to-phase).
*   **Binary Inputs (BI)**: Powered by substation DC auxiliary battery supply (110V/220V DC) to monitor breaker auxiliary contacts, spring-charged status, or local/remote switches.
*   **Binary Outputs (BO / Trip Contacts)**: High-speed, heavy-duty dry contacts designed to handle inductive trip coil currents.

---

## 3. Commissioning & Secondary Injection Testing
During commissioning, engineers isolate the relay from primary power and use secondary injection test sets (like Omicron or Doble):
1.  **Impedance Zone Verification**: Inject simulated fault currents and voltages to verify the boundary settings of the ANSI 21 distance zones.
2.  **Trip Circuit Supervision (TCS)**: Ensure the relay continuously monitors the health of the breaker's trip coil circuit and flags an alarm if the coil burns open.
3.  **GOOSE Tripping Check**: Verify that virtual interlock signals are transmitted to adjacent bays over the station LAN under the IEC 61850 standard.
