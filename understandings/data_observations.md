# Data Observations Summary

## 1. Column Mapping
The dataset uses the following column names:
- **timestamp**: Time of sensor reading.
- **unit_id**: HVAC System Identifier (HVAC ID).
- **temp**: Temperature.
- **pressure**: Pressure levels.
- **airflow**: Airflow volume.
- **vibration**: Mechanical vibration.
- **power**: Electricity consumption.

## 2. Missing Values
We identified missing data in two key areas:
- **Temperature (`temp`)**: 137 missing entries.
- **Airflow (`airflow`)**: 147 missing entries.

## 3. HVAC Inventory
There are **5** active units in the dataset:
- `HVAC_1`
- `HVAC_2`
- `HVAC_3`
- `HVAC_4`
- `HVAC_5`

## 4. Detected Anomalies (Spikes)
The preliminary analysis shows several "weird" data points that indicate potential maintenance needs:
- **Vibration**: Extreme spike at **0.222** (Normal mean is ~0.026).
- **Airflow**: Severe drop to **119.6** (Normal mean is ~315.2).
- **Temperature**: Unusual peak at **37.0°C** (Normal mean is ~22.1°C).
- **Power**: High consumption peak at **9.08** (Normal mean is ~5.15).
