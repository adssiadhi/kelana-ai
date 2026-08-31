/* ─── Auth ───────────────────────────────────────────────────────────── */

export interface User {
  id:         number;
  name:       string;
  email:      string;
  created_at?: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type:   string;
}

export interface LoginInput {
  email:    string;
  password: string;
}

export interface RegisterInput {
  name:     string;
  email:    string;
  password: string;
}

/* ─── Core domain types ──────────────────────────────────────────────── */

export interface Trip {
  id:                number;
  user_id?:          number | null;
  destination:       string;
  days:              number;
  budget:            number;
  travel_style:      TravelStyle;
  category:          TripCategory;
  daily_budget:      number;
  ai_recommendation: string;
  created_at?:       string;
}

export type TripCategory = "Backpacker" | "Standard" | "Luxury";

export type TravelStyle =
  | "Family"
  | "Couple"
  | "Solo";

/* ─── Form state ─────────────────────────────────────────────────────── */

export interface TripFormValues {
  destination:  string;
  days:         string;
  budget:       string;
  travel_style: TravelStyle;
}

export const INITIAL_FORM: TripFormValues = {
  destination:  "",
  days:         "",
  budget:       "",
  travel_style: "Family",
};

/* ─── Constants ──────────────────────────────────────────────────────── */

export const TRAVEL_STYLES: TravelStyle[] = ["Family", "Couple", "Solo"];

export const CATEGORY_COLORS: Record<TripCategory, string> = {
  Backpacker: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Standard:   "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300",
  Luxury:     "bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300",
};

export const STYLE_EMOJI: Record<TravelStyle, string> = {
  Family: "👨‍👩‍👧‍👦",
  Couple: "💑",
  Solo:   "🎒",
};

export const FEATURED_DESTINATIONS = [
  { name: "Bali",      country: "Indonesia", emoji: "🌺" },
  { name: "Tokyo",     country: "Japan",     emoji: "⛩️" },
  { name: "Paris",     country: "France",    emoji: "🗼" },
  { name: "Singapore", country: "Singapore", emoji: "🦁" },
  { name: "New York",  country: "USA",       emoji: "🗽" },
  { name: "Rome",      country: "Italy",     emoji: "🏛️" },
];
