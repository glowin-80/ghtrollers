"use client";

import { useMemo, useState } from "react";
import FishingSpotForm from "@/components/fishing-spots/FishingSpotForm";
import type { FishingSpot } from "@/types/fishing-spots";

type FeedbackMessage = {
  variant: "success" | "error";
  text: string;
};

type EditDraft = {
  title: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  gpsLoading: boolean;
  gpsError: string | null;
  mapOpen: boolean;
  submitLoading: boolean;
  formMessage: FeedbackMessage | null;
  isPrivate: boolean;
};

type MyFishingSpotsSectionProps = {
  loading: boolean;
  error: string | null;
  spots: FishingSpot[];
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
  editSpotId: string | null;
  editDraft: EditDraft;
  onStartEdit: (spot: FishingSpot) => void;
  onCancelEdit: () => void;
  onEditTitleChange: (value: string) => void;
  onEditNotesChange: (value: string) => void;
  onEditIsPrivateChange: (value: boolean) => void;
  onEditGetGps: () => void;
  onEditOpenMap: () => void;
  onEditCloseMap: () => void;
  onEditMapSelect: (lat: number, lng: number) => void;
  onEditSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function getStatusMeta(spot: FishingSpot) {
  if (spot.status === "pending") {
    return {
      text: "Väntar på admin",
      className: "bg-amber-100 text-amber-800 border border-amber-200",
      description:
        "Platsen är ännu inte publicerad. Du kan fortfarande justera den innan admin godkänner.",
    };
  }

  if (spot.has_pending_edit) {
    return {
      text: "Ändring väntar på admin",
      className: "bg-blue-100 text-blue-800 border border-blue-200",
      description:
        "Nuvarande version ligger kvar publikt tills admin har godkänt din senaste ändring.",
    };
  }

  return {
    text: "Godkänd",
    className: "bg-green-100 text-green-800 border border-green-200",
    description: "Platsen är publicerad på kartan för dig.",
  };
}

export default function MyFishingSpotsSection({
  loading,
  error,
  spots,
  isLoggedIn,
  hasActiveMembership,
  editSpotId,
  editDraft,
  onStartEdit,
  onCancelEdit,
  onEditTitleChange,
  onEditNotesChange,
  onEditIsPrivateChange,
  onEditGetGps,
  onEditOpenMap,
  onEditCloseMap,
  onEditMapSelect,
  onEditSubmit,
}: MyFishingSpotsSectionProps) {
  const [expandedSpotId, setExpandedSpotId] = useState<string | null>(null);

  const activeEditSpot = useMemo(
    () => spots.find((spot) => spot.id === editSpotId) ?? null,
    [editSpotId, spots]
  );

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2937]">🧭 Mina fiskeplatser</h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            Här ser du dina inskickade fiskeplatser, deras status och kan skicka in ändringar när du vill uppdatera en plats i efterhand.
          </p>
        </div>

        <div className="rounded-2xl border border-[#d8d2c7] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">
          Totalt sparade: <span className="font-bold text-[#1f2937]">{spots.length}</span>
        </div>
      </div>

      {loading ? <div className="mt-5 rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">Laddar dina fiskeplatser...</div> : null}
      {error ? <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">{error}</div> : null}
      {!loading && !error && spots.length === 0 ? <div className="mt-5 rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">Du har inte sparat några fiskeplatser ännu.</div> : null}

      {activeEditSpot ? (
        <div className="mt-5 space-y-4 rounded-[24px] border border-[#d8d2c7] bg-[#fffdfb] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-lg font-bold text-[#1f2937]">Editerar: {activeEditSpot.title?.trim() || "Namnlös fiskeplats"}</div>
              <div className="mt-1 text-sm text-[#6b7280]">
                {activeEditSpot.status === "pending"
                  ? "Eftersom platsen ännu inte är publicerad uppdateras väntande versionen direkt."
                  : "Den publika versionen ligger kvar tills admin har godkänt din nya ändring."}
              </div>
            </div>

            <button type="button" onClick={onCancelEdit} className="rounded-full border border-[#d8d2c7] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]">Avbryt editering</button>
          </div>

          <FishingSpotForm
            isLoggedIn={isLoggedIn}
            hasActiveMembership={hasActiveMembership}
            title={editDraft.title}
            notes={editDraft.notes}
            isPrivate={editDraft.isPrivate}
            onIsPrivateChange={onEditIsPrivateChange}
            latitude={editDraft.latitude}
            longitude={editDraft.longitude}
            gpsLoading={editDraft.gpsLoading}
            gpsError={editDraft.gpsError}
            mapOpen={editDraft.mapOpen}
            submitLoading={editDraft.submitLoading}
            formMessage={editDraft.formMessage}
            onTitleChange={onEditTitleChange}
            onNotesChange={onEditNotesChange}
            onGetGps={onEditGetGps}
            onOpenMap={onEditOpenMap}
            onCloseMap={onEditCloseMap}
            onMapSelect={onEditMapSelect}
            onSubmit={onEditSubmit}
            mode="edit"
            heading="✏️ Editera vald fiskeplats"
            description="Justera koordinater, rubrik eller anteckning. Godkända platser skickar in en väntande ändring till admin, medan ännu ej godkända platser uppdateras direkt i sin väntande version."
            statusLabel={activeEditSpot.status === "pending" ? "Fortfarande väntar på admin" : "Ändring väntar på admin"}
            submitLabel={activeEditSpot.status === "pending" ? "Uppdatera väntande plats" : "Skicka ändring"}
            submitLoadingLabel="Sparar ändring..."
            helperText="Har du bråttom kan du bara justera koordinaten nu och fylla på text senare."
          />
        </div>
      ) : null}

      {!loading && !error && spots.length > 0 ? (
        <div className="mt-5 space-y-4">
          {spots.map((spot) => {
            const status = getStatusMeta(spot);
            const isExpanded = expandedSpotId === spot.id;
            const hasPendingFields =
              spot.pending_latitude !== null &&
              spot.pending_latitude !== undefined &&
              spot.pending_longitude !== null &&
              spot.pending_longitude !== undefined;

            return (
              <div key={spot.id} className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-bold text-[#1f2937]">{spot.title?.trim() || "Namnlös fiskeplats"}</div>
                    <div className="mt-1 text-sm text-[#6b7280]">{new Date(spot.created_at).toLocaleString("sv-SE")}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {spot.is_private ? <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[#4b5563]">Privat plats</span> : null}
                      {spot.pending_is_private ? <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[#4338ca]">Väntande privat ändring</span> : null}
                    </div>
                  </div>

                  <span className={["inline-flex rounded-full px-3 py-1 text-xs font-semibold", status.className].join(" ")}>{status.text}</span>
                </div>

                <div className="mt-3 rounded-2xl border border-[#e5ded2] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">{status.description}</div>

                <div className="mt-4 grid gap-2 text-sm text-[#374151] md:grid-cols-2">
                  <div><span className="font-semibold">Aktiva koordinater:</span> {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)}</div>
                  <div><span className="font-semibold">Skapad av:</span> {spot.created_by_name}</div>
                </div>

                {spot.notes?.trim() ? <div className="mt-4 rounded-2xl border border-[#e5ded2] bg-[#faf8f4] px-4 py-3 text-sm text-[#4b5563]">{spot.notes}</div> : null}

                {spot.has_pending_edit && hasPendingFields ? (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    <div className="font-semibold">Väntande ändring</div>
                    <div className="mt-2"><span className="font-medium">Koordinater:</span> {spot.pending_latitude?.toFixed(6)}, {spot.pending_longitude?.toFixed(6)}</div>
                    {spot.pending_title?.trim() ? <div className="mt-1"><span className="font-medium">Rubrik:</span> {spot.pending_title}</div> : null}
                    {spot.pending_notes?.trim() ? <div className="mt-1 whitespace-pre-wrap"><span className="font-medium">Anteckning:</span> {spot.pending_notes}</div> : null}
                    {typeof spot.pending_is_private === "boolean" ? <div className="mt-1"><span className="font-medium">Privat:</span> {spot.pending_is_private ? "Ja" : "Nej"}</div> : null}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={() => onStartEdit(spot)} className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]">{editSpotId === spot.id ? "Editerar nu" : "Editera plats"}</button>
                  <button type="button" onClick={() => setExpandedSpotId((prev) => (prev === spot.id ? null : spot.id))} className="rounded-full border border-[#d8d2c7] px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]">{isExpanded ? "Dölj detaljer" : "Visa detaljer"}</button>
                </div>

                {isExpanded ? (
                  <div className="mt-4 grid gap-3 rounded-2xl border border-[#e5ded2] bg-[#faf8f4] p-4 text-sm text-[#4b5563] md:grid-cols-2">
                    <div><span className="font-semibold text-[#1f2937]">Publicerad:</span> {spot.approved_at ? new Date(spot.approved_at).toLocaleString("sv-SE") : "Inte ännu"}</div>
                    <div><span className="font-semibold text-[#1f2937]">Senast uppdaterad:</span> {spot.updated_at ? new Date(spot.updated_at).toLocaleString("sv-SE") : "Okänt"}</div>
                    <div><span className="font-semibold text-[#1f2937]">Intern statuskod:</span> {spot.status}</div>
                    <div><span className="font-semibold text-[#1f2937]">Har väntande edit:</span> {spot.has_pending_edit ? "Ja" : "Nej"}</div>
                    <div><span className="font-semibold text-[#1f2937]">Privat:</span> {spot.is_private ? "Ja" : "Nej"}</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
