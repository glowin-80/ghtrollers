"use client";

import { useHomeData } from "@/hooks/useHomeData";
import MapPreviewSection from "@/components/home/MapPreviewSection";

export default function KartaPage() {
  const {
    approvedCatches,
    approvedFishingSpots,
    isLoggedIn,
    hasActiveMembership,
    member,
  } = useHomeData({ includeFishingSpots: true });

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mx-auto max-w-xl">
        <div id="map-section" className="scroll-mt-[360px]">
          <MapPreviewSection
            isLoggedIn={isLoggedIn}
            hasActiveMembership={hasActiveMembership}
            isSuperAdmin={Boolean(member?.is_super_admin)}
            catches={approvedCatches}
            fishingSpots={approvedFishingSpots}
          />
        </div>
      </div>
    </main>
  );
}
