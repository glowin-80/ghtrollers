"use client";

import { useEffect, useState } from "react";

type LocationMethodModalProps = {
  open: boolean;
  initialLocationName: string;
  gpsLoading: boolean;
  onClose: () => void;
  onSelectManual: (value: string) => void;
  onSelectGps: () => void;
  onSelectMap: () => void;
};

export default function LocationMethodModal({
  open,
  initialLocationName,
  gpsLoading,
  onClose,
  onSelectManual,
  onSelectGps,
  onSelectMap,
}: LocationMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<"manual" | null>(null);
  const [manualLocation, setManualLocation] = useState(initialLocationName);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedMethod(null);
    setManualLocation(initialLocationName);
  }, [initialLocationName, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-[28px] border border-[#d8d2c7] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-[#1f2937]">Välj platsmetod</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d8d2c7] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
          >
            Stäng
          </button>
        </div>

        <p className="mt-3 text-sm text-[#4b5563]">
          Välj hur du vill ange plats för fångsten.
        </p>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => setSelectedMethod("manual")}
            className="rounded-2xl border border-[#d8d2c7] bg-white px-4 py-4 text-left text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
          >
            ✍️ Fri text
          </button>

          <button
            type="button"
            onClick={onSelectGps}
            disabled={gpsLoading}
            className="rounded-2xl border border-[#d8d2c7] bg-white px-4 py-4 text-left text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {gpsLoading ? "📍 Hämtar GPS..." : "📍 GPS"}
          </button>

          <button
            type="button"
            onClick={onSelectMap}
            className="rounded-2xl border border-[#d8d2c7] bg-white px-4 py-4 text-left text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
          >
            🗺️ Karta
          </button>
        </div>

        {selectedMethod === "manual" ? (
          <div className="mt-5 space-y-3 rounded-2xl border border-[#d8d2c7] bg-[#f8f5ef] p-4">
            <label
              htmlFor="manual-location-name"
              className="block text-sm font-semibold text-[#4b5563]"
            >
              Ange plats i fri text
            </label>

            <input
              id="manual-location-name"
              type="text"
              value={manualLocation}
              onChange={(event) => setManualLocation(event.target.value)}
              placeholder="Till exempel Mälaren, bryggan i norr"
              className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
              autoFocus
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedMethod(null)}
                className="rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
              >
                Tillbaka
              </button>

              <button
                type="button"
                onClick={() => onSelectManual(manualLocation)}
                className="rounded-2xl bg-[#1f46d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264fe6]"
              >
                Spara plats
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}