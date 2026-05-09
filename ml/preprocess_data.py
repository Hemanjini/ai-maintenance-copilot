import pandas as pd

# STEP 1: Load the raw dataset
# We need to bring the CSV data into a Pandas DataFrame for manipulation.
df = pd.read_csv("../data/hvac_sensor_data.csv")

# STEP 2: Convert 'timestamp' to datetime objects
# CSVs store dates as strings. Converting them to datetime objects allows us to 
# perform time-based sorting and calculations (like finding gaps in data).
df["timestamp"] = pd.to_datetime(df["timestamp"])

# STEP 3: Sort the data
# For time-series analysis and filling missing values (interpolation/backfill), 
# the data MUST be in chronological order within each specific HVAC unit.
df = df.sort_values(by=["unit_id", "timestamp"])

# STEP 4: Fill missing values using Linear Interpolation
# Interpolation estimates missing values based on the surrounding data points. 
# This is more accurate than simple averages for sensor data that follows a trend.
# We group by 'unit_id' to ensure we don't accidentally use data from one HVAC 
# unit to estimate values for a different one.
df["temp"] = df.groupby("unit_id")["temp"].transform(
    lambda x: x.interpolate()
)

df["airflow"] = df.groupby("unit_id")["airflow"].transform(
    lambda x: x.interpolate()
)

# STEP 5: Backfill remaining missing values
# Linear interpolation cannot fill values at the very beginning of a series 
# (where there is no "previous" point). .bfill() takes the next available 
# valid value and copies it backward to cover these edge cases.
df = df.bfill()

# STEP 6: Final Validation
# We check the null count again to ensure our cleaning strategy worked perfectly.
print("\nMissing Values After Cleaning (Should be all 0):")
print(df.isnull().sum())

# STEP 7: Preview cleaned data
print("\nFirst 5 Rows of Cleaned Data:")
print(df.head())

# STEP 8: Feature Engineering - Rate of Change
# Calculating the difference between consecutive readings (.diff()) helps detect 
# sudden jumps or drops that might be more alarming than the absolute values themselves.
df["temp_change"] = df.groupby("unit_id")["temp"].diff()
df["pressure_change"] = df.groupby("unit_id")["pressure"].diff()
df["airflow_change"] = df.groupby("unit_id")["airflow"].diff()
df["vibration_change"] = df.groupby("unit_id")["vibration"].diff()
df["power_change"] = df.groupby("unit_id")["power"].diff()

# STEP 9: Feature Engineering - Rolling Means (Smoothing)
# Sensor data can be "noisy". A rolling mean (moving average) over the last 6 
# readings (30 mins) helps identify sustained trends rather than one-off spikes.
df["temp_rolling_mean"] = (
    df.groupby("unit_id")["temp"]
    .transform(lambda x: x.rolling(window=6, min_periods=1).mean())
)

df["vibration_rolling_mean"] = (
    df.groupby("unit_id")["vibration"]
    .transform(lambda x: x.rolling(window=6, min_periods=1).mean())
)

# STEP 10: Threshold-based Anomaly Flags
# Here we define "Red Lines" for our HVAC systems based on known safety limits.
# These binary flags (True/False) make it easy for machine learning models to 
# pick up on critical failures.

THRESHOLDS = {

    "vibration": {
        "warning": 0.08,
        "critical": 0.15
    },

    "airflow": {
        "warning": 250,
        "critical": 220
    },

    "temperature": {
        "warning": 28,
        "critical": 35
    },

    "power": {
        "warning": 6,
        "critical": 8
    }
}

def vibration_state(v):

    if v > THRESHOLDS["vibration"]["critical"]:
        return "critical"

    elif v > THRESHOLDS["vibration"]["warning"]:
        return "warning"

    return "normal"


def airflow_state(a):

    if a < THRESHOLDS["airflow"]["critical"]:
        return "critical"

    elif a < THRESHOLDS["airflow"]["warning"]:
        return "warning"

    return "normal"


def temperature_state(t):

    if t > THRESHOLDS["temperature"]["critical"]:
        return "critical"

    elif t > THRESHOLDS["temperature"]["warning"]:
        return "warning"

    return "normal"


def power_state(p):

    if p > THRESHOLDS["power"]["critical"]:
        return "critical"

    elif p > THRESHOLDS["power"]["warning"]:
        return "warning"

    return "normal"

# Apply state functions
df["vibration_state"] = df["vibration"].apply(vibration_state)
df["airflow_state"] = df["airflow"].apply(airflow_state)
df["temperature_state"] = df["temp"].apply(temperature_state)
df["power_state"] = df["power"].apply(power_state)

# STEP 11: Maintenance Risk Scoring
# We combine our flags into a single 'Risk Score' (0-100).
# We weight vibration highest (40 points) as it often precedes major failure.
SEVERITY_SCORES = {
    "normal": 0,
    "warning": 1,
    "critical": 2
}

df["risk_score"] = (

    df["vibration_state"]
    .map(SEVERITY_SCORES) * 35 +

    df["airflow_state"]
    .map(SEVERITY_SCORES) * 30 +

    df["temperature_state"]
    .map(SEVERITY_SCORES) * 20 +

    df["power_state"]
    .map(SEVERITY_SCORES) * 15
)

# STEP 12: Save the Cleaned & Enhanced Data
# We save the results to a new file so the raw data remains untouched.
# This processed file is what we will use for the final AI Maintenance Dashboard.
df.to_csv("../data/processed_hvac_data.csv", index=False)

print("\nProcessed data saved successfully to '../data/processed_hvac_data.csv'.")
