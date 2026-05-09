import pandas as pd
from sklearn.ensemble import IsolationForest

# Load processed data
df = pd.read_csv("../data/processed_hvac_data.csv")

# Features for anomaly detection
features = [
    "temp",
    "pressure",
    "airflow",
    "vibration",
    "power",
    "temp_change",
    "pressure_change",
    "airflow_change",
    "vibration_change",
    "power_change",
    "risk_score"
]

# Remove rows with NaN from diff columns
df_model = df[features].dropna()

# Train Isolation Forest
model = IsolationForest(
    n_estimators=100,
    contamination=0.03,
    random_state=42
)

model.fit(df_model)

# Predict anomalies
df.loc[df_model.index, "anomaly"] = model.predict(df_model)

# Convert predictions
# -1 = anomaly
#  1 = normal
df["anomaly"] = df["anomaly"].map({
    1: 0,
    -1: 1
})

# Anomaly score
df.loc[df_model.index, "anomaly_score"] = model.decision_function(df_model)

# Save output
df.to_csv("../data/anomaly_detected_data.csv", index=False)

# Show anomaly counts
print("\nAnomaly Counts:")
print(df["anomaly"].value_counts())

# Show suspicious rows
anomalies = df[df["anomaly"] == 1]

print("\nTop Detected Anomalies:")
print(anomalies[
    [
        "timestamp",
        "unit_id",
        "temp",
        "airflow",
        "vibration",
        "power",
        "risk_score",
        "anomaly_score"
    ]
].head(20))

# STEP: Severity Classification
# We categorize anomalies to help maintenance teams prioritize their response.
def classify_severity(row):

    # -----------------------------------
    # Critical:
    # Active thermal danger
    # -----------------------------------

    if (
        row["temp"] > 35
    ):
        return "critical"

    # -----------------------------------
    # High:
    # Severe mechanical degradation
    # -----------------------------------

    elif (
        row["vibration"] > 0.15 and
        row["airflow"] < 250
    ):
        return "high"

    # -----------------------------------
    # Medium:
    # AI anomaly or moderate instability
    # -----------------------------------

    elif (
        row["anomaly"] == 1 or
        row["risk_score"] >= 70
    ):
        return "medium"

    # -----------------------------------
    # Normal
    # -----------------------------------

    return "normal"
df["severity"] = df.apply(classify_severity, axis=1)

df["health_score"] = 100 - (
    df["risk_score"] +
    (df["anomaly"] * 10)
)

df["health_score"] = (
    df["health_score"]
    .clip(lower=0, upper=100)
)


# Save final output with severity
df.to_csv("../data/final_hvac_analysis.csv", index=False)

print("\nFinal anomaly data with severity saved to '../data/final_hvac_analysis.csv'.")


