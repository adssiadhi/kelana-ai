"use client";

import { useState } from "react";

interface TripResult {
  id: number;
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
  category: string;
  daily_budget: number;
  ai_recommendation: string;
}

interface FormState {
  destination: string;
  budget: string;
  days: string;
  travel_style: string;
}

const INITIAL_FORM: FormState = {
  destination: "",
  budget: "",
  days: "",
  travel_style: "General",
};

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<TripResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: form.destination,
          budget: Number(form.budget),
          days: Number(form.days),
          travel_style: form.travel_style,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail ?? `Request failed with status ${response.status}`);
      }

      const trip: TripResult = await response.json();
      setResult(trip);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-12 bg-background text-foreground">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-2 tracking-tight">KelanaAI</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-10 text-base">
        AI-powered travel itinerary planner
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-4 bg-white dark:bg-zinc-900 shadow-md rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="destination" className="text-sm font-medium">
            Destination
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            required
            placeholder="e.g. Bali, Indonesia"
            value={form.destination}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="days" className="text-sm font-medium">
            Number of Days
          </label>
          <input
            id="days"
            name="days"
            type="number"
            required
            min={1}
            placeholder="e.g. 5"
            value={form.days}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="budget" className="text-sm font-medium">
            Budget (USD)
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            required
            min={0}
            placeholder="e.g. 2000"
            value={form.budget}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="travel_style" className="text-sm font-medium">
            Travel Style
          </label>
          <select
            id="travel_style"
            name="travel_style"
            value={form.travel_style}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400"
          >
            <option value="General">General</option>
            <option value="Adventure">Adventure</option>
            <option value="Relaxation">Relaxation</option>
            <option value="Cultural">Cultural</option>
            <option value="Family">Family</option>
            <option value="Budget">Budget</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-foreground text-background py-2.5 text-sm font-semibold hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {loading ? "Planning your trip…" : "Plan My Trip"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 w-full max-w-md rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 px-5 py-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <section className="mt-8 w-full max-w-2xl bg-white dark:bg-zinc-900 shadow-md rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">
            Your {result.days}-Day Trip to {result.destination}
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <Stat label="Total Budget" value={`USD ${result.budget.toLocaleString()}`} />
            <Stat label="Daily Budget" value={`USD ${result.daily_budget.toLocaleString()}`} />
            <Stat label="Category" value={result.category} />
            <Stat label="Travel Style" value={result.travel_style} />
          </div>

          <h3 className="text-base font-semibold mb-2">AI Itinerary</h3>
          <Itinerary text={result.ai_recommendation} />
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-xl bg-zinc-50 dark:bg-zinc-800 px-4 py-3">
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-medium mt-0.5">{value}</span>
    </div>
  );
}

// Strip all markdown syntax from a single line of text
function stripInlineMarkdown(text: string): string {
  return (
    text
      // bold **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/__(.+?)__/g, "$1")
      // italic *text* or _text_
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      // inline code `text`
      .replace(/`(.+?)`/g, "$1")
      // trim leftover whitespace
      .trim()
  );
}

type ParsedLine =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "bullet"; text: string }
  | { type: "paragraph"; text: string };

// Split the raw markdown string into structured lines
function parseRecommendation(raw: string): ParsedLine[] {
  const lines = raw.split(/\r?\n/);
  const result: ParsedLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // skip empty lines
    if (!trimmed) continue;

    // heading: ### / ## / #
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      result.push({ type: "heading", level, text: stripInlineMarkdown(headingMatch[2]) });
      continue;
    }

    // bullet: lines starting with - , * , or a number like "1."
    const bulletMatch = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)/);
    if (bulletMatch) {
      result.push({ type: "bullet", text: stripInlineMarkdown(bulletMatch[1]) });
      continue;
    }

    // everything else is a paragraph
    result.push({ type: "paragraph", text: stripInlineMarkdown(trimmed) });
  }

  return result;
}

function Itinerary({ text }: { text: string }) {
  const lines = parseRecommendation(text);

  return (
    <div className="flex flex-col gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
      {lines.map((line, i) => {
        if (line.type === "heading") {
          const baseClass = "font-semibold text-zinc-900 dark:text-zinc-100 mt-4 mb-1";
          if (line.level === 1)
            return <p key={i} className={`${baseClass} text-base`}>{line.text}</p>;
          if (line.level === 2)
            return <p key={i} className={`${baseClass} text-sm`}>{line.text}</p>;
          return <p key={i} className={`${baseClass} text-xs uppercase tracking-wide`}>{line.text}</p>;
        }

        if (line.type === "bullet") {
          return (
            <div key={i} className="flex gap-2 leading-6">
              <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 self-start translate-y-1.5" />
              <span>{line.text}</span>
            </div>
          );
        }

        return <p key={i} className="leading-6">{line.text}</p>;
      })}
    </div>
  );
}
