import { Calendar } from "lucide-react";

export interface DaySection {
  heading: string;  // e.g. "Morning", "Afternoon", "Evening"
  bullets: string[];
}

export interface DayData {
  day:      number;
  title:    string;
  sections: DaySection[];
}

interface DayCardProps {
  data:         DayData;
  /** Index for staggered animation delay (optional) */
  index?:       number;
}

/**
 * Renders a single day's itinerary as a self-contained card.
 * Receives pre-parsed DayData so it has no parsing logic.
 */
export default function DayCard({ data, index = 0 }: DayCardProps) {
  return (
    <article
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Day header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-700 text-white shrink-0">
          <Calendar size={14} strokeWidth={2.2} />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
            Day {data.day}
          </p>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
            {data.title}
          </h3>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4 p-5">
        {data.sections.map((section) => (
          <div key={section.heading}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-400 mb-2">
              {section.heading}
            </p>
            <ul className="flex flex-col gap-1.5">
              {section.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="mt-[0.45rem] shrink-0 w-1 h-1 rounded-full bg-amber-600" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}
