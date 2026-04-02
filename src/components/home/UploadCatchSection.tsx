"use client";

import { useEffect, useMemo, useState } from "react";
import MembersOnlyOverlay from "@/components/shared/MembersOnlyOverlay";
import type { Member } from "@/types/home";
import MapPicker from "@/components/MapPicker";

type GpsErrorKind =
  | "permission-denied"
  | "position-unavailable"
  | "timeout"
  | "unsupported"
  | "unknown";

type GpsErrorState = {
  kind: GpsErrorKind;
  message: string;
};

type MobileHelpPlatform = "iphone" | "android";

type UploadCatchSectionProps = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
  members: Member[];
  caughtFor: string;
  registeredBy: string;
  fishType: string;
  fineFishType: string;
  weight: string;
  catchDate: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  gpsLoading: boolean;
  gpsError: GpsErrorState | null;
  mapOpen: boolean;
  previewUrl: string | null;
  fileInputKey: number;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCaughtForChange: (value: string) => void;
  onRegisteredByChange: (value: string) => void;
  onFishTypeChange: (value: string) => void;
  onFineFishTypeChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onCatchDateChange: (value: string) => void;
  onLocationNameChange: (value: string) => void;
  onGetGps: () => void;
  onOpenMap: () => void;
  onCloseMap: () => void;
  onMapSelect: (lat: number, lng: number) => void;
  onImageChange: (file: File | null) => void;
};

function formatCatchDate(dateString: string) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function detectMobileHelpPlatform(): MobileHelpPlatform {
  if (typeof navigator === "undefined") {
    return "iphone";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) {
    return "android";
  }

  return "iphone";
}

function PlatformToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#1f46d8] text-white shadow-sm"
          : "bg-white text-[#374151] border border-[#d8d2c7] hover:bg-[#f9f7f3]"
      }`}
    >
      {children}
    </button>
  );
}

export default function UploadCatchSection({
  isLoggedIn,
  hasActiveMembership,
  members,
  caughtFor,
  registeredBy,
  fishType,
  fineFishType,
  weight,
  catchDate,
  locationName,
  latitude,
  longitude,
  gpsLoading,
  gpsError,
  mapOpen,
  previewUrl,
  fileInputKey,
  loading,
  onSubmit,
  onCaughtForChange,
  onRegisteredByChange,
  onFishTypeChange,
  onFineFishTypeChange,
  onWeightChange,
  onCatchDateChange,
  onLocationNameChange,
  onGetGps,
  onOpenMap,
  onCloseMap,
  onMapSelect,
  onImageChange,
}: UploadCatchSectionProps) {
  const shouldLock = !isLoggedIn || !hasActiveMembership;
  const formattedCatchDate = formatCatchDate(catchDate);

  const [helpPlatform, setHelpPlatform] = useState<MobileHelpPlatform>("iphone");

  useEffect(() => {
    setHelpPlatform(detectMobileHelpPlatform());
  }, []);

  useEffect(() => {
    if (gpsError?.kind === "permission-denied") {
      setHelpPlatform(detectMobileHelpPlatform());
    }
  }, [gpsError]);

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

        <form onSubmit={onSubmit} className="space-y-4">
          <select
            value={caughtFor}
            onChange={(e) => onCaughtForChange(e.target.value)}
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            required
          >
            <option value="">Välj vem som fångade fisken</option>
            {members.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>

          <select
            value={registeredBy}
            onChange={(e) => onRegisteredByChange(e.target.value)}
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            required
          >
            <option value="">Välj vem som registrerar</option>
            {members.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>

          <select
            value={fishType}
            onChange={(e) => onFishTypeChange(e.target.value)}
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            required
          >
            <option value="">Välj art</option>
            <option value="Gädda">Gädda</option>
            <option value="Abborre">Abborre</option>
            <option value="Fina fisken">Fina fisken</option>
          </select>

          {fishType === "Fina fisken" ? (
            <input
              type="text"
              value={fineFishType}
              onChange={(e) => onFineFishTypeChange(e.target.value)}
              placeholder="Art på fina fisken (t.ex. Gös)"
              className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
              required
            />
          ) : null}

          <input
            type="number"
            inputMode="numeric"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder="Vikt (gram)"
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            required
          />

          <div className="space-y-2">
            <label
              htmlFor="catch-date"
              className="block text-sm font-semibold text-[#4b5563]"
            >
              Datum för fångst
            </label>

            <input
              id="catch-date"
              type="date"
              value={catchDate}
              onChange={(e) => onCatchDateChange(e.target.value)}
              className="date-input w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
              required
            />

            <div className="min-h-[20px] text-sm text-[#6b7280]">
              {formattedCatchDate
                ? `Valt datum: ${formattedCatchDate}`
                : "Tryck för att välja datum"}
            </div>
          </div>

          <input
            type="text"
            value={locationName}
            onChange={(e) => onLocationNameChange(e.target.value)}
            placeholder="Plats (valfritt)"
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onGetGps}
              disabled={gpsLoading}
              className="rounded-2xl bg-[#1f46d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264fe6] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {gpsLoading ? "Hämtar GPS..." : "📍 Hämta GPS-position"}
            </button>

            <button
              type="button"
              onClick={onOpenMap}
              className="rounded-2xl bg-[#1f46d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264fe6]"
            >
              🗺️ Importera plats från karta
            </button>
          </div>

          {gpsError?.kind === "permission-denied" ? (
            <div className="rounded-[24px] border border-[#f1c6c6] bg-[#fff4f4] p-4 text-[#7f1d1d]">
              <div className="mb-3 text-base font-bold">{permissionDeniedHelp.title}</div>
              <p className="mb-3 text-sm">
                För att hämta GPS-position behöver du tillåta platsåtkomst i mobilen.
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                <PlatformToggleButton
                  active={helpPlatform === "iphone"}
                  onClick={() => setHelpPlatform("iphone")}
                >
                  iPhone
                </PlatformToggleButton>

                <PlatformToggleButton
                  active={helpPlatform === "android"}
                  onClick={() => setHelpPlatform("android")}
                >
                  Android
                </PlatformToggleButton>
              </div>

              <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm">
                {permissionDeniedHelp.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onGetGps}
                  disabled={gpsLoading}
                  className="rounded-2xl bg-[#1f46d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264fe6] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {gpsLoading ? "Försöker igen..." : "Försök igen"}
                </button>

                <button
                  type="button"
                  onClick={onOpenMap}
                  className="rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
                >
                  Välj plats på karta i stället
                </button>
              </div>
            </div>
          ) : null}

          {gpsError && gpsError.kind !== "permission-denied" ? (
            <div className="rounded-2xl border border-[#f1c6c6] bg-[#fff4f4] px-4 py-3 text-sm text-[#9b1c1c]">
              {gpsError.message}
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#4b5563]">
            <div>Latitud: {latitude ?? "Saknas"}</div>
            <div>Longitud: {longitude ?? "Saknas"}</div>
          </div>

          <input
            key={fileInputKey}
            type="file"
            accept="image/*"
            onChange={(e) => onImageChange(e.target.files?.[0] || null)}
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937]"
            required
          />

          {previewUrl ? (
            <div className="overflow-hidden rounded-2xl border border-[#d8d2c7] bg-white">
              <img
                src={previewUrl}
                alt="Förhandsvisning"
                className="h-auto max-h-[420px] w-full object-cover"
              />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#53b846] px-4 py-4 text-base font-semibold text-white transition hover:bg-[#63c456] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Skickar..." : "Skicka fångst"}
          </button>
        </form>

        {mapOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-3xl rounded-[28px] border border-[#d8d2c7] bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-[#1f2937]">Välj plats på karta</h3>
                <button
                  type="button"
                  onClick={onCloseMap}
                  className="rounded-full border border-[#d8d2c7] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
                >
                  Stäng
                </button>
              </div>

              <MapPicker onSelect={onMapSelect} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}