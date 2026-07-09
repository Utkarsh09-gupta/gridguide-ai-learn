# Substation Automation IEC 61850 Handbook

IEC 61850 is the global standard for communication networks and systems in substations. It replaces copper cabling with high-speed digital networks, standardizes data modeling, and enables vendor interoperability.

---

## 1. Logical Nodes & Data Modeling
IEC 61850 breaks down physical devices (IEDs) into virtual Logical Devices (LD), which contain **Logical Nodes (LN)** representing functions:
*   `XCBR`: Circuit Breaker (monitors contacts and commands opening/closing).
*   `XSWI`: Switch/Isolator.
*   `PDIS`: Distance Protection Relay.
*   `MMXU`: Measurement Unit (active/reactive power, voltage, current).
*   `TCTR` / `TVTR`: Current/Voltage transformer node inputs.

Every data object inside a Logical Node follows a strict naming structure. For example, `XCBR.Pos.stVal` represents the position state value (Open, Closed, Intermediate) of the circuit breaker.

---

## 2. Communication Services & Protocols
Substation data flows over three distinct communication paths:
1.  **MMS (Manufacturing Message Specification)**: A client-server TCP/IP protocol. Used for vertical reporting of telemetry and alarm parameters from bay IEDs to the local station HMI and gateway.
2.  **GOOSE (Generic Object Oriented Substation Event)**: A high-speed, multicast Ethernet protocol. GOOSE messages are published directly onto the layer-2 Ethernet network (no IP header) to achieve transmission latency of **< 3ms**. Used for trip signals and interlocks between bay devices.
3.  **Sampled Values (SV - IEC 61850-9-2)**: High-speed streaming of digitized voltage and current waveforms from switchyard Merging Units to protective relays (e.g. 80 samples per cycle for protection).

---

## 3. Substation Configuration Language (SCL)
IEC 61850 uses XML-based SCL configuration files to exchange design parameters between vendor tools:
*   `SSD` (Substation Specification Description): Outlines the substation's single-line diagram and functional requirements.
*   `ICD` (IED Capability Description): Exported by the IED manufacturer, detailing its supported logical nodes and telemetry points.
*   `SCD` (Substation Configuration Description): The master file containing the complete substation configuration (VLAN bindings, GOOSE mappings, and IP addresses).
*   `CID` (Configured IED Description): Configured file loaded into a specific IED.
