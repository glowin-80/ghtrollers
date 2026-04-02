"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Avbryt",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#d8d2c7] bg-white p-5 shadow-2xl">
        <h3 className="text-xl font-bold text-[#1f2937]">{title}</h3>
        <p className="mt-3 text-sm text-[#4b5563]">{description}</p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-[#324b2f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Jobbar..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
