import { Compass } from "lucide-react";
import { FEATURED_DESTINATIONS } from "@/lib/types";

export default function Hero() {
  return (
    <section
      className="relative w-full min-h-[72vh] flex items-center overflow-hidden bg-slate-50 dark:bg-slate-950"
      aria-label="KelanaAI — AI travel planner hero"
    >
      {/* ── Layer 1: SVG illustration ── */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <TravelSVG />
      </div>

      {/* ── Layer 2: gradient — kills illustration behind text ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(110deg, var(--tw-gradient-from, #f8fafc) 40%, transparent 68%)," +
            "linear-gradient(to top, var(--tw-gradient-from, #f8fafc) 0%, transparent 35%)",
        }}
        aria-hidden="true"
      />
      {/* Dark-mode version of the same gradient */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{
          background:
            "linear-gradient(110deg,#020617 40%,transparent 68%)," +
            "linear-gradient(to top,#020617 0%,transparent 35%)",
        }}
        aria-hidden="true"
      />

      {/* ── Layer 3: content ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-20 sm:py-28 flex flex-col gap-8">

        {/* Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-700 text-white shadow-sm">
            <Compass size={14} strokeWidth={2.3} />
          </span>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400">
            AI Travel Planner
          </p>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-4 max-w-xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance leading-[1.08]">
            Your next adventure,{" "}
            <span className="text-amber-700 dark:text-amber-400">
              planned by AI.
            </span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-md">
            Tell KelanaAI where you want to go and get a personalised
            day-by-day itinerary — tailored to your budget and travel style.
          </p>
        </div>

        {/* Featured destinations */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Popular destinations
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATURED_DESTINATIONS.map((d) => (
              <span
                key={d.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <span role="img" aria-hidden="true">{d.emoji}</span>
                {d.name}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-4">
          <span className="w-8 h-px bg-slate-300 dark:bg-slate-700" />
          Scroll down to plan your trip
        </div>
      </div>
    </section>
  );
}

/* ─── Inline SVG illustration ────────────────────────────────────────── */

function TravelSVG() {
  return (
    <svg
      viewBox="0 0 1200 680"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      style={{ color: "#1e293b" }}   /* slate-800 — adapts with opacity */
      aria-hidden="true"
      focusable="false"
    >
      {/* Dot grid */}
      <g opacity="0.06">
        {Array.from({ length: 17 }, (_, r) =>
          Array.from({ length: 31 }, (_, c) => (
            <circle key={`${r}-${c}`} cx={c * 40 + 10} cy={r * 40 + 10} r="1.3" fill="currentColor" />
          ))
        )}
      </g>

      {/* Lat/lng lines */}
      <g opacity="0.055" stroke="currentColor" fill="none" strokeWidth="0.8">
        {[160, 320, 480, 560].map((y) => <line key={y} x1="0" y1={y} x2="1200" y2={y} />)}
        {[240, 480, 720, 960].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="680" />)}
        <path d="M0,340 Q300,200 600,340 Q900,480 1200,340" />
      </g>

      {/* Terrain contours — right cluster */}
      <g opacity="0.11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M800,40 C890,20 1010,65 1080,130 C1148,195 1165,285 1130,358 C1096,430 1012,468 928,456 C845,444 775,390 752,318 C729,246 748,158 800,40 Z" />
        <path d="M828,88 C902,72 998,108 1054,164 C1108,218 1120,294 1092,352 C1064,410 992,440 920,430 C848,420 793,376 772,314 C752,254 770,170 828,88 Z" />
        <path d="M868,145 C924,132 992,160 1026,205 C1060,250 1066,308 1040,350 C1014,390 956,408 896,398 C836,388 800,350 790,304 C780,260 798,185 868,145 Z" />
        <path d="M916,215 C948,206 978,222 992,250 C1006,278 998,312 974,326 C950,340 918,330 904,308 C890,286 896,238 916,215 Z" />
      </g>

      {/* Terrain contours — left cluster */}
      <g opacity="0.11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M55,170 C105,132 200,148 262,198 C322,248 338,322 304,376 C270,430 198,450 135,430 C72,410 36,350 36,286 C36,224 55,170 55,170 Z" />
        <path d="M86,208 C128,178 202,192 246,232 C288,272 298,334 270,374 C242,414 186,428 136,412 C86,396 60,348 60,296 C60,246 86,208 86,208 Z" />
        <path d="M126,256 C156,238 200,248 224,276 C248,304 252,344 232,370 C212,396 170,404 138,390 C106,376 94,340 98,306 C102,272 126,256 126,256 Z" />
      </g>

      {/* Rolling hills */}
      <g opacity="0.09" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M0,550 Q150,488 300,535 Q455,582 610,525 Q762,468 916,515 Q1058,558 1200,506" />
        <path d="M0,595 Q180,548 360,578 Q542,612 722,562 Q902,512 1082,552 Q1142,568 1200,546" />
        <path d="M0,636 Q205,598 410,622 Q612,648 806,606 Q1000,564 1200,592" />
      </g>

      {/* Flight arcs */}
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.13" strokeDasharray="6 5">
        <path d="M170,295 Q476,78 955,272" />
        <path d="M78,495 Q400,196 776,146" style={{ animationDelay: "0.8s" }} />
        <path d="M298,572 Q698,316 1098,416" style={{ animationDelay: "1.4s" }} />
      </g>

      {/* Plane icons */}
      <g opacity="0.13" fill="currentColor">
        <g transform="translate(546,142) rotate(-18)">
          <path d="M0,-5 L2,2 L8,3 L8,5 L2,4 L1,8 L3,9 L3,10 L0,9 L-3,10 L-3,9 L-1,8 L-2,4 L-8,5 L-8,3 L-2,2 Z" />
        </g>
        <g transform="translate(416,316) rotate(-35)">
          <path d="M0,-5 L2,2 L8,3 L8,5 L2,4 L1,8 L3,9 L3,10 L0,9 L-3,10 L-3,9 L-1,8 L-2,4 L-8,5 L-8,3 L-2,2 Z" />
        </g>
      </g>

      {/* Compass rose */}
      <g transform="translate(1090,105)" opacity="0.12" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="0" cy="0" r="50" strokeDasharray="4 6" />
        <circle cx="0" cy="0" r="36" />
        <circle cx="0" cy="0" r="9" />
        <line x1="0" y1="-50" x2="0" y2="-36" strokeWidth="2" />
        <line x1="0" y1="36" x2="0" y2="50" strokeWidth="2" />
        <line x1="-50" y1="0" x2="-36" y2="0" strokeWidth="2" />
        <line x1="36" y1="0" x2="50" y2="0" strokeWidth="2" />
        <line x1="25" y1="-25" x2="34" y2="-34" />
        <line x1="25" y1="25" x2="34" y2="34" />
        <line x1="-25" y1="25" x2="-34" y2="34" />
        <line x1="-25" y1="-25" x2="-34" y2="-34" />
        <polygon fill="currentColor" stroke="none" points="0,-34 -5,0 0,-8 5,0" />
        <polygon fill="none" stroke="currentColor" strokeWidth="1" points="0,34 -5,0 0,8 5,0" />
        <text x="0" y="-56" textAnchor="middle" fontSize="9" fontFamily="inherit" fill="currentColor" stroke="none" fontWeight="600">N</text>
      </g>

      {/* Location pins */}
      <g fill="currentColor" stroke="none" opacity="0.14">
        {[
          [173, 295], [953, 272], [776, 148],
          [298, 572], [618, 398],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx},${cy - 20})`}>
            <circle cx="0" cy="-8" r="7" opacity="0.9" />
            <path d="M0,0 C-7,-4 -7,-12 0,-20 C7,-12 7,-4 0,0 Z" opacity="0.7" />
            <circle cx="0" cy="-12" r="2.5" fill="white" opacity="0.9" />
          </g>
        ))}
      </g>
    </svg>
  );
}
