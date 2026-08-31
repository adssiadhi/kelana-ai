import { Trip } from "@/lib/types";
import { getToken } from "@/lib/auth";

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

/* ─── Helper ─────────────────────────────────────────────────────────── */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const { headers: callerHeaders, ...restInit } = init ?? {};

  const res = await fetch(path, {
    ...restInit,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(callerHeaders as Record<string, string> ?? {}),
    },
  });

  if (!res.ok) {
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
  getTrips(): Promise<Trip[]> {
    return request<Trip[]>("/api/trips");
  },

  getTrip(id: number): Promise<Trip> {
    return request<Trip>(`/api/trips/${id}`);
  },

  createTrip(data: TripInput): Promise<Trip> {
    return request<Trip>("/api/trips", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  },

  updateBudget(id: number, data: BudgetUpdateInput): Promise<Trip> {
    return request<Trip>(`/api/trips/${id}`, {
      method: "PUT",
      body:   JSON.stringify(data),
    });
  },

  deleteTrip(id: number): Promise<DeleteResponse> {
    return request<DeleteResponse>(`/api/trips/${id}`, {
      method: "DELETE",
    });
  },

  generateItinerary(id: number): Promise<Trip> {
    return request<Trip>(`/api/trips/${id}/generate`, {
      method: "POST",
    });
  },
};
