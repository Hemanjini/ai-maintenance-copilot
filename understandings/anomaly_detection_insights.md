# Anomaly Detection Insights (Isolation Forest)

## 1. Detection Overview
The AI-driven anomaly detection (using Isolation Forest) has successfully identified non-linear patterns that simple threshold rules might miss.

- **Total Anomalies Detected**: 30
- **Normal Operating Points**: 965
- **Fleet-Wide Distribution**:
    - **HVAC_1**: 27 detections (Clustered)
    - **HVAC_2**: 3 detections (Spasmodic)
    - **Others**: 0 detections

## 2. Key Behavioral Patterns

### A. The "Crisis Cluster" (HVAC_1)
The AI heavily flagged the period between **13:00 and 16:30** for HVAC_1. 
- **Pattern**: A combination of high vibration, low airflow, and elevated power consumption.
- **Significance**: 90% of all anomalies are concentrated here, confirming this is a major system failure rather than transient noise.

### B. Subtle Behavioral Anomalies (HVAC_2)
We observed a critical insight where the AI detected an anomaly even when the `risk_score` was low.
- **Example (04:15)**: `risk_score` was only **20**, but the `anomaly_score` was negative (flagged).
- **Explanation**: The system had just experienced an extreme 37°C spike. The rapid rate of change and the lingering high temperature—while below the most critical thresholds—were flagged by the AI as "mathematically unusual" compared to the normal behavior of other units.

## 3. Severity Classification
We have implemented a secondary classification logic to prioritize these detections:

| Severity | Logic | Observation |
| :--- | :--- | :--- |
| **CRITICAL** | Risk Score >= 80 | Sustained mechanical failure (HVAC_1). |
| **HIGH** | Risk Score >= 40 | Threshold breaches with potential for escalation. |
| **MEDIUM** | Anomaly Detected (Risk Score < 40) | **Early Warning**: AI detects weird behavior before it hits red-line thresholds. |
| **NORMAL** | No Anomaly / Low Risk | Stable operation. |

## 4. Conclusion
The combination of **Threshold-based Risk Scoring** and **AI-based Anomaly Detection** provides a powerful dual-layer defense:
1. The **Risk Score** tells us *what* is broken right now.
2. The **Anomaly Score** tells us *when* something is starting to behave suspiciously, providing an early window for preventative maintenance.
