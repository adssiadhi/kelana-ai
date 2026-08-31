import os
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr, ConfigDict

from models.trip import Trip
from models.user import User
from database import SessionLocal, init_db
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
)
from services.bedrock_service import get_ai_recommendation
from services.auth_service import (
    register_user,
    login_user,
    get_current_user,
    get_db,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ── Pydantic response schemas ─────────────────────────────────────────────────

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:         int
    name:       str
    email:      str
    created_at: Optional[datetime] = None


class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:                int
    user_id:           Optional[int] = None
    destination:       str
    days:              int
    budget:            float
    travel_style:      str
    category:          str
    daily_budget:      float
    ai_recommendation: Optional[str] = None
    created_at:        Optional[datetime] = None


class TokenOut(BaseModel):
    access_token: str
    token_type:   str


# ── Pydantic request schemas ──────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:     str       = Field(min_length=1, max_length=100)
    email:    EmailStr
    password: str       = Field(min_length=6)


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TripRequest(BaseModel):
    destination:  str
    days:         int   = Field(gt=0)
    budget:       float = Field(ge=0)
    travel_style: str   = "General"


class TripBudgetUpdateRequest(BaseModel):
    budget: float = Field(ge=0)


# ── Auth endpoints ────────────────────────────────────────────────────────────

@app.post("/api/v1/auth/register", status_code=201, response_model=UserOut)
def register(request: RegisterRequest, db=Depends(get_db)):
    try:
        user = register_user(db, name=request.name, email=str(request.email), password=request.password)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))
    return user


@app.post("/api/v1/auth/login", response_model=TokenOut)
def login(request: LoginRequest, db=Depends(get_db)):
    try:
        token_data = login_user(db, email=str(request.email), password=request.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    return token_data


@app.get("/api/v1/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ── Helper ────────────────────────────────────────────────────────────────────

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


# ── Trip endpoints (JWT-protected) ────────────────────────────────────────────

@app.post("/api/v1/trips", response_model=TripOut)
def create_trip(
    request: TripRequest,
    current_user: User = Depends(get_current_user),
):
    daily_budget      = calculate_daily_budget(request.budget, request.days)
    category          = get_trip_category(request.budget)
    ai_recommendation = generate_ai_recommendation_or_502(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        travel_style=request.travel_style,
    )

    trip = Trip(
        user_id=current_user.id,
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


@app.get("/api/v1/trips", response_model=list[TripOut])
def list_trips(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
    db.close()
    return trips


@app.get("/api/v1/trips/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    db  = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip


@app.put("/api/v1/trips/{trip_id}", response_model=TripOut)
def update_trip_budget(
    trip_id: int,
    request: TripBudgetUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    db   = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    category          = get_trip_category(request.budget)
    daily_budget      = calculate_daily_budget(request.budget, trip.days)
    ai_recommendation = generate_ai_recommendation_or_502(
        destination=trip.destination,
        days=trip.days,
        budget=request.budget,
        travel_style=trip.travel_style,
    )

    trip.budget           = request.budget
    trip.category         = category
    trip.daily_budget     = daily_budget
    trip.ai_recommendation = ai_recommendation

    db.commit()
    db.refresh(trip)
    db.close()
    return trip


@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    db   = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()

    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    db.delete(trip)
    db.commit()
    db.close()
    return {"message": f"Trip with id {trip_id} deleted successfully"}


@app.post("/api/v1/trips/{trip_id}/generate", response_model=TripOut)
def generate_trip_recommendation(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    db   = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    ai_rec = get_ai_recommendation(
        days=trip.days,
        destination=trip.destination,
        budget=trip.budget,
        travel_style=trip.travel_style,
    )

    trip.ai_recommendation = ai_rec
    db.commit()
    db.refresh(trip)
    db.close()
    return trip
