"use client";

import { memo, useEffect, useRef, useState } from "react";
import MembersOnlyOverlay from "@/components/shared/MembersOnlyOverlay";
import CatchesMap from "@/components/CatchesMap";
import type { Catch } from "@/types/home";

type MapPreviewSectionProps = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
  catches: Catch[];
};

function MapPreviewSectionComponent({
  isLoggedIn,
  hasActiveMembership,
  catches,
}: MapPreviewSectionProps) {
  const shouldLock = !isLoggedIn || !hasActiveMembership;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);

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
          description="Logga in för att se fångstkartan och använda kartfunktionerna."
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
        <h2 className="mb-4 text-2xl font-bold text-[#1f2937]">🗺️ Fångstkarta</h2>

        <div className="overflow-hidden rounded-2xl border border-[#d8d2c7]">
          {shouldRenderMap ? (
            <CatchesMap catches={catches} />
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
