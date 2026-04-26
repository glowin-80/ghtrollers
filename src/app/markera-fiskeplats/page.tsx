"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import FishingSpotForm from "@/components/fishing-spots/FishingSpotForm";
import MyFishingSpotsSection from "@/components/fishing-spots/MyFishingSpotsSection";
import { useAuthMember } from "@/hooks/useAuthMember";
import {
  createFishingSpot,
  updateOwnPrivateFishingSpot,
  fetchOwnFishingSpots,
  submitFishingSpotEdit,
} from "@/lib/fishing-spots";
import { getGeolocationErrorState } from "@/lib/home-upload";
import type { FishingSpot } from "@/types/fishing-spots";

type FeedbackMessage = {
  variant: "success" | "error";
  text: string;
};

type ConfirmationDialog = {
  title: string;
  text: string;
};

type EditDraftState = {
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

const DEFAULT_EDIT_DRAFT: EditDraftState = {
  title: "",
  notes: "",
  latitude: null,
  longitude: null,
  gpsLoading: false,
  gpsError: null,
  mapOpen: false,
  submitLoading: false,
  formMessage: null,
  isPrivate: false,
};

function getInitialEditValues(
  spot: FishingSpot
): Pick<EditDraftState, "title" | "notes" | "latitude" | "longitude" | "isPrivate"> {
  if (
    spot.has_pending_edit &&
    spot.pending_latitude !== null &&
    spot.pending_latitude !== undefined &&
    spot.pending_longitude !== null &&
    spot.pending_longitude !== undefined
  ) {
    return {
      title: spot.pending_title ?? "",
      notes: spot.pending_notes ?? "",
      latitude: spot.pending_latitude,
      longitude: spot.pending_longitude,
      isPrivate: spot.pending_is_private ?? spot.is_private ?? false,
    };
  }

  return {
    title: spot.title ?? "",
    notes: spot.notes ?? "",
    latitude: spot.latitude,
    longitude: spot.longitude,
    isPrivate: spot.is_private ?? false,
  };
}

export default function MarkeraFiskeplatsPage() {
  const { isLoggedIn, hasActiveMembership, member } = useAuthMember();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<FeedbackMessage | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialog | null>(null);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [spotsError, setSpotsError] = useState<string | null>(null);
  const [spots, setSpots] = useState<FishingSpot[]>([]);
  const [editSpotId, setEditSpotId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraftState>(DEFAULT_EDIT_DRAFT);

  const loadOwnSpots = useCallback(async () => {
    if (!member?.id || !isLoggedIn) {
      setSpots([]);
      return;
    }

    try {
      setSpotsLoading(true);
      setSpotsError(null);
      const data = await fetchOwnFishingSpots(member.id);
      setSpots(data);
    } catch (error) {
      console.error(error);
      setSpotsError("Kunde inte ladda dina fiskeplatser just nu.");
    } finally {
      setSpotsLoading(false);
    }
  }, [isLoggedIn, member?.id]);

  useEffect(() => {
    void loadOwnSpots();
  }, [loadOwnSpots]);

  const handleGetGps = useCallback(() => {
    if (!hasActiveMembership) {
      return;
    }

    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("GPS stöds inte i den här enheten/webbläsaren.");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsError(null);
        setGpsLoading(false);
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        setGpsError(getGeolocationErrorState(error).message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  }, [hasActiveMembership]);

  const handleMapSelect = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setGpsError(null);
    setMapOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isLoggedIn || !hasActiveMembership || !member?.id) {
        setFormMessage({
          variant: "error",
          text: "Du behöver vara aktiv medlem för att markera en fiskeplats.",
        });
        return;
      }

      if (latitude === null || longitude === null) {
        setFormMessage({
          variant: "error",
          text: "Välj en position via GPS eller kartan innan du sparar.",
        });
        return;
      }

      try {
        setSubmitLoading(true);
        setFormMessage(null);

        const createdSpot = await createFishingSpot({
          createdByMemberId: member.id,
          createdByName: member.name || member.email || "Medlem",
          latitude,
          longitude,
          title: title.trim() ? title.trim() : null,
          notes: notes.trim() ? notes.trim() : null,
          isPrivate,
        });

        setSpots((prev) => [createdSpot, ...prev]);
        setTitle("");
        setNotes("");
        setLatitude(null);
        setLongitude(null);
        setIsPrivate(false);
        setMapOpen(false);
        setFormMessage({
          variant: "success",
          text: isPrivate
            ? "Den privata fiskeplatsen sparades direkt och visas nu på din egen karta."
            : "Fiskeplatsen sparades och väntar nu på admin-godkännande.",
        });
        setConfirmationDialog(
          isPrivate
            ? {
                title: "Platsen sparades privat",
                text: "Fiskeplatsen sparades direkt och visas nu på din egen karta. Den syns inte för andra medlemmar.",
              }
            : {
                title: "Platsen skickades för godkännande",
                text: "Fiskeplatsen är sparad och väntar nu på att admin ska godkänna den innan andra medlemmar kan se den.",
              }
        );
      } catch (error) {
        console.error(error);
        setFormMessage({
          variant: "error",
          text: "Kunde inte spara fiskeplatsen just nu.",
        });
      } finally {
        setSubmitLoading(false);
      }
    },
    [hasActiveMembership, isLoggedIn, isPrivate, latitude, longitude, member, notes, title]
  );

  const handleStartEdit = useCallback((spot: FishingSpot) => {
    const initial = getInitialEditValues(spot);

    setEditSpotId(spot.id);
    setEditDraft({
      ...DEFAULT_EDIT_DRAFT,
      ...initial,
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditSpotId(null);
    setEditDraft(DEFAULT_EDIT_DRAFT);
  }, []);

  const handleEditGetGps = useCallback(() => {
    if (!hasActiveMembership) {
      return;
    }

    setEditDraft((prev) => ({ ...prev, gpsError: null }));

    if (!navigator.geolocation) {
      setEditDraft((prev) => ({
        ...prev,
        gpsError: "GPS stöds inte i den här enheten/webbläsaren.",
      }));
      return;
    }

    setEditDraft((prev) => ({ ...prev, gpsLoading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setEditDraft((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          gpsError: null,
          gpsLoading: false,
        }));
      },
      (error) => {
        console.error(error);
        setEditDraft((prev) => ({
          ...prev,
          gpsLoading: false,
          gpsError: getGeolocationErrorState(error).message,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  }, [hasActiveMembership]);

  const handleEditSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!editSpotId) {
        setEditDraft((prev) => ({
          ...prev,
          formMessage: {
            variant: "error",
            text: "Ingen fiskeplats vald för editering.",
          },
        }));
        return;
      }

      if (!isLoggedIn || !hasActiveMembership || !member?.id) {
        setEditDraft((prev) => ({
          ...prev,
          formMessage: {
            variant: "error",
            text: "Du behöver vara aktiv medlem för att editera en fiskeplats.",
          },
        }));
        return;
      }

      if (editDraft.latitude === null || editDraft.longitude === null) {
        setEditDraft((prev) => ({
          ...prev,
          formMessage: {
            variant: "error",
            text: "Välj en position via GPS eller kartan innan du sparar ändringen.",
          },
        }));
        return;
      }

      const targetSpot = spots.find((spot) => spot.id === editSpotId);

      if (!targetSpot) {
        setEditDraft((prev) => ({
          ...prev,
          formMessage: {
            variant: "error",
            text: "Kunde inte hitta fiskeplatsen du försöker editera.",
          },
        }));
        return;
      }

      const nextTitle = editDraft.title.trim() ? editDraft.title.trim() : null;
      const nextNotes = editDraft.notes.trim() ? editDraft.notes.trim() : null;
      const canUpdatePrivateDirectly =
        targetSpot.status === "approved" &&
        targetSpot.is_private === true &&
        editDraft.isPrivate === true;

      try {
        setEditDraft((prev) => ({ ...prev, submitLoading: true, formMessage: null }));

        if (canUpdatePrivateDirectly) {
          const updatedSpot = await updateOwnPrivateFishingSpot({
            spotId: editSpotId,
            createdByMemberId: member.id,
            latitude: editDraft.latitude,
            longitude: editDraft.longitude,
            title: nextTitle,
            notes: nextNotes,
          });

          setSpots((prev) =>
            prev.map((spot) => (spot.id === editSpotId ? updatedSpot : spot))
          );
          setEditDraft((prev) => ({
            ...prev,
            submitLoading: false,
            mapOpen: false,
            formMessage: {
              variant: "success",
              text: "Den privata fiskeplatsen uppdaterades direkt och visas nu på din egen karta.",
            },
          }));
          setConfirmationDialog({
            title: "Den privata platsen uppdaterades",
            text: "Ändringen sparades direkt eftersom platsen fortfarande är privat och bara syns för dig.",
          });
          return;
        }

        await submitFishingSpotEdit({
          spotId: editSpotId,
          latitude: editDraft.latitude,
          longitude: editDraft.longitude,
          title: nextTitle,
          notes: nextNotes,
          isPrivate: editDraft.isPrivate,
        });

        const nextSpots = spots.map((spot) => {
          if (spot.id !== editSpotId) {
            return spot;
          }

          if (spot.status === "pending") {
            return {
              ...spot,
              title: nextTitle,
              notes: nextNotes,
              latitude: editDraft.latitude ?? spot.latitude,
              longitude: editDraft.longitude ?? spot.longitude,
              updated_at: new Date().toISOString(),
              is_private: editDraft.isPrivate,
            };
          }

          return {
            ...spot,
            pending_title: nextTitle,
            pending_notes: nextNotes,
            pending_latitude: editDraft.latitude,
            pending_longitude: editDraft.longitude,
            has_pending_edit: true,
            updated_at: new Date().toISOString(),
            pending_is_private: editDraft.isPrivate,
          };
        });

        setSpots(nextSpots);
        setEditDraft((prev) => ({
          ...prev,
          submitLoading: false,
          mapOpen: false,
          formMessage: {
            variant: "success",
            text:
              targetSpot.status === "pending"
                ? "Den väntande fiskeplatsen uppdaterades. Den väntar fortfarande på admin-godkännande."
                : "Ändringen sparades och väntar nu på admin-godkännande innan den syns på kartan.",
          },
        }));
        setConfirmationDialog(
          targetSpot.status === "pending"
            ? {
                title: "Väntande plats uppdaterades",
                text: "Fiskeplatsen är uppdaterad men väntar fortfarande på admin-godkännande.",
              }
            : {
                title: "Ändringen skickades för godkännande",
                text: "Ändringen väntar nu på admin-godkännande innan den slår igenom på kartan.",
              }
        );
      } catch (error) {
        console.error(error);
        setEditDraft((prev) => ({
          ...prev,
          submitLoading: false,
          formMessage: {
            variant: "error",
            text: "Kunde inte spara ändringen just nu.",
          },
        }));
      }
    },
    [editDraft, editSpotId, hasActiveMembership, isLoggedIn, member?.id, spots]
  );

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <FishingSpotForm
          isLoggedIn={isLoggedIn}
          hasActiveMembership={hasActiveMembership}
          title={title}
          notes={notes}
          latitude={latitude}
          longitude={longitude}
          gpsLoading={gpsLoading}
          gpsError={gpsError}
          mapOpen={mapOpen}
          submitLoading={submitLoading}
          formMessage={formMessage}
          onTitleChange={setTitle}
          onNotesChange={setNotes}
          isPrivate={isPrivate}
          onIsPrivateChange={setIsPrivate}
          onGetGps={handleGetGps}
          onOpenMap={() => setMapOpen(true)}
          onCloseMap={() => setMapOpen(false)}
          onMapSelect={handleMapSelect}
          onSubmit={handleSubmit}
          statusLabel={isPrivate ? "Sparas direkt" : "Väntar på admin"}
          helperText={
            isPrivate
              ? "Privata fiskeplatser visas direkt på din egen karta."
              : "Officiella fiskeplatser skickas till admin för godkännande."
          }
        />

        {!isLoggedIn ? (
          <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            <h2 className="text-2xl font-bold text-[#1f2937]">🔐 Medlemmar</h2>
            <p className="mt-3 text-sm text-[#6b7280]">
              Logga in för att markera och se fiskeplatser. Godkända fiskeplatser visas även på kartan på startsidan för aktiva medlemmar.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex rounded-full bg-[#324b2f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
              >
                Logga in
              </Link>

              <Link
                href="/"
                className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
              >
                Till startsidan
              </Link>
            </div>
          </section>
        ) : null}

        {isLoggedIn ? (
          <MyFishingSpotsSection
            loading={spotsLoading}
            error={spotsError}
            spots={spots}
            isLoggedIn={isLoggedIn}
            hasActiveMembership={hasActiveMembership}
            editSpotId={editSpotId}
            editDraft={editDraft}
            onStartEdit={handleStartEdit}
            onCancelEdit={handleCancelEdit}
            onEditTitleChange={(value) =>
              setEditDraft((prev) => ({ ...prev, title: value, formMessage: null }))
            }
            onEditNotesChange={(value) =>
              setEditDraft((prev) => ({ ...prev, notes: value, formMessage: null }))
            }
            onEditIsPrivateChange={(value) =>
              setEditDraft((prev) => ({ ...prev, isPrivate: value, formMessage: null }))
            }
            onEditGetGps={handleEditGetGps}
            onEditOpenMap={() =>
              setEditDraft((prev) => ({ ...prev, mapOpen: true, formMessage: null }))
            }
            onEditCloseMap={() => setEditDraft((prev) => ({ ...prev, mapOpen: false }))}
            onEditMapSelect={(lat, lng) =>
              setEditDraft((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                gpsError: null,
                mapOpen: false,
                formMessage: null,
              }))
            }
            onEditSubmit={handleEditSubmit}
          />
        ) : null}
      </div>

      {confirmationDialog ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fishing-spot-confirmation-title"
        >
          <div className="w-full max-w-sm rounded-[28px] border border-[#d8d2c7] bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-2xl">
              ✅
            </div>

            <h2
              id="fishing-spot-confirmation-title"
              className="mt-4 text-xl font-bold text-[#1f2937]"
            >
              {confirmationDialog.title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#4b5563]">
              {confirmationDialog.text}
            </p>

            <button
              type="button"
              onClick={() => setConfirmationDialog(null)}
              className="mt-6 w-full rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
            >
              Ok
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}