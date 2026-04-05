"use client";

import type { PendingFishingSpot } from "@/lib/fishing-spots";
import PendingFishingSpotCard from "@/components/member/admin/PendingFishingSpotCard";

type PendingFishingSpotsSectionProps = {
  pendingFishingSpots: PendingFishingSpot[];
  loading: boolean;
  workingKey: string | null;
  onApprove: (spotId: string) => void;
  onReject: (spotId: string) => void;
};

export default function PendingFishingSpotsSection({
  pendingFishingSpots,
  loading,
  workingKey,
  onApprove,
  onReject,
}: PendingFishingSpotsSectionProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-[#1f2937]">Godkänn fiskeplatser</h3>

      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
            Laddar väntande fiskeplatser...
          </div>
        ) : null}

        {!loading && pendingFishingSpots.length === 0 ? (
          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
            Inga väntande fiskeplatser just nu.
          </div>
        ) : null}

        {!loading
          ? pendingFishingSpots.map((item) => (
              <PendingFishingSpotCard
                key={item.id}
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
