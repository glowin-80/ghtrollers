"use client";

import type { PendingFishingSpot } from "@/lib/fishing-spots";

type PendingFishingSpotCardProps = {
  item: PendingFishingSpot;
  workingKey: string | null;
  onApprove: (spotId: string, reviewType: PendingFishingSpot["review_type"]) => void;
  onReject: (spotId: string, reviewType: PendingFishingSpot["review_type"]) => void;
};

export default function PendingFishingSpotCard({
  item,
  workingKey,
  onApprove,
  onReject,
}: PendingFishingSpotCardProps) {
  const isEdit = item.review_type === "edit";

  return (
    <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="text-lg font-bold text-[#1f2937]">
            {item.title?.trim() || "Namnlös fiskeplats"}
          </div>

          <div className="mt-1 text-sm text-[#6b7280]">Inskickad av {item.created_by_name}</div>

          <div className="mt-3 grid gap-2 text-sm text-[#374151] md:grid-cols-2">
            <div>
              <span className="font-semibold">Latitude:</span> {item.latitude.toFixed(6)}
            </div>
            <div>
              <span className="font-semibold">Longitude:</span> {item.longitude.toFixed(6)}
            </div>
            <div>
              <span className="font-semibold">Skapad:</span>{" "}
              {new Date(item.created_at).toLocaleString("sv-SE")}
            </div>
            <div>
              <span className="font-semibold">Ärende:</span>{" "}
              {isEdit ? "Väntande ändring" : "Ny fiskeplats"}
            </div>
          </div>

          {item.notes?.trim() ? (
            <div className="mt-4 rounded-2xl border border-[#e5ded2] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">
              {item.notes}
            </div>
          ) : null}

          {isEdit &&
          item.pending_latitude !== null &&
          item.pending_latitude !== undefined &&
          item.pending_longitude !== null &&
          item.pending_longitude !== undefined ? (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <div className="font-semibold">Föreslagen ändring</div>
              <div className="mt-2">
                <span className="font-medium">Koordinater:</span>{" "}
                {item.pending_latitude.toFixed(6)}, {item.pending_longitude.toFixed(6)}
              </div>
              {item.pending_title?.trim() ? (
                <div className="mt-1">
                  <span className="font-medium">Rubrik:</span> {item.pending_title}
                </div>
              ) : null}
              {item.pending_notes?.trim() ? (
                <div className="mt-1 whitespace-pre-wrap">
                  <span className="font-medium">Anteckning:</span> {item.pending_notes}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onApprove(item.id, item.review_type)}
            disabled={workingKey === `spot-approve-${item.id}`}
            className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {workingKey === `spot-approve-${item.id}`
              ? "Jobbar..."
              : isEdit
                ? "Godkänn ändring"
                : "Godkänn plats"}
          </button>

          <button
            type="button"
            onClick={() => onReject(item.id, item.review_type)}
            disabled={workingKey === `spot-reject-${item.id}`}
            className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {workingKey === `spot-reject-${item.id}`
              ? "Jobbar..."
              : isEdit
                ? "Avslå ändring"
                : "Ta bort"}
          </button>
        </div>
      </div>
    </div>
  );
}
