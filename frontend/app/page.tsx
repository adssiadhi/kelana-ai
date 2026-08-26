"use client";

import { useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */

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

/* ─── Page ───────────────────────────────────────────────────────────── */

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
        throw new Error(
          err.detail ?? `Request failed with status ${response.status}`
        );
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
    <main className="flex flex-col items-center min-h-screen w-full bg-background">

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Content below hero ── */}
      <div className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 py-16">

        {/* ── Form card ── */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full max-w-md gap-6 bg-surface rounded-2xl p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
        {/* Destination — always full width */}
        <Field label="Destination" htmlFor="destination">
          <input
            id="destination"
            name="destination"
            type="text"
            required
            placeholder="e.g. Bali, Indonesia"
            value={form.destination}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        {/*
         * Days + Budget:
         * Mobile  → flex-col (each input full width, stacked)
         * sm+     → flex-row (side by side, equal width)
         */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Field label="Days" htmlFor="days" className="flex-1">
            <input
              id="days"
              name="days"
              type="number"
              required
              min={1}
              placeholder="e.g. 5"
              value={form.days}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Budget (USD)" htmlFor="budget" className="flex-1">
            <input
              id="budget"
              name="budget"
              type="number"
              required
              min={0}
              placeholder="e.g. 2000"
              value={form.budget}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Travel style — always full width */}
        <Field label="Travel Style" htmlFor="travel_style">
          <select
            id="travel_style"
            name="travel_style"
            value={form.travel_style}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="General">General</option>
            <option value="Adventure">Adventure</option>
            <option value="Relaxation">Relaxation</option>
            <option value="Cultural">Cultural</option>
            <option value="Family">Family</option>
            <option value="Budget">Budget</option>
            <option value="Luxury">Luxury</option>
          </select>
        </Field>

        {/* Submit — full width */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 h-11 rounded-xl bg-accent text-white text-sm font-semibold tracking-wide hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition-all duration-150"
        >
          {loading ? "Planning your trip…" : "Plan My Trip"}
        </button>
      </form>

      {/* ── Error ── */}
      {error && (
        <div
          role="alert"
          className="flex w-full max-w-md mt-8 rounded-2xl bg-red-50 dark:bg-red-950/40 px-6 py-4 text-sm text-red-700 dark:text-red-300 leading-relaxed"
        >
          {error}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <section
          className="flex flex-col w-full max-w-2xl mt-8 bg-surface rounded-2xl p-6 sm:p-8"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary text-balance mb-8">
            Your {result.days}-Day Trip to{" "}
            <span className="text-accent">{result.destination}</span>
          </h2>

          {/*
           * Stats:
           * Mobile  → flex-col (each stat card full width, stacked)
           * sm+     → 2-column grid
           */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-8">
            <Stat
              label="Total Budget"
              value={`USD ${result.budget.toLocaleString()}`}
            />
            <Stat
              label="Daily Budget"
              value={`USD ${result.daily_budget.toLocaleString()}`}
            />
            <Stat label="Category" value={result.category} />
            <Stat label="Travel Style" value={result.travel_style} />
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-border mb-8" />

          {/* Itinerary */}
          <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-6">
            AI Itinerary
          </h3>
          <Itinerary text={result.ai_recommendation} />
        </section>
      )}

      </div>
    </main>
  );
}

/* ─── Hero Section ───────────────────────────────────────────────────── */

function HeroSection() {
  return (
    /*
     * min-h-[80vh] gives cinematic presence.
     * overflow-hidden clips any SVG elements that bleed outside.
     * bg-surface-raised is the solid base — the gradient fades from this
     * color to transparent so the SVG shows subtly underneath the text area.
     */
    <section
      className="relative w-full min-h-[80vh] flex items-center overflow-hidden bg-surface-raised"
      aria-label="Hero — KelanaAI travel planner"
    >
      {/* ── Layer 1: SVG illustration at ~13% opacity ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <TravelIllustration />
      </div>

      {/*
       * ── Layer 2: gradient overlay ──
       * Fades from solid background color (left / bottom) to transparent
       * so the illustration is fully suppressed behind the text column
       * and gradually revealed toward the edges.
       * Combined effective contrast of text against bg exceeds 7:1 (WCAG AAA).
       */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(105deg, var(--background) 38%, transparent 72%), " +
            "linear-gradient(to top, var(--background) 0%, transparent 40%)",
        }}
        aria-hidden="true"
      />

      {/* ── Layer 3: text content ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-24 sm:py-32">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-5">
            AI Travel Planner
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-text-primary text-balance leading-[1.1] mb-6">
            Your next adventure,{" "}
            <span className="text-accent">planned by AI.</span>
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-text-secondary max-w-md">
            Tell KelanaAI where you want to go and get a personalised
            day-by-day itinerary — tailored to your budget and travel style.
          </p>

          {/* Scroll cue */}
          <div className="mt-12 flex items-center gap-3 text-xs text-text-muted">
            <span className="inline-block w-8 h-px bg-text-muted" />
            Scroll to plan your trip
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Travel SVG Illustration ────────────────────────────────────────── */
/*
 * Pure inline SVG — no external files, no network requests.
 * All strokes use currentColor so they inherit from a parent with
 * opacity:0.13, keeping every element at the same low opacity level
 * without per-element tweaking.
 *
 * Elements:
 *   • Terrain contour lines (organic, nested closed paths)
 *   • Dashed great-circle flight path arcs
 *   • Compass rose (outer ring + cardinal spokes + needle)
 *   • Location pin landmarks (simple pin silhouettes)
 *   • Subtle dot grid to suggest a map background
 */
function TravelIllustration() {
  return (
    <svg
      viewBox="0 0 1200 700"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      /* All children inherit this color; opacity set per logical group */
      style={{ color: "var(--text-primary)" }}
      aria-hidden="true"
      focusable="false"
    >

      {/* ── Dot grid — map background ── */}
      <g opacity="0.07">
        {Array.from({ length: 18 }, (_, row) =>
          Array.from({ length: 32 }, (_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 40 + 10}
              cy={row * 40 + 10}
              r="1.2"
              fill="currentColor"
            />
          ))
        )}
      </g>

      {/* ── Terrain contour lines — slowly drifting ── */}
      <g
        className="hero-drift"
        opacity="0.13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Outermost contour */}
        <path d="M820,60 C900,40 1010,80 1080,140 C1140,195 1160,280 1130,350 C1100,420 1020,460 940,450 C860,440 790,390 760,320 C730,250 750,160 820,60 Z" />
        {/* Mid contour */}
        <path d="M850,110 C910,95 990,125 1040,175 C1085,220 1100,290 1075,345 C1050,400 985,430 915,422 C845,414 790,372 768,313 C748,255 768,175 850,110 Z" />
        {/* Inner contour */}
        <path d="M880,160 C925,148 985,170 1015,210 C1045,248 1050,300 1028,338 C1006,375 955,395 900,388 C845,381 808,348 796,304 C784,262 800,190 880,160 Z" />
        {/* Peak */}
        <path d="M925,220 C950,212 978,225 990,250 C1002,275 994,305 972,318 C950,331 920,324 906,302 C892,280 898,238 925,220 Z" />

        {/* Second mountain cluster — left side */}
        <path d="M60,180 C110,140 200,155 260,205 C315,250 330,320 300,375 C270,428 200,448 140,428 C80,408 40,350 38,290 C36,232 60,180 60,180 Z" />
        <path d="M90,215 C130,185 200,196 245,235 C285,272 295,330 270,372 C245,413 188,428 138,412 C90,396 60,348 60,296 C60,246 90,215 90,215 Z" />
        <path d="M125,258 C155,238 198,248 225,275 C250,300 255,342 235,368 C215,394 172,402 140,388 C108,374 94,340 97,306 C100,274 125,258 125,258 Z" />

        {/* Rolling hills — bottom band */}
        <path d="M0,560 Q150,490 300,540 Q450,590 600,530 Q750,470 900,520 Q1050,570 1200,510" />
        <path d="M0,600 Q180,545 360,580 Q540,618 720,565 Q900,512 1080,555 Q1140,572 1200,548" />
        <path d="M0,640 Q200,600 400,625 Q600,650 800,608 Q1000,566 1200,595" />
      </g>

      {/* ── Flight path arcs ── */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.15"
        strokeDasharray="6 5"
      >
        {/* Arc 1: left cluster → right cluster */}
        <path
          className="hero-dash"
          style={{ strokeDashoffset: 600 }}
          d="M175,300 Q480,80 960,280"
        />
        {/* Arc 2: bottom-left → top-right */}
        <path
          className="hero-dash"
          style={{ strokeDashoffset: 600, animationDelay: "0.8s" }}
          d="M80,500 Q400,200 780,150"
        />
        {/* Arc 3: cross arc */}
        <path
          className="hero-dash"
          style={{ strokeDashoffset: 600, animationDelay: "1.4s" }}
          d="M300,580 Q700,320 1100,420"
        />
      </g>

      {/* ── Airplane icons along arc 1 ── */}
      <g opacity="0.14" fill="currentColor">
        {/* Plane silhouette at midpoint of arc 1 (approx 560, 148) */}
        <g transform="translate(548,144) rotate(-18)">
          <path d="M0,-5 L2,2 L8,3 L8,5 L2,4 L1,8 L3,9 L3,10 L0,9 L-3,10 L-3,9 L-1,8 L-2,4 L-8,5 L-8,3 L-2,2 Z" />
        </g>
        {/* Plane at midpoint of arc 2 (approx 430,322) */}
        <g transform="translate(418,318) rotate(-35)">
          <path d="M0,-5 L2,2 L8,3 L8,5 L2,4 L1,8 L3,9 L3,10 L0,9 L-3,10 L-3,9 L-1,8 L-2,4 L-8,5 L-8,3 L-2,2 Z" />
        </g>
      </g>

      {/* ── Compass rose — top-right quadrant ── */}
      <g
        transform="translate(1100,110)"
        opacity="0.13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        {/* Outer ring */}
        <circle className="hero-spin-slow" cx="0" cy="0" r="52" strokeDasharray="4 6" style={{ transformOrigin: "0 0" }} />
        {/* Mid ring */}
        <circle cx="0" cy="0" r="38" />
        {/* Inner ring */}
        <circle cx="0" cy="0" r="10" />

        {/* Cardinal spokes */}
        <line x1="0" y1="-52" x2="0" y2="-38" strokeWidth="2" />
        <line x1="0" y1="38"  x2="0" y2="52"  strokeWidth="2" />
        <line x1="-52" y1="0" x2="-38" y2="0" strokeWidth="2" />
        <line x1="38"  y1="0" x2="52"  y2="0" strokeWidth="2" />

        {/* Ordinal ticks */}
        <line x1="27" y1="-27" x2="36" y2="-36" />
        <line x1="27" y1="27"  x2="36" y2="36"  />
        <line x1="-27" y1="27" x2="-36" y2="36" />
        <line x1="-27" y1="-27" x2="-36" y2="-36" />

        {/* Compass needle — north (filled) */}
        <polygon fill="currentColor" stroke="none" points="0,-36 -5,0 0,-8 5,0" />
        {/* Compass needle — south (outline) */}
        <polygon fill="none" stroke="currentColor" strokeWidth="1" points="0,36 -5,0 0,8 5,0" />

        {/* N label */}
        <text
          x="0" y="-58"
          textAnchor="middle"
          fontSize="9"
          fontFamily="inherit"
          fill="currentColor"
          stroke="none"
          fontWeight="600"
          letterSpacing="0.05em"
        >N</text>
      </g>

      {/* ── Location pin landmarks ── */}
      <g fill="currentColor" stroke="none">
        {/* Pin helper: cx cy = pin tip; the icon extends upward */}
        {[
          { cx: 175, cy: 305, delay: "0s"    },
          { cx: 960, cy: 282, delay: "0.7s"  },
          { cx: 780, cy: 155, delay: "1.3s"  },
          { cx: 300, cy: 582, delay: "0.4s"  },
          { cx: 620, cy: 400, delay: "1.8s"  },
        ].map(({ cx, cy, delay }, i) => (
          <g
            key={i}
            className="hero-pulse-soft"
            style={{ animationDelay: delay, transformOrigin: `${cx}px ${cy}px` }}
            transform={`translate(${cx},${cy - 20})`}
          >
            {/* Pin head circle */}
            <circle cx="0" cy="-8" r="7" opacity="0.18" />
            {/* Pin body */}
            <path d="M0,0 C-7,-4 -7,-12 0,-20 C7,-12 7,-4 0,0 Z" opacity="0.13" />
            {/* Inner dot */}
            <circle cx="0" cy="-12" r="2.5" opacity="0.22" />
          </g>
        ))}
      </g>

      {/* ── Subtle longitude / latitude grid lines ── */}
      <g
        opacity="0.06"
        stroke="currentColor"
        fill="none"
        strokeWidth="0.8"
      >
        {/* Verticals */}
        {[200, 400, 600, 800, 1000].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="700" />
        ))}
        {/* Horizontals */}
        {[140, 280, 420, 560].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="1200" y2={y} />
        ))}
        {/* Diagonal great-circle curve suggestion */}
        <path d="M0,350 Q300,200 600,350 Q900,500 1200,350" />
        <path d="M0,250 Q300,100 600,250 Q900,400 1200,250" />
      </g>

    </svg>
  );
}

/* ─── Shared input style ─────────────────────────────────────────────── */

const inputClass =
  "w-full rounded-xl bg-surface-raised text-text-primary placeholder:text-text-muted " +
  "px-4 py-3 text-sm outline-none transition-shadow duration-150 " +
  "focus:ring-2 focus:ring-accent/40 focus:bg-surface " +
  "border-0 appearance-none";

/* ─── Field wrapper ──────────────────────────────────────────────────── */

function Field({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold tracking-wide uppercase text-text-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-2xl bg-surface-raised px-5 py-4">
      <span className="text-xs text-text-muted mb-1">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

/* ─── Itinerary renderer ─────────────────────────────────────────────── */

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

type ParsedLine =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "bullet"; text: string }
  | { type: "paragraph"; text: string };

function parseRecommendation(raw: string): ParsedLine[] {
  const lines = raw.split(/\r?\n/);
  const result: ParsedLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      result.push({
        type: "heading",
        level,
        text: stripInlineMarkdown(headingMatch[2]),
      });
      continue;
    }

    const bulletMatch = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)/);
    if (bulletMatch) {
      result.push({ type: "bullet", text: stripInlineMarkdown(bulletMatch[1]) });
      continue;
    }

    result.push({ type: "paragraph", text: stripInlineMarkdown(trimmed) });
  }

  return result;
}

function Itinerary({ text }: { text: string }) {
  const lines = parseRecommendation(text);

  return (
    <div className="flex flex-col gap-2">
      {lines.map((line, i) => {
        if (line.type === "heading") {
          if (line.level === 1) {
            return (
              <p
                key={i}
                className="mt-6 mb-1 text-base font-semibold tracking-tight text-text-primary"
              >
                {line.text}
              </p>
            );
          }
          if (line.level === 2) {
            return (
              <p
                key={i}
                className="mt-4 mb-1 text-sm font-semibold text-accent"
              >
                {line.text}
              </p>
            );
          }
          return (
            <p
              key={i}
              className="mt-3 text-xs font-semibold tracking-[0.12em] uppercase text-text-muted"
            >
              {line.text}
            </p>
          );
        }

        if (line.type === "bullet") {
          return (
            <div key={i} className="flex items-start gap-3 leading-relaxed">
              <span className="mt-[0.45rem] shrink-0 w-1 h-1 rounded-full bg-accent" />
              <span className="text-sm text-text-secondary">{line.text}</span>
            </div>
          );
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-text-secondary">
            {line.text}
          </p>
        );
      })}
    </div>
  );
}
