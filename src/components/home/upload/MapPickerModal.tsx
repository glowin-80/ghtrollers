"use client";

import MapPicker from "@/components/MapPicker";

type MapPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
};

export default function MapPickerModal({
  open,
  onClose,
  onSelect,
}: MapPickerModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-[28px] border border-[#d8d2c7] bg-white p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-[#1f2937]">Välj plats på karta</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d8d2c7] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
          >
            Stäng
          </button>
        </div>

        <MapPicker onSelect={onSelect} />
      </div>
    </div>
  );
}
