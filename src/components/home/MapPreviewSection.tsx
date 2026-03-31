"use client";

import MembersOnlyOverlay from "@/components/shared/MembersOnlyOverlay";
import CatchesMap from "@/components/CatchesMap";
import type { Catch } from "@/types/home";

type MapPreviewSectionProps = {
  isLoggedIn: boolean;
  catches: Catch[];
};

export default function MapPreviewSection({
  isLoggedIn,
  catches,
}: MapPreviewSectionProps) {
  return (
    <section className="relative rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      {!isLoggedIn ? (
        <MembersOnlyOverlay
          title="Bara medlemmar har access till denna karta"
          description="Logga in för att se fångstkartan och använda kartfunktionerna."
        />
      ) : null}

      <div className={!isLoggedIn ? "pointer-events-none select-none blur-[10px]" : ""}>
        <h2 className="mb-4 text-2xl font-bold text-[#1f2937]">🗺️ Fångstkarta</h2>

        <div className="overflow-hidden rounded-2xl border border-[#d8d2c7]">
          <CatchesMap catches={catches} />
        </div>
      </div>
    </section>
  );
}