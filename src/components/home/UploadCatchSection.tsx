"use client";

import MembersOnlyOverlay from "@/components/shared/MembersOnlyOverlay";
import UploadCatchForm from "@/components/home/upload/UploadCatchForm";
import MapPickerModal from "@/components/home/upload/MapPickerModal";
import type { UploadCatchSectionProps } from "@/components/home/upload/types";

export default function UploadCatchSection({
  isLoggedIn,
  hasActiveMembership,
  mapOpen,
  onCloseMap,
  onMapSelect,
  ...formProps
}: UploadCatchSectionProps) {
  const shouldLock = !isLoggedIn || !hasActiveMembership;

  return (
    <section className="relative rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      {!isLoggedIn ? (
        <MembersOnlyOverlay
          title="Endast medlemmar"
          description="Du behöver vara inloggad för att registrera en fångst."
        />
      ) : null}

      {isLoggedIn && !hasActiveMembership ? (
        <MembersOnlyOverlay
          title="Medlemskapet granskas"
          description="Ditt medlemskap är under granskning, så snart vi fiskat klart kikar vi på din ansökan."
          hideLoginButton
        />
      ) : null}

      <div className={shouldLock ? "pointer-events-none select-none blur-[5px]" : ""}>
        <h2 className="mb-4 text-2xl font-bold text-[#1f2937]">📸 Ladda upp fångst</h2>

        <UploadCatchForm {...formProps} />

        <MapPickerModal
          open={mapOpen}
          onClose={onCloseMap}
          onSelect={onMapSelect}
        />
      </div>
    </section>
  );
}
