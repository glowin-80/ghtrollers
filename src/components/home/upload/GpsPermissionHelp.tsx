"use client";

import { detectMobileHelpPlatform } from "@/lib/home-upload";
import { useMemo, useState, type ReactNode } from "react";
import type { GpsErrorState, MobileHelpPlatform } from "@/components/home/upload/types";

function PlatformToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-[#1f46d8] text-white shadow-sm" : "border border-[#d8d2c7] bg-white text-[#374151] hover:bg-[#f9f7f3]"}`}
    >
      {children}
    </button>
  );
}

type GpsPermissionHelpProps = {
  gpsError: GpsErrorState | null;
  gpsLoading: boolean;
  onRetry: () => void;
  onOpenMap: () => void;
};

export default function GpsPermissionHelp({ gpsError, gpsLoading, onRetry, onOpenMap }: GpsPermissionHelpProps) {
  const [helpPlatform, setHelpPlatform] = useState<MobileHelpPlatform>(() => detectMobileHelpPlatform());

  const permissionDeniedHelp = useMemo(() => {
    if (helpPlatform === "android") {
      return {
        title: "Platsåtkomst är avstängd på Android",
        steps: [
          "Tryck på lås-/infoikonen vid adressfältet i Chrome eller din webbläsare.",
          "Öppna Behörigheter eller Webbplatsinställningar.",
          "Tillåt plats för sidan.",
          "Gå tillbaka hit och tryck på Hämta GPS-position igen.",
        ],
      };
    }

    return {
      title: "Platsåtkomst är avstängd på iPhone",
      steps: [
        "Öppna Inställningar på iPhone.",
        "Gå till Integritet och säkerhet.",
        "Tryck på Platstjänster.",
        "Säkerställ att plats är påslaget och att Safari/webbplatser får använda plats.",
        "Gå tillbaka hit och tryck på Hämta GPS-position igen.",
      ],
    };
  }, [helpPlatform]);

  if (!gpsError) return null;
  if (gpsError.kind !== "permission-denied") {
    return <div className="rounded-2xl border border-[#f1c6c6] bg-[#fff4f4] px-4 py-3 text-sm text-[#9b1c1c]">{gpsError.message}</div>;
  }

  return (
    <div className="rounded-[24px] border border-[#f1c6c6] bg-[#fff4f4] p-4 text-[#7f1d1d]">
      <div className="mb-3 text-base font-bold">{permissionDeniedHelp.title}</div>
      <p className="mb-3 text-sm">För att hämta GPS-position behöver du tillåta platsåtkomst i mobilen.</p>
      <div className="mb-4 flex flex-wrap gap-2">
        <PlatformToggleButton active={helpPlatform === "iphone"} onClick={() => setHelpPlatform("iphone")}>iPhone</PlatformToggleButton>
        <PlatformToggleButton active={helpPlatform === "android"} onClick={() => setHelpPlatform("android")}>Android</PlatformToggleButton>
      </div>
      <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm">{permissionDeniedHelp.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onRetry} disabled={gpsLoading} className="rounded-2xl bg-[#1f46d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264fe6] disabled:cursor-not-allowed disabled:opacity-70">{gpsLoading ? "Försöker igen..." : "Försök igen"}</button>
        <button type="button" onClick={onOpenMap} className="rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]">Välj plats på karta i stället</button>
      </div>
    </div>
  );
}
