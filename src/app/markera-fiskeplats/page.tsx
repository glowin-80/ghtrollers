"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import FishingSpotForm from "@/components/fishing-spots/FishingSpotForm";
import MyFishingSpotsSection from "@/components/fishing-spots/MyFishingSpotsSection";
import { useAuthMember } from "@/hooks/useAuthMember";
import {
  createPendingFishingSpot,
  fetchOwnFishingSpots,
} from "@/lib/fishing-spots";
import { getGeolocationErrorState } from "@/lib/home-upload";
import type { FishingSpot } from "@/types/fishing-spots";

type FeedbackMessage = {
  variant: "success" | "error";
  text: string;
};

export default function MarkeraFiskeplatsPage() {
  const { isLoggedIn, hasActiveMembership, member } = useAuthMember();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<FeedbackMessage | null>(null);
  const [spotsLoading, setSpotsLoading] = useState(false);
  const [spotsError, setSpotsError] = useState<string | null>(null);
  const [spots, setSpots] = useState<FishingSpot[]>([]);

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

        const createdSpot = await createPendingFishingSpot({
          createdByMemberId: member.id,
          createdByName: member.name || member.email || "Medlem",
          latitude,
          longitude,
          title: title.trim() ? title.trim() : null,
          notes: notes.trim() ? notes.trim() : null,
        });

        setSpots((prev) => [createdSpot, ...prev]);
        setTitle("");
        setNotes("");
        setLatitude(null);
        setLongitude(null);
        setMapOpen(false);
        setFormMessage({
          variant: "success",
          text: "Fiskeplatsen sparades och väntar nu på admin-godkännande.",
        });
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
    [hasActiveMembership, isLoggedIn, latitude, longitude, member, notes, title]
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
          onGetGps={handleGetGps}
          onOpenMap={() => setMapOpen(true)}
          onCloseMap={() => setMapOpen(false)}
          onMapSelect={handleMapSelect}
          onSubmit={handleSubmit}
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
          <MyFishingSpotsSection loading={spotsLoading} error={spotsError} spots={spots} />
        ) : null}
      </div>
    </main>
  );
}
