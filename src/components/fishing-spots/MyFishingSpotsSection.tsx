"use client";

import type { FishingSpot } from "@/types/fishing-spots";

type MyFishingSpotsSectionProps = {
  loading: boolean;
  error: string | null;
  spots: FishingSpot[];
};

function getStatusLabel(spot: FishingSpot) {
  if (spot.status === "approved") {
    return {
      text: "Godkänd",
      className: "bg-green-100 text-green-800 border border-green-200",
    };
  }

  return {
    text: "Väntar på admin",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  };
}

export default function MyFishingSpotsSection({
  loading,
  error,
  spots,
}: MyFishingSpotsSectionProps) {
  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2937]">🧭 Mina fiskeplatser</h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            Här ser du dina inskickade fiskeplatser och om de väntar på godkännande eller redan är publicerade.
          </p>
        </div>

        <div className="rounded-2xl border border-[#d8d2c7] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">
          Totalt sparade: <span className="font-bold text-[#1f2937]">{spots.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
          Laddar dina fiskeplatser...
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error && spots.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
          Du har inte sparat några fiskeplatser ännu.
        </div>
      ) : null}

      {!loading && !error && spots.length > 0 ? (
        <div className="mt-5 space-y-4">
          {spots.map((spot) => {
            const status = getStatusLabel(spot);

            return (
              <div
                key={spot.id}
                className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-bold text-[#1f2937]">
                      {spot.title?.trim() || "Namnlös fiskeplats"}
                    </div>

                    <div className="mt-1 text-sm text-[#6b7280]">
                      {new Date(spot.created_at).toLocaleString("sv-SE")}
                    </div>
                  </div>

                  <span className={["inline-flex rounded-full px-3 py-1 text-xs font-semibold", status.className].join(" ")}>
                    {status.text}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-[#374151] md:grid-cols-2">
                  <div>
                    <span className="font-semibold">Koordinater:</span>{" "}
                    {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}
                  </div>

                  <div>
                    <span className="font-semibold">Skapad av:</span> {spot.created_by_name}
                  </div>
                </div>

                {spot.notes?.trim() ? (
                  <div className="mt-4 rounded-2xl border border-[#e5ded2] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">
                    {spot.notes}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
