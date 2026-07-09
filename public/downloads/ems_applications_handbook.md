# EMS Applications Handbook

Energy Management Systems (EMS) run advanced mathematical and control applications on top of the real-time SCADA engine. These applications allow Load Dispatch Centers to maintain grid frequency, optimize transmission economic dispatch, and ensure security.

---

## 1. State Estimation (SE)
State Estimation is the mathematical core of the EMS. Raw telemetry from the field contains noise, errors, or missing points due to communication dropouts.
*   **Weighted Least Squares (WLS)**: SE uses the physical laws of power flow (Kirchhoff's laws) and network topology to calculate the most probable state of the grid (voltage magnitudes and phase angles at every bus) by minimizing measurement residuals:
    $$J(x) = \sum_{i=1}^{m} \frac{(z_i - h_i(x))^2}{\sigma_i^2}$$
    where $z_i$ is the measured value, $h_i(x)$ is the network equation, and $\sigma_i^2$ is the measurement variance.
*   **Bad Data Detection**: SE filters out faulty analog measurements (e.g. from broken transducers) by evaluating normalized residuals ($r^N$-test) and flags them for technicians.
*   **Topology Processor**: Continuously reads circuit breaker states to build the active nodal model of the grid.

---

## 2. Optimal Power Flow (OPF)
While standard Power Flow solves for line flows based on fixed generation levels, Optimal Power Flow optimizes generator dispatch levels to minimize operational costs or losses while staying within system limits.
*   **Objective Functions**: Minimize variable generation costs (merit order) or minimize active power losses ($I^2R$).
*   **Constraints**:
    *   *Equality constraints*: Total generation must equal load plus losses.
    *   *Inequality constraints*: Line thermal capacities, bus voltage boundaries, and generator active/reactive capability limits ($P/Q$ limits).

---

## 3. Automatic Generation Control (AGC)
AGC is a closed-loop control system that regulates grid frequency and inter-regional tie-line power flows in real time (every 2 to 4 seconds).
*   **Area Control Error (ACE)**: AGC calculates ACE for each control area:
    $$\text{ACE} = (P_{\text{actual}} - P_{\text{scheduled}}) - 10B(f_{\text{actual}} - f_{\text{scheduled}})$$
    where $P$ is tie-line exchange, $B$ is the frequency bias coefficient (MW/0.1Hz), and $f$ is system frequency.
*   **Control Signals**: If frequency drops (negative ACE), AGC automatically uploads digital raising commands (MW setpoints) to participating generator governors to restore frequency to 50.00 Hz.
