"use client";

import MapPicker from "@/components/MapPicker";

type FeedbackMessage = {
  variant: "success" | "error";
  text: string;
};

type FishingSpotFormProps = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
  title: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  gpsLoading: boolean;
  gpsError: string | null;
  mapOpen: boolean;
  submitLoading: boolean;
  formMessage: FeedbackMessage | null;
  onTitleChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onGetGps: () => void;
  onOpenMap: () => void;
  onCloseMap: () => void;
  onMapSelect: (lat: number, lng: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function FishingSpotForm({
  isLoggedIn,
  hasActiveMembership,
  title,
  notes,
  latitude,
  longitude,
  gpsLoading,
  gpsError,
  mapOpen,
  submitLoading,
  formMessage,
  onTitleChange,
  onNotesChange,
  onGetGps,
  onOpenMap,
  onCloseMap,
  onMapSelect,
  onSubmit,
}: FishingSpotFormProps) {
  const isLocked = !isLoggedIn || !hasActiveMembership;

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1f2937]">📍 Markera fiskeplats</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6b7280]">
            Snabbmarkera en spot ute på sjön med GPS eller manuellt på karta. Titel och
            anteckningar är frivilliga så att du kan spara snabbt och fylla i mer senare.
          </p>
        </div>

        <div className="rounded-2xl border border-[#d8d2c7] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">
          Status vid inskick: <span className="font-semibold text-[#1f2937]">Väntar på admin</span>
        </div>
      </div>

      {!isLoggedIn ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Du behöver logga in för att markera en fiskeplats.
        </div>
      ) : null}

      {isLoggedIn && !hasActiveMembership ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ditt medlemskap är inte aktivt ännu. Fiskeplatser kan markeras först när medlemskapet är godkänt.
        </div>
      ) : null}

      {formMessage ? (
        <div
          className={[
            "mt-5 rounded-2xl px-4 py-3 text-sm",
            formMessage.variant === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-700",
          ].join(" ")}
        >
          {formMessage.text}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onGetGps}
            disabled={isLocked || gpsLoading || submitLoading}
            className="rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {gpsLoading ? "Hämtar GPS..." : "Använd min GPS-position"}
          </button>

          <button
            type="button"
            onClick={onOpenMap}
            disabled={isLocked || submitLoading}
            className="rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Markera manuellt på karta
          </button>
        </div>

        {gpsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {gpsError}
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#d8d2c7] bg-[#faf8f4] px-4 py-4 text-sm text-[#374151]">
          <div className="font-semibold text-[#1f2937]">Vald position</div>
          <div className="mt-2 text-[#4b5563]">
            {latitude !== null && longitude !== null
              ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              : "Ingen position vald ännu"}
          </div>
        </div>

        {mapOpen ? (
          <div className="space-y-3 rounded-[24px] border border-[#d8d2c7] bg-[#fffdfb] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-[#1f2937]">Välj plats på karta</div>
                <div className="text-sm text-[#6b7280]">Tryck på kartan för att sätta en markering.</div>
              </div>

              <button
                type="button"
                onClick={onCloseMap}
                className="rounded-full border border-[#d8d2c7] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
              >
                Stäng karta
              </button>
            </div>

            <MapPicker
              onSelect={onMapSelect}
              selectedPosition={
                latitude !== null && longitude !== null ? [latitude, longitude] : null
              }
            />
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#374151]">Rubrik (valfritt)</span>
            <input
              type="text"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Ex. Guideplats västra viken"
              maxLength={80}
              disabled={isLocked || submitLoading}
              className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#324b2f] focus:ring-2 focus:ring-[#324b2f]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f4]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#374151]">Anteckning (valfritt)</span>
            <textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Ex. Bra kant, mycket betesfisk, sparad från guidepass."
              maxLength={600}
              rows={5}
              disabled={isLocked || submitLoading}
              className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#324b2f] focus:ring-2 focus:ring-[#324b2f]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f4]"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLocked || submitLoading || latitude === null || longitude === null}
            className="rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLoading ? "Sparar fiskeplats..." : "Spara fiskeplats"}
          </button>

          <div className="text-sm text-[#6b7280]">
            Det räcker att spara endast position om du har bråttom.
          </div>
        </div>
      </form>
    </section>
  );
}
