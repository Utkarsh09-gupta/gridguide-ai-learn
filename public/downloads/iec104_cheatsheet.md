# IEC 60870-5-104 Protocol Cheatsheet

IEC 60870-5-104 (IEC 104) is the standard companion telecontrol protocol used over TCP/IP networks to exchange telemetry data between substation RTUs/gateways and the Load Dispatch Center SCADA master.

---

## 1. Frame Structure: APDU (Application Protocol Data Unit)
An IEC 104 packet contains an **APCI** (Application Protocol Control Information) header followed by an optional **ASDU** (Application Service Data Unit) payload:

```
+--------------------+---------------------+-----------------------------------+
| Start 0x68 (1 Byte) | Length (1 Byte)    | Control Fields (4 Bytes)          | 
+--------------------+---------------------+-----------------------------------+
|                                APCI Header                                   |
+------------------------------------------------------------------------------+
|                                ASDU Payload (Variable Length)                |
+------------------------------------------------------------------------------+
```

### APCI Control Field Types:
1.  **I-Format (Information)**: Used for bidirectional numerical telemetry, binary states, and supervisory controls. Contains send/receive sequence numbers ($N(S)$ and $N(R)$) to prevent packet loss.
2.  **S-Format (Supervisory)**: Used to acknowledge received I-frames. It contains only $N(R)$ and does not carry an ASDU payload.
3.  **U-Format (Unnumbered)**: Used for link management (STARTDT - Start Data Transmission, STOPDT - Stop Data Transmission, and TESTFR - Test Frame).

---

## 2. ASDU Data Structures
The ASDU contains the actual data payload:
*   **Type Identifier (Type ID)**: 1 Byte defining the telemetry type:
    *   `Type 1`: Single point information (DI state, e.g. breaker Open/Closed).
    *   `Type 30`: Single point with 56-bit CP56Time2a timestamp.
    *   `Type 13`: Measured value, short floating-point (AI values, e.g. MW flow).
    *   `Type 36`: Measured value, short float with CP56Time2a timestamp.
    *   `Type 45`: Single command (supervisory control execution, e.g. Trip breaker).
*   **Cause of Transmission (COT)**: 1 or 2 Bytes indicating why the message was sent (e.g. `COT 3` = Spontaneous change, `COT 20` = General Interrogation response, `COT 6` = Activation of command).
*   **Common Address of ASDU (Sector)**: 1 or 2 Bytes indicating the target device address (Substation ID).
*   **Information Object Address (IOA)**: 3 Bytes indicating the unique database address of the signal (e.g. `IOA 1004` = Breaker 52A state).

---

## 3. General Interrogation (GI)
A GI sequence is initiated by the SCADA master upon startup or link reconnection (`COT 20`) to poll the current state of all points inside the RTU database, avoiding waiting for spontaneous updates.
*   **Activation Command**: Type 100 (`COT 6` = Activation).
*   **Activation Acknowledge**: Type 100 (`COT 7` = Act-Confirm).
*   **ASDU Telemetry Rows**: Telemetry streams are uploaded spontaneity or with `COT 20`.
*   **Termination**: Type 100 (`COT 10` = Act-Term).
