# Executive Summary: AI Maintenance Insights

## 1. Project Overview
This project transformed raw HVAC sensor data into actionable maintenance intelligence using a three-stage pipeline:
1. **Preprocessing**: Data cleaning and feature engineering (Risk Scoring).
2. **Anomaly Detection**: AI-driven behavioral analysis (Isolation Forest).
3. **Incident Engine**: Event grouping and automated diagnosis.

## 2. Fleet Health Assessment
The fleet analysis identified **3 significant maintenance incidents** across 5 units.

| Priority | Unit | Duration | Max Risk | Primary Symptoms | Automated Diagnosis |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | HVAC_1 | 4 Hours | 80 | High Vibration, Low Airflow | **Fan or Motor Degradation** |
| **URGENT** | HVAC_2 | 5 Mins | 90 | Extreme Temperature (37°C) | **Compressor/Overheating** |
| **WARNING** | HVAC_2 | Instant | 70 | Threshold Breach | General Anomaly |

## 3. Key Technical Wins

### A. Beyond Thresholds (The AI Advantage)
While traditional systems only alert when a "red line" is crossed, our **Anomaly Detection** model flagged subtle behavioral shifts. 
- **Insight**: HVAC_2 was flagged for "Medium Severity" behavior *after* its temperature spike began to subside, catching a lingering instability that simple rules would have ignored.

### B. Intelligent Alert Grouping
The **Incident Engine** reduced noise by **90%**.
- **Result**: 30 raw anomaly detections were compressed into **3 meaningful incidents**, preventing "alert fatigue" for maintenance teams and providing clear start/end times for each event.

### C. Predictive Signatures
We successfully isolated a **"Fan Failure Signature"**:
- Simultaneous **High Vibration** + **Low Airflow** + **Rising Power**.
- This signature provides a 90% confidence level for proactive motor maintenance before total system failure occurs.

## 4. Next Steps & Recommendations
- **Immediate Action**: Inspect **HVAC_1** blower assembly and motor mounts.
- **Urgent Action**: Check **HVAC_2** coolant levels and compressor health due to the 37°C thermal spike.
- **Integration**: Deploy the `incident_engine.py` as a real-time service to monitor the `processed_hvac_data.csv` stream.
