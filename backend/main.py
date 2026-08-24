from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from models.trip import Trip
from database import SessionLocal, init_db
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
)
from services.bedrock_service import get_ai_recommendation

app = FastAPI()

init_db()


class TripRequest(BaseModel):
    destination: str
    days: int = Field(gt=0)
    budget: float = Field(ge=0)
    travel_style: str = "General"


class TripBudgetUpdateRequest(BaseModel):
    budget: float = Field(ge=0)


def generate_ai_recommendation_or_502(
    destination: str,
    days: int,
    budget: float,
    travel_style: str,
) -> str:
    try:
        return get_ai_recommendation(
            destination=destination,
            days=days,
            budget=budget,
            travel_style=travel_style,
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to generate AI recommendation: {exc}"
        ) from exc


@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    ai_recommendation = generate_ai_recommendation_or_502(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        travel_style=request.travel_style,
    )

    trip = Trip(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        travel_style=request.travel_style,
        category=category,
        daily_budget=daily_budget,
        ai_recommendation=ai_recommendation,
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip


@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()

    return trips


@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    return trip


@app.put("/api/v1/trips/{trip_id}")
def update_trip_budget(trip_id: int, request: TripBudgetUpdateRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    category = get_trip_category(request.budget)
    daily_budget = calculate_daily_budget(request.budget, trip.days)
    ai_recommendation = generate_ai_recommendation_or_502(
        destination=trip.destination,
        days=trip.days,
        budget=request.budget,
        travel_style=trip.travel_style,
    )

    trip.budget = request.budget
    trip.category = category
    trip.daily_budget = daily_budget
    trip.ai_recommendation = ai_recommendation

    db.commit()
    db.refresh(trip)
    db.close()

    return trip


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    db.delete(trip)
    db.commit()
    db.close()

    return {"message": f"Trip with id {trip_id} deleted successfully"}
