"use client";

type InlineMessageVariant = "info" | "success" | "error";

type InlineMessageProps = {
  variant: InlineMessageVariant;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
};

const variantClasses: Record<InlineMessageVariant, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  success: "border-green-200 bg-green-50 text-green-700",
  error: "border-red-200 bg-red-50 text-red-700",
};

export default function InlineMessage({
  variant,
  message,
  actionLabel,
  onAction,
  onDismiss,
}: InlineMessageProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">{message}</div>

        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold opacity-80 transition hover:opacity-100"
            aria-label="Stäng meddelande"
          >
            ✕
          </button>
        ) : null}
      </div>

      {actionLabel && onAction ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={onAction}
            className="rounded-full border border-current px-4 py-2 text-xs font-semibold transition hover:bg-white/60"
          >
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}