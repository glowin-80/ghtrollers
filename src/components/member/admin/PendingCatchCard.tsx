"use client";

import {
  formatBytes,
  getCompressionReduction,
  getPendingCatchFishLabel,
  type PendingCatch,
} from "@/lib/admin-tools";

type PendingCatchCardProps = {
  item: PendingCatch;
  workingKey: string | null;
  onApprove: (catchId: string) => void;
  onReject: (catchId: string) => void;
};

export default function PendingCatchCard({
  item,
  workingKey,
  onApprove,
  onReject,
}: PendingCatchCardProps) {
  const fishLabel = getPendingCatchFishLabel(item);
  const reduction = getCompressionReduction(
    item.original_image_size_bytes,
    item.compressed_image_size_bytes
  );

  const isApproving = workingKey === `catch-approve-${item.id}`;
  const isRejecting = workingKey === `catch-reject-${item.id}`;

  return (
    <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt="Fångstbild"
            className="h-32 w-full rounded-2xl object-cover lg:w-40"
          />
        ) : null}

        <div className="flex-1">
          <div className="text-lg font-bold text-[#1f2937]">{item.caught_for}</div>

          <div className="mt-1 text-sm text-[#6b7280]">
            Registrerad av {item.registered_by}
          </div>

          <div className="mt-3 grid gap-2 text-sm text-[#374151] md:grid-cols-2">
            <div>
              <span className="font-semibold">Art:</span> {fishLabel}
            </div>
            <div>
              <span className="font-semibold">Vikt:</span> {item.weight_g} g
            </div>
            <div>
              <span className="font-semibold">Datum:</span> {item.catch_date}
            </div>
            <div>
              <span className="font-semibold">Plats:</span> {item.location_name || "Ej angiven"}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#e5ded2] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">
            <div>
              <span className="font-semibold">Före:</span> {formatBytes(item.original_image_size_bytes)}
            </div>
            <div>
              <span className="font-semibold">Efter:</span> {formatBytes(item.compressed_image_size_bytes)}
            </div>
            <div>
              <span className="font-semibold">Minskning:</span> {reduction !== null ? `${reduction}% mindre` : "Saknas"}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onApprove(item.id)}
              disabled={isApproving}
              className="min-w-[148px] rounded-full bg-[#324b2f] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApproving ? "Godkänner..." : "Godkänn fångst"}
            </button>

            <button
              type="button"
              onClick={() => onReject(item.id)}
              disabled={isRejecting}
              className="min-w-[110px] rounded-full border border-red-200 bg-white px-4 py-2 text-center text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRejecting ? "Jobbar..." : "Ta bort"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}