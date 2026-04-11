"use client";

import { memo, useEffect, useRef, useState } from "react";
import MembersOnlyOverlay from "@/components/shared/MembersOnlyOverlay";
import CatchesMap from "@/components/CatchesMap";
import type { Catch, FishingSpot } from "@/types/home";
import type { FishingSpotMapFilter } from "@/types/fishing-spots";

type MapPreviewSectionProps = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
  catches: Catch[];
  fishingSpots: FishingSpot[];
  isSuperAdmin?: boolean;
};

const toggleOptions: Array<{
  value: FishingSpotMapFilter;
  label: string;
}> = [
  { value: "catches", label: "Visa fångster" },
  { value: "spots", label: "Visa fiskeplatser" },
  { value: "all", label: "Visa allt" },
];

function MapPreviewSectionComponent({
  isLoggedIn,
  hasActiveMembership,
  catches,
  fishingSpots,
  isSuperAdmin = false,
}: MapPreviewSectionProps) {
  const shouldLock = !isLoggedIn || !hasActiveMembership;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const [filter, setFilter] = useState<FishingSpotMapFilter>("all");
  const [includePrivate, setIncludePrivate] = useState(false);

  useEffect(() => {
    if (shouldRenderMap) {
      return;
    }

    const element = sectionRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          setShouldRenderMap(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "250px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldRenderMap]);

  return (
    <section
      ref={sectionRef}
      className="relative rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]"
    >
      {!isLoggedIn ? (
        <MembersOnlyOverlay
          title="Bara medlemmar har access till denna karta"
          description="Logga in för att se fångster, fiskeplatser och använda kartfunktionerna."
        />
      ) : null}

      {isLoggedIn && !hasActiveMembership ? (
        <MembersOnlyOverlay
          title="Medlemskapet granskas"
          description="Ditt medlemskap är under granskning, så snart vi fiskat klart kikar vi på din ansökan."
          hideLoginButton
        />
      ) : null}

      <div
        className={shouldLock ? "pointer-events-none select-none blur-[10px]" : ""}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1f2937]">🗺️ Fångstkarta och Fiskeplatser</h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              Växla mellan godkända fångster, godkända fiskeplatser eller visa båda samtidigt.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {toggleOptions.map((option) => {
              const isActive = filter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-[#324b2f] text-white"
                      : "border border-[#d8d2c7] bg-white text-[#374151] hover:bg-[#f9f7f3]",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}

            {isSuperAdmin ? (
              <label className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c7] bg-white px-4 py-2 text-sm font-semibold text-[#374151]">
                <input
                  type="checkbox"
                  checked={includePrivate}
                  onChange={(event) => setIncludePrivate(event.target.checked)}
                  className="h-4 w-4 rounded border-[#cfc6b8] text-[#324b2f] focus:ring-[#d9cfbf]"
                />
                <span>Visa även privata registreringar</span>
              </label>
            ) : null}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[#d8d2c7]">
          {shouldRenderMap ? (
            <CatchesMap catches={catches} fishingSpots={fishingSpots} filter={filter} includePrivate={isSuperAdmin && includePrivate} />
          ) : (
            <div className="flex h-[420px] w-full items-center justify-center bg-white text-[#6b7280]">
              Laddar karta...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const MapPreviewSection = memo(MapPreviewSectionComponent);

export default MapPreviewSection;
