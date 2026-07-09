# PMU & WAMS Handbook

Wide-Area Measurement Systems (WAMS) utilize Phasor Measurement Units (PMUs) to capture synchronized, high-speed telemetry across transmission lines. PMUs enable real-time tracking of grid dynamics, frequency stability, and voltage oscillation.

---

## 1. What is a Synchrophasor?
A phasor represents a sinusoidal waveform (voltage or current) in polar coordinates ($A \angle \theta$, where $A$ is the RMS amplitude and $\theta$ is the phase angle).
*   **Time Synchronization**: A standard SCADA system polls data every **2 to 4 seconds**, and timestamps are applied at the master station, introducing time skew.
*   **PMU Sampling**: PMUs sample waveforms at **50 to 100 frames per second** and synchronize their internal clocks using a common GPS time-source. This allows phase angle difference measurements across lines separated by thousands of kilometers.

---

## 2. Timing Synchronicity (IEEE C37.118)
*   **GPS Synchronization**: PMUs require sub-microsecond time synchronization (within **1 microsecond**) to keep phase angle errors under **0.57 degrees** (which corresponds to a Total Vector Error - TVE of 1%).
*   **Protocols**: Time coordination is achieved using external GPS antennas via IRIG-B cable protocols or Precision Time Protocol (PTP / IEEE 1588v2) over optical fiber.

---

## 3. PDC (Phasor Data Concentrator) Hierarchy
PMU telemetry streams are aggregated using a hierarchical structure:
1.  **Substation PDC**: Collects local PMU streams, checks timestamps, aligns data packets by time code, and forwards them as a single packet.
2.  **State/Regional PDC**: Collects telemetry from multiple substation PDCs, aggregates the streams, and routes them to WAMS analysis applications.
3.  **National PDC**: The apex concentrator providing a complete, synchronized real-time snapshot of the national grid.

---

## 4. Key WAMS Applications
*   **Angle Stability Monitoring**: Measures the relative phase angle difference between distant buses. If the angle grows too large (e.g. $> 60^\circ$ to $80^\circ$), the grid is at risk of transient instability.
*   **Oscillation Detection**: Identifies low-frequency power oscillations (0.1 Hz to 2.0 Hz) between generator groups that can lead to wide-area blackouts.
*   **Post-Disturbance Analysis**: Precision event reconstruction following line faults or system separation.
