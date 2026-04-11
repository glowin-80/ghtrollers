"use client";

import dynamic from "next/dynamic";
import type { Catch, FishingSpot } from "@/types/home";
import type { FishingSpotMapFilter } from "@/types/fishing-spots";

type CatchesMapProps = {
  catches: Catch[];
  fishingSpots?: FishingSpot[];
  filter?: FishingSpotMapFilter;
  includePrivate?: boolean;
};

const LeafletCatchesMap = dynamic(() => import("./LeafletCatchesMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-[#d8d2c7] bg-white text-[#6b7280]">
      Laddar karta...
    </div>
  ),
});

export default function CatchesMap({
  catches,
  fishingSpots = [],
  filter = "all",
  includePrivate = false,
}: CatchesMapProps) {
  return (
    <LeafletCatchesMap
      catches={catches}
      fishingSpots={fishingSpots}
      filter={filter}
      includePrivate={includePrivate}
    />
  );
}
