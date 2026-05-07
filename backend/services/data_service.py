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

    latest = (
        df.sort_values("timestamp")
        .groupby("unit_id")
        .tail(1)
    )

    return latest[
        [
            "unit_id",
            "health_score",
            "severity"
        ]
    ].to_dict(orient="records")