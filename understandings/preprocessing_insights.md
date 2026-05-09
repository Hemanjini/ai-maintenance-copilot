# Preprocessing & Risk Analysis Insights

## 1. Preprocessing Summary
The preprocessing phase successfully transformed the raw sensor data into a format suitable for machine learning and real-time monitoring.

- **Missing Data Resolution**: 
    - **Temperature**: 137 missing values filled.
    - **Airflow**: 147 missing values filled.
    - **Method**: Linear interpolation (grouped by unit) + Backfilling (for initial values).
- **Feature Engineering**:
    - **Rate of Change**: Added `diff` columns for all sensors to detect sudden fluctuations.
    - **Rolling Means**: Added 30-minute moving averages to smooth noise and identify sustained trends.
    - **Risk Scoring**: Implemented a weighted score (0-100) based on critical threshold violations.

## 2. Risk Score Distribution
The preprocessing script revealed varying levels of system distress across the fleet:
- **Max Risk Score: 90**: Indicates multiple simultaneous critical failures (e.g., High Vibration + Low Airflow + Overheating).
- **Frequent High-Risk Period (Score 80)**: Observed during mechanical degradation events.

## 3. Detailed Case Study: HVAC_1 Crisis
A significant correlated anomaly was detected for **HVAC_1** between **15:25 and 16:30**.

| Observation | Value/Status | Threshold |
| :--- | :--- | :--- |
| **Vibration** | ~0.15 - 0.18 | > 0.08 |
| **Airflow** | ~226 - 245 | < 250 |
| **Risk Score** | **80** | N/A |

### Rationale:
The simultaneous spike in vibration and drop in airflow suggests a **mechanical linkage failure**. In a real-world scenario, this pattern often points to a **damaged blower fan** or a **loose motor mount** that causes imbalance (vibration) and reduced efficiency (airflow).

## 4. Maintenance Recommendations
Based on these insights, the following rules should be prioritized for the alerting system:
1. **Critical Alert**: Trigger immediate inspection when `risk_score` > 70 for more than 15 minutes.
2. **Warning Alert**: Trigger inspection if `vibration_rolling_mean` increases by >50% over a 2-hour window, even if absolute thresholds aren't hit yet.
3. **Efficiency Check**: Flag units where `power` increases while `airflow` remains low (indicates motor strain).
