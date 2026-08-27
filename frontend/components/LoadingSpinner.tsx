import { Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "AI is crafting your itinerary…",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className="flex flex-col items-center justify-center gap-5 py-16 px-8 text-center"
    >
      {/* Animated rings */}
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Outer ring */}
        <span className="absolute inset-0 rounded-full border-2 border-amber-200 dark:border-amber-900 animate-ping opacity-60" />
        {/* Mid ring */}
        <span className="absolute inset-2 rounded-full border-2 border-amber-300 dark:border-amber-700 animate-ping opacity-40 [animation-delay:0.3s]" />
        {/* Icon core */}
        <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-700 text-white shadow-md">
          <Sparkles size={18} strokeWidth={2} className="animate-pulse" />
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {message}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This usually takes 10–20 seconds
        </p>
      </div>

      {/* Shimmer bar */}
      <div className="w-48 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-amber-600 animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
