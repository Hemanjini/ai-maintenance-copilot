import pandas as pd

# Load analyzed data
df = pd.read_csv("../data/final_hvac_analysis.csv")

# Convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Keep only risky rows
incident_rows = df[
    (df["severity"] != "normal")
].copy()

# Sort properly
incident_rows = incident_rows.sort_values(
    by=["unit_id", "timestamp"]
)

incidents = []

# Time gap threshold
MAX_GAP_MINUTES = 15

current_incident = None

for _, row in incident_rows.iterrows():

    timestamp = row["timestamp"]

    if current_incident is None:
        current_incident = {
            "unit_id": row["unit_id"],
            "start_time": timestamp,
            "end_time": timestamp,
            "max_risk_score": row["risk_score"],
            "max_severity": row["severity"],
            "anomaly_detected": row["anomaly"],
            "events": [row]
        }
        continue

    # Check same HVAC
    same_unit = (
        row["unit_id"] ==
        current_incident["unit_id"]
    )

    # Check time proximity
    time_gap = (
        timestamp -
        current_incident["end_time"]
    ).total_seconds() / 60

    if same_unit and time_gap <= MAX_GAP_MINUTES:

        # Extend incident
        current_incident["end_time"] = timestamp

        current_incident["max_risk_score"] = max(
            current_incident["max_risk_score"],
            row["risk_score"]
        )

        current_incident["anomaly_detected"] = max(
            current_incident["anomaly_detected"],
            row["anomaly"]
        )

        current_incident["events"].append(row)

    else:
        incidents.append(current_incident)

        current_incident = {
            "unit_id": row["unit_id"],
            "start_time": timestamp,
            "end_time": timestamp,
            "max_risk_score": row["risk_score"],
            "max_severity": row["severity"],
            "anomaly_detected": row["anomaly"],
            "events": [row]
        }

# Save last incident
if current_incident:
    incidents.append(current_incident)

print(f"\nTotal Incidents: {len(incidents)}")

incident_summaries = []

for incident in incidents:
    events = incident["events"]
    
    # Extract peak values for the summary
    max_vibration = max(e["vibration"] for e in events)
    min_airflow = min(e["airflow"] for e in events)
    max_temp = max(e["temp"] for e in events)
    max_power = max(e["power"] for e in events)

    symptoms = []
    if max_vibration > 0.08:
        symptoms.append("high vibration")
    if min_airflow < 250:
        symptoms.append("low airflow")
    if max_temp > 28:
        symptoms.append("high temperature")
    if max_power > 7:
        symptoms.append("high power consumption")

    # Automated diagnosis logic
    likely_issue = "General system anomaly"
    if "high vibration" in symptoms and "low airflow" in symptoms:
        likely_issue = "Possible fan or motor degradation"
    elif "high temperature" in symptoms and "high power consumption" in symptoms:
        likely_issue = "Possible overheating or compressor strain"

    # Confidence score based on risk intensity
    confidence = min(95, 50 + incident["max_risk_score"] // 2)

    summary = {
        "unit_id": incident["unit_id"],
        "start_time": incident["start_time"],
        "end_time": incident["end_time"],
        "severity": incident["max_severity"],
        "risk_score": incident["max_risk_score"],
        "confidence": f"{confidence}%",
        "likely_issue": likely_issue,
        "symptoms": ", ".join(symptoms),
        "duration_minutes": round((incident["end_time"] - incident["start_time"]).total_seconds() / 60, 2)
    }
    incident_summaries.append(summary)

# Convert to DataFrame and Save
incidents_df = pd.DataFrame(incident_summaries)
incidents_df.to_csv("../data/incidents.csv", index=False)

print("\nIncident summaries saved to '../data/incidents.csv'.")
print("\nIncident Overview:")
print(incidents_df)

incident_summaries = []

for incident in incidents:

    events = incident["events"]

    max_vibration = max(
        e["vibration"] for e in events
    )

    min_airflow = min(
        e["airflow"] for e in events
    )

    max_temp = max(
        e["temp"] for e in events
    )

    max_power = max(
        e["power"] for e in events
    )

    symptoms = []

    if max_vibration > 0.08:
        symptoms.append("high vibration")

    if min_airflow < 250:
        symptoms.append("low airflow")

    if max_temp > 28:
        symptoms.append("high temperature")

    if max_power > 7:
        symptoms.append("high power consumption")

    # Determine likely issue
    likely_issue = "General system anomaly"

    if (
        "high vibration" in symptoms and
        "low airflow" in symptoms
    ):
        likely_issue = (
            "Possible fan or motor degradation"
        )

    elif (
        "high temperature" in symptoms and
        "high power consumption" in symptoms
    ):
        likely_issue = (
            "Possible overheating or compressor strain"
        )

    confidence = min(
        95,
        50 + incident["max_risk_score"] // 2
    )

    summary = {
        "unit_id": incident["unit_id"],
        "start_time": incident["start_time"],
        "end_time": incident["end_time"],
        "severity": incident["max_severity"],
        "risk_score": incident["max_risk_score"],
        "confidence": confidence,
        "likely_issue": likely_issue,
        "symptoms": symptoms,
        "duration_minutes": (
            incident["end_time"] -
            incident["start_time"]
        ).total_seconds() / 60
    }

    incident_summaries.append(summary)

    incidents_df = pd.DataFrame(incident_summaries)

incidents_df.to_csv(
    "../data/incidents.csv",
    index=False
)

print("\nIncident summaries saved.")
print("\nIncident Overview:")
print(incidents_df)