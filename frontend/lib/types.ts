/* ─── Core domain types ──────────────────────────────────────────────── */

export interface Trip {
  id: number;
  destination: string;
  days: number;
  budget: number;
  travel_style: TravelStyle;
  category: TripCategory;
  daily_budget: number;
  ai_recommendation: string;
}

export type TripCategory = "Backpacker" | "Standard" | "Luxury";

export type TravelStyle =
  | "Family"
  | "Couple"
  | "Solo";

/* ─── Form state ─────────────────────────────────────────────────────── */

export interface TripFormValues {
  destination: string;
  days: string;
  budget: string;
  travel_style: TravelStyle;
}

export const INITIAL_FORM: TripFormValues = {
  destination: "",
  days: "",
  budget: "",
  travel_style: "Family",
};

/* ─── Constants ──────────────────────────────────────────────────────── */

export const TRAVEL_STYLES: TravelStyle[] = [
  "Family",
  "Couple",
  "Solo",
];

/** Maps category → Tailwind colour classes for badge rendering */
export const CATEGORY_COLORS: Record<TripCategory, string> = {
  Backpacker: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Standard:   "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300",
  Luxury:     "bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300",
};

/** Maps travel style → emoji for visual flair */
export const STYLE_EMOJI: Record<TravelStyle, string> = {
  Family: "👨‍👩‍👧‍👦",
  Couple: "💑",
  Solo:   "🎒",
};

export const FEATURED_DESTINATIONS = [
  { name: "Bali",      country: "Indonesia",  emoji: "🌺" },
  { name: "Tokyo",     country: "Japan",      emoji: "⛩️" },
  { name: "Paris",     country: "France",     emoji: "🗼" },
  { name: "Singapore", country: "Singapore",  emoji: "🦁" },
  { name: "New York",  country: "USA",        emoji: "🗽" },
  { name: "Rome",      country: "Italy",      emoji: "🏛️" },
];
