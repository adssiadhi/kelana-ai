import DayCard, { DayData, DaySection } from "./DayCard";

/* ─── Markdown parser ────────────────────────────────────────────────── */

function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g,     "$1")
    .replace(/\*(.+?)\*/g,     "$1")
    .replace(/_(.+?)_/g,       "$1")
    .replace(/`(.+?)`/g,       "$1")
    .trim();
}

/**
 * Parses the AI recommendation markdown into DayData objects.
 *
 * Expected structure:
 *   ## Day N: Title
 *   **Morning:**
 *   - bullet
 *   **Afternoon:**
 *   - bullet
 *   **Evening:**
 *   - bullet
 */
function parseIntoDays(raw: string): DayData[] {
  const days: DayData[] = [];
  let currentDay:     DayData | null = null;
  let currentSection: DaySection | null = null;

  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;

    /* ── Day heading: ## Day N: Title ── */
    const dayMatch = t.match(/^#{1,3}\s+Day\s+(\d+)[:\s–-]*(.*)/i);
    if (dayMatch) {
      if (currentDay) {
        if (currentSection) { currentDay.sections.push(currentSection); currentSection = null; }
        days.push(currentDay);
      }
      currentDay = { day: parseInt(dayMatch[1], 10), title: stripInline(dayMatch[2] || `Day ${dayMatch[1]}`), sections: [] };
      continue;
    }

    /* ── Generic heading (non-day) ── */
    const headingMatch = t.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (!currentDay) continue;
      if (currentSection) { currentDay.sections.push(currentSection); }
      currentSection = { heading: stripInline(headingMatch[1]), bullets: [] };
      continue;
    }

    /* ── Bold section label: **Morning:** ── */
    const boldMatch = t.match(/^\*\*(.+?)\*\*:?$/);
    if (boldMatch) {
      if (!currentDay) continue;
      if (currentSection) { currentDay.sections.push(currentSection); }
      currentSection = { heading: stripInline(boldMatch[1]), bullets: [] };
      continue;
    }

    /* ── Bullet point ── */
    const bulletMatch = t.match(/^(?:[-*]|\d+\.)\s+(.+)/);
    if (bulletMatch) {
      const text = stripInline(bulletMatch[1]);
      if (currentSection) {
        currentSection.bullets.push(text);
      } else if (currentDay) {
        /* No section open yet — create a default one */
        currentSection = { heading: "Details", bullets: [text] };
      }
      continue;
    }

    /* ── Plain paragraph — attach to current section or day ── */
    if (currentSection) {
      currentSection.bullets.push(stripInline(t));
    }
  }

  /* Flush last day */
  if (currentDay) {
    if (currentSection) currentDay.sections.push(currentSection);
    days.push(currentDay);
  }

  return days;
}

/* ─── Component ──────────────────────────────────────────────────────── */

interface MarkdownItineraryProps {
  markdown: string;
}

/**
 * Renders AI-generated markdown itinerary as structured DayCard components.
 * Falls back to plain pre-formatted text if no Day headings are found.
 */
export default function MarkdownItinerary({ markdown }: MarkdownItineraryProps) {
  const days = parseIntoDays(markdown);

  /* ── Structured view: one DayCard per day ── */
  if (days.length > 0) {
    return (
      <div className="flex flex-col gap-4" aria-label="Day-by-day itinerary">
        {days.map((day, i) => (
          <DayCard key={day.day} data={day} index={i} />
        ))}
      </div>
    );
  }

  /* ── Fallback: render line-by-line for non-standard formats ── */
  return (
    <FallbackItinerary markdown={markdown} />
  );
}

/* ─── Fallback ───────────────────────────────────────────────────────── */

type FallbackLine =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "bullet";            text: string }
  | { type: "para";              text: string };

function parseFallback(raw: string): FallbackLine[] {
  const out: FallbackLine[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const hm = t.match(/^(#{1,3})\s+(.+)/);
    if (hm) {
      const level = hm[1].length;
      out.push({ type: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text: stripInline(hm[2]) });
      continue;
    }
    const bm = t.match(/^(?:[-*]|\d+\.)\s+(.+)/);
    if (bm) { out.push({ type: "bullet", text: stripInline(bm[1]) }); continue; }
    out.push({ type: "para", text: stripInline(t) });
  }
  return out;
}

function FallbackItinerary({ markdown }: { markdown: string }) {
  const lines = parseFallback(markdown);
  return (
    <div className="flex flex-col gap-1.5 text-sm text-slate-700 dark:text-slate-300">
      {lines.map((line, i) => {
        if (line.type === "h1") return (
          <p key={i} className="mt-6 mb-1 first:mt-0 text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {line.text}
          </p>
        );
        if (line.type === "h2") return (
          <p key={i} className="mt-4 mb-0.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
            {line.text}
          </p>
        );
        if (line.type === "h3") return (
          <p key={i} className="mt-3 text-xs font-semibold tracking-[0.1em] uppercase text-slate-400 dark:text-slate-500">
            {line.text}
          </p>
        );
        if (line.type === "bullet") return (
          <div key={i} className="flex items-start gap-2.5 leading-relaxed pl-2">
            <span className="mt-[0.42rem] shrink-0 w-1 h-1 rounded-full bg-amber-600" />
            <span>{line.text}</span>
          </div>
        );
        return <p key={i} className="leading-relaxed">{line.text}</p>;
      })}
    </div>
  );
}
