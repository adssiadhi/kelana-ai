import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorMessage({
  message,
  onRetry,
  onDismiss,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 px-5 py-4"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
          <AlertTriangle size={16} strokeWidth={2.2} />
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-0.5">
            Something went wrong
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed break-words">
            {message}
          </p>
        </div>

        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="shrink-0 p-1 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Retry */}
      {onRetry && (
        <div className="mt-3 pl-11">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 transition-colors"
          >
            <RefreshCw size={13} strokeWidth={2.2} />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
