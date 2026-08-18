from pydantic import BaseModel
from fastapi import FastAPI

class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float


app = FastAPI()


# a GET endpoint at the root path
@app.get("/")
def home():
    return {
        "message": "Welcome to KelanaAI"
    }

# GET Health endpoint at the root path
@app.get("/health")
def home():
    return {"status": "OK"}


# GET endpoint — returns recommended tourist places
@app.get("/api/v1/recommendations")
def get_recommendations(destination: str = "Japan"):
    return get_recommended_places(destination)


# GET endpoint — returns transportation recommendation
# @app.get("/api/v1/transportations")
# def get_transportations(category: str):
#     return get_transportation_recommendation(category)
@app.get("/api/v1/transportations")
def get_transportations():
    categories = ["Backpacker", "Standard", "Luxury"]

    return [
        get_transportation_recommendation(category)
        for category in categories
    ]


from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
    get_transportation_recommendation,
    get_recommended_places
)


# POST endpoint — receives JSON, returns JSON
@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(
        request.budget, request.days
    )

    category = get_trip_category(
        request.budget
    )

    return {
        "destination": request.destination,
        "budget": request.budget,
        "daily_budget": daily_budget,
        "category": category,
    }