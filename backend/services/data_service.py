import pandas as pd

INCIDENTS_PATH = "../data/incidents.csv"
ANALYSIS_PATH = "../data/final_hvac_analysis.csv"


def load_incidents():
    return pd.read_csv(INCIDENTS_PATH)


def load_analysis():
    return pd.read_csv(ANALYSIS_PATH)


def get_all_units():
    df = load_analysis()
    return df["unit_id"].unique().tolist()

def get_health_scores():

    df = load_analysis()
    incidents = load_incidents()

    latest = (
        df.sort_values("timestamp")
        .groupby("unit_id")
        .tail(1)
    )

    health_data = []

    for _, row in latest.iterrows():

        unit = row["unit_id"]

        health = row["health_score"]

        unit_incidents = incidents[
            incidents["unit_id"] == unit
        ]

        # Penalize recent incidents
        for _, incident in unit_incidents.iterrows():

            severity = incident["severity"]

            if severity == "critical":
                health -= 40

            elif severity == "high":
                health -= 25

            elif severity == "medium":
                health -= 10

        health = max(0, min(100, health))

        if health >= 90:
            severity = "normal"

        elif health >= 65:
            severity = "monitor"

        elif health >= 25:
            severity = "degraded"

        else:
            severity = "critical"

        health_data.append({
            "unit_id": unit,
            "health_score": health,
            "severity": severity,
            "avg_temp": row["temp"],
            "avg_airflow": row["airflow"],
            "avg_vibration": row["vibration"],
            "avg_power": row["power"],
        })

    return health_data