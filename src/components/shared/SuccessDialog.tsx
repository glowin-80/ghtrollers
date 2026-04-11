"use client";

type SuccessDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

export default function SuccessDialog({
  open,
  title,
  description,
  confirmLabel = "Ok",
  onConfirm,
}: SuccessDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#d8d2c7] bg-white p-5 shadow-2xl">
        <h3 className="text-xl font-bold text-[#1f2937]">{title}</h3>
        <p className="mt-3 text-sm text-[#4b5563]">{description}</p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-[#324b2f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
