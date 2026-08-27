"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";
import TravelForm from "@/components/TravelForm";
import TripCard from "@/components/TripCard";
import { Trip } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [latestTrip, setLatestTrip] = useState<Trip | null>(null);

  function handleSuccess(trip: Trip) {
    setLatestTrip(trip);
    // scroll to result
    setTimeout(() => {
      document
        .getElementById("trip-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <main className="flex flex-col w-full">

      {/* ── Hero ── */}
      <Hero />

      {/* ── Form section ── */}
      <section
        id="plan"
        className="w-full bg-background"
        aria-labelledby="form-heading"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-16">
          <div className="flex flex-col items-center gap-3 mb-10 text-center">
            <h2
              id="form-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              Plan your trip
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm sm:text-base leading-relaxed">
              Fill in the details below and our AI will generate a complete
              day-by-day itinerary for you in seconds.
            </p>
          </div>

          <TravelForm onSuccess={handleSuccess} />
        </div>
      </section>

      {/* ── Latest result ── */}
      {latestTrip && (
        <section
          id="trip-result"
          className="w-full bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
          aria-label="Your generated trip"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Your trip is ready!
              </h2>
              <button
                onClick={() => router.push("/trips")}
                className="text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                View all my trips →
              </button>
            </div>

            <div className="max-w-sm">
              <TripCard
                trip={latestTrip}
                onDelete={() => setLatestTrip(null)}
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
