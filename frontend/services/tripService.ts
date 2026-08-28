import { Trip } from "@/lib/types";

/* ─── Types ──────────────────────────────────────────────────────────── */

export interface TripInput {
  destination:  string;
  days:         number;
  budget:       number;
  travel_style: string;
}

export interface BudgetUpdateInput {
  budget: number;
}

export interface DeleteResponse {
  message: string;
}

/* ─── Base URL ───────────────────────────────────────────────────────── */
/*
 * In the browser, requests go through Next.js rewrites (/api/v1/* → :8000).
 * NEXT_PUBLIC_API_URL can override this for e.g. a deployed environment
 * where the rewrite is not available.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

/* ─── Helpers ────────────────────────────────────────────────────────── */

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    // Surface FastAPI error detail when available
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

/* ─── Service ────────────────────────────────────────────────────────── */

export const tripService = {
  /** Fetch all trips */
  getTrips(): Promise<Trip[]> {
    return request<Trip[]>("/api/v1/trips");
  },

  /** Fetch a single trip by id */
  getTrip(id: number): Promise<Trip> {
    return request<Trip>(`/api/v1/trips/${id}`);
  },

  /** Create a new trip and get AI itinerary */
  createTrip(data: TripInput): Promise<Trip> {
    return request<Trip>("/api/v1/trips", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  },

  /** Update the budget of an existing trip (re-runs AI) */
  updateBudget(id: number, data: BudgetUpdateInput): Promise<Trip> {
    return request<Trip>(`/api/v1/trips/${id}`, {
      method: "PUT",
      body:   JSON.stringify(data),
    });
  },

  /** Delete a trip */
  deleteTrip(id: number): Promise<DeleteResponse> {
    return request<DeleteResponse>(`/api/v1/trips/${id}`, {
      method: "DELETE",
    });
  },

  /** Re-generate the AI itinerary for an existing trip */
  generateItinerary(id: number): Promise<Trip> {
    return request<Trip>(`/api/v1/trips/${id}/generate`, {
      method: "POST",
    });
  },
};
