"use client";

import type { PendingFishingSpot } from "@/lib/fishing-spots";
import PendingFishingSpotCard from "@/components/member/admin/PendingFishingSpotCard";

type PendingFishingSpotsSectionProps = {
  pendingFishingSpots: PendingFishingSpot[];
  loading: boolean;
  workingKey: string | null;
  onApprove: (spotId: string, reviewType: PendingFishingSpot["review_type"]) => void;
  onReject: (spotId: string, reviewType: PendingFishingSpot["review_type"]) => void;
};

export default function PendingFishingSpotsSection({
  pendingFishingSpots,
  loading,
  workingKey,
  onApprove,
  onReject,
}: PendingFishingSpotsSectionProps) {
  const pendingNewCount = pendingFishingSpots.filter((item) => item.review_type === "new").length;
  const pendingEditCount = pendingFishingSpots.filter((item) => item.review_type === "edit").length;

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1f2937]">Godkänn fiskeplatser</h3>
          <p className="mt-2 text-sm text-[#6b7280]">
            Här hanterar du både nya fiskeplatser och senare ändringar som medlemmar har skickat in.
          </p>
        </div>

        <div className="rounded-2xl border border-[#d8d2c7] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">
          Nya: <span className="font-bold text-[#1f2937]">{pendingNewCount}</span> · Ändringar:{" "}
          <span className="font-bold text-[#1f2937]">{pendingEditCount}</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
            Laddar väntande fiskeplatser...
          </div>
        ) : null}

        {!loading && pendingFishingSpots.length === 0 ? (
          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
            Inga väntande fiskeplatser eller ändringar just nu.
          </div>
        ) : null}

        {!loading
          ? pendingFishingSpots.map((item) => (
              <PendingFishingSpotCard
                key={`${item.review_type}-${item.id}`}
                item={item}
                workingKey={workingKey}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
          : null}
      </div>
    </div>
  );
}
