from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.data_service import (
    load_incidents,
    get_health_scores,
    get_all_units
)

app = FastAPI(
    title="AI Maintenance Copilot API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Maintenance Copilot API"
    }


@app.get("/incidents")
def get_incidents():

    incidents = load_incidents()

    return incidents.to_dict(orient="records")


@app.get("/health")
def get_health():

    return get_health_scores()


@app.get("/units")
def get_units():

    return get_all_units()