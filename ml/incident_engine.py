import pandas as pd
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv("../backend/.env")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Maintenance Copilot",
    }
)

def generate_ai_analysis(incident):
    prompt = f"""
    You are a Senior Industrial HVAC Engineer.
    Analyze this incident and provide professional, high-signal insights.
    
    UNIT: {incident['unit_id']}
    ISSUE: {incident['primary_issue']}
    SYMPTOMS: {incident['symptoms']}
    SEVERITY: {incident['severity']}
    
    Return ONLY JSON:
    {{
      "summary": "Professional technical summary focusing on root cause (max 15 words).",
      "impact": "Detailed operational risk assessment (max 25 words).",
      "guidance": [
        "Expert action item 1",
        "Expert action item 2",
        "Expert action item 3"
      ]
    }}
    
    Rules:
    - NO boilerplate like 'Unit is exhibiting...'
    - Be extremely professional and specific.
    - Focus on mechanical/electrical logic.
    """
    try:
        # Use absolute path for .env to avoid issues
        env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
        load_dotenv(env_path)
        
        # Re-init client to ensure API key is loaded
        client.api_key = os.getenv("OPENROUTER_API_KEY")

        response = client.chat.completions.create(
            model="openrouter/auto",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1, max_tokens=150
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"): content = content[7:-3].strip()
        if content.startswith("```"): content = content[3:-3].strip()
        return json.loads(content)
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        return {"summary": "System alert detected.", "impact": "Possible degradation.", "guidance": ["Inspect unit"]}

# -----------------------------------
# Load Data
# -----------------------------------

df = pd.read_csv("../data/final_hvac_analysis.csv")

# Convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"])

# -----------------------------------
# Keep Only Important Rows
# -----------------------------------

incident_rows = df[
    df["severity"] != "normal"
].copy()

incident_rows = incident_rows.sort_values(
    by=["unit_id", "timestamp"]
)

# -----------------------------------
# Incident Grouping Logic
# -----------------------------------

incidents = []

MAX_GAP_MINUTES = 15

current_incident = None

for _, row in incident_rows.iterrows():

    timestamp = row["timestamp"]

    # Start first incident
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

    # Same HVAC?
    same_unit = (
        row["unit_id"] ==
        current_incident["unit_id"]
    )

    # Time gap
    time_gap = (
        timestamp -
        current_incident["end_time"]
    ).total_seconds() / 60

    # Extend incident
    if same_unit and time_gap <= MAX_GAP_MINUTES:

        current_incident["end_time"] = timestamp

        current_incident["max_risk_score"] = max(
            current_incident["max_risk_score"],
            row["risk_score"]
        )

        current_incident["anomaly_detected"] = max(
            current_incident["anomaly_detected"],
            row["anomaly"]
        )

        # Severity escalation
        severity_priority = {
            "normal": 0,
            "medium": 1,
            "high": 2,
            "critical": 3
        }

        current_level = severity_priority[
            current_incident["max_severity"]
        ]

        new_level = severity_priority[
            row["severity"]
        ]

        if new_level > current_level:
            current_incident["max_severity"] = (
                row["severity"]
            )

        current_incident["events"].append(row)

    # Create new incident
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

# -----------------------------------
# Incident Intelligence Layer
# -----------------------------------

incident_summaries = []

for incident in incidents:

    events = incident["events"]

    # -----------------------------------
    # Peak Operational Metrics
    # -----------------------------------

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

    max_pressure = max(
        e["pressure"] for e in events
    )

    # -----------------------------------
    # Symptoms
    # -----------------------------------

    symptoms = []

    if max_vibration > 0.08:
        symptoms.append("high vibration")

    if min_airflow < 250:
        symptoms.append("low airflow")

    if max_temp > 28:
        symptoms.append("high temperature")

    if max_power > 7:
        symptoms.append("high power consumption")

    # -----------------------------------
    # Failure Mode Scoring
    # -----------------------------------

    mechanical_score = 0
    thermal_score = 0
    airflow_score = 0

    # Mechanical degradation

    if max_vibration > 0.15:
        mechanical_score += 5

    elif max_vibration > 0.08:
        mechanical_score += 3

    if min_airflow < 250:
        mechanical_score += 2

    if max_power > 6:
        mechanical_score += 1

    # Thermal overload

    if max_temp > 35:
        thermal_score += 6

    elif max_temp > 30:
        thermal_score += 4

    if max_power > 7:
        thermal_score += 2

    if incident["anomaly_detected"]:
        thermal_score += 1

    # Airflow restriction

    if min_airflow < 220:
        airflow_score += 5

    elif min_airflow < 250:
        airflow_score += 3

    if max_temp > 28:
        airflow_score += 1

    # -----------------------------------
    # Primary Failure Mode
    # -----------------------------------

    scores = {
        "Possible fan or motor degradation": mechanical_score,
        "Possible overheating or compressor strain": thermal_score,
        "Possible airflow blockage or restriction": airflow_score
    }

    # -----------------------------------
    # Primary Failure Determination
    # -----------------------------------

    # Thermal override
    if max_temp > 35:

        primary_issue = (
            "Possible overheating or compressor strain"
        )

    # Severe airflow collapse + vibration
    elif (
        max_vibration > 0.15 and
        min_airflow < 220
    ):

        primary_issue = (
            "Possible fan or motor degradation"
        )

    # Airflow restriction
    elif (
        min_airflow < 220 and
        max_vibration < 0.08
    ):

        primary_issue = (
            "Possible airflow blockage or restriction"
        )

    # Otherwise fallback to scores
    else:

        primary_issue = max(
            scores,
            key=scores.get
        )

    # -----------------------------------
    # Contributing Factors
    # -----------------------------------

    contributing_factors = []

    if (
        primary_issue !=
        "Possible fan or motor degradation"
        and mechanical_score >= 3
    ):
        contributing_factors.append(
            "Mechanical instability indicators"
        )

    if (
        primary_issue !=
        "Possible overheating or compressor strain"
        and thermal_score >= 3
    ):
        contributing_factors.append(
            "Thermal stress indicators"
        )

    if (
        primary_issue !=
        "Possible airflow blockage or restriction"
        and airflow_score >= 3
    ):
        contributing_factors.append(
            "Airflow degradation indicators"
        )

    # -----------------------------------
    # Confidence Score
    # -----------------------------------

    confidence = min(
        95,
        int(55 + incident["max_risk_score"] / 2)
    )

    # -----------------------------------
    # Technician Recommendation
    # -----------------------------------

    recommendation = (
        "Inspect HVAC system."
    )

    if (
        incident["max_severity"] == "critical"
    ):

        if (
            "overheating"
            in primary_issue
        ):
            recommendation = (
                "Immediate inspection recommended. "
                "Potential compressor or thermal overload risk detected."
            )

        elif (
            "fan or motor"
            in primary_issue
        ):
            recommendation = (
                "Immediate inspection recommended. "
                "Severe mechanical degradation indicators detected."
            )

    elif (
        incident["max_severity"] == "high"
    ):

        recommendation = (
            "Priority maintenance inspection recommended. "
            "Sustained degradation patterns detected."
        )

    elif (
        incident["max_severity"] == "medium"
    ):

        recommendation = (
            "Monitor system behavior closely. "
            "Behavioral anomalies detected."
        )

    # -----------------------------------
    # AI Analysis Integration
    # -----------------------------------
    ai_analysis = generate_ai_analysis({
        "unit_id": incident["unit_id"],
        "severity": incident["max_severity"],
        "primary_issue": primary_issue,
        "symptoms": ", ".join(symptoms),
        "risk_score": incident["max_risk_score"]
    })

    # -----------------------------------
    # Final Incident Summary
    # -----------------------------------

    summary = {
        "unit_id": incident["unit_id"],
        "start_time": incident["start_time"],
        "end_time": incident["end_time"],
        "severity": incident["max_severity"],
        "risk_score": incident["max_risk_score"],
        "confidence": confidence,
        "primary_issue": primary_issue,
        "contributing_factors": ", ".join(contributing_factors),
        "symptoms": ", ".join(symptoms),
        "recommendation": recommendation,
        "ai_summary": ai_analysis["summary"],
        "ai_impact": ai_analysis["impact"],
        "ai_guidance": ", ".join(ai_analysis["guidance"]),
        "duration_minutes": round((incident["end_time"] - incident["start_time"]).total_seconds() / 60, 2),

        "max_vibration":
            round(max_vibration, 4),

        "min_airflow":
            round(min_airflow, 2),

        "max_temperature":
            round(max_temp, 2),

        "max_power":
            round(max_power, 2),

        "max_pressure":
            round(max_pressure, 2)
    }

    incident_summaries.append(summary)

# -----------------------------------
# Save Incident Intelligence
# -----------------------------------

incidents_df = pd.DataFrame(
    incident_summaries
)

incidents_df.to_csv(
    "../data/incidents.csv",
    index=False
)

print("\nIncident summaries saved.")
print("\nIncident Overview:")
print(incidents_df)