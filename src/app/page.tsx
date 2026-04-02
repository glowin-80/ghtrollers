"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  buildLeaderboard,
  HOME_ACTIVE_MEMBERS_SELECT,
  HOME_APPROVED_CATCHES_SELECT,
} from "@/lib/home";
import type {
  Catch,
  LeaderboardFilter,
  Member,
  UploadImageResult,
} from "@/types/home";
import LeaderboardSection from "@/components/home/LeaderboardSection";
import UploadCatchSection from "@/components/home/UploadCatchSection";
import RecentApprovedSection from "@/components/home/RecentApprovedSection";
import MapPreviewSection from "@/components/home/MapPreviewSection";

type MembershipStatus = "guest" | "pending" | "active";

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

function getGeolocationErrorState(error: GeolocationPositionError): GpsErrorState {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        kind: "permission-denied",
        message: "Platsåtkomst nekades.",
      };
    case error.POSITION_UNAVAILABLE:
      return {
        kind: "position-unavailable",
        message:
          "Kunde inte bestämma din position just nu. Försök igen om en liten stund.",
      };
    case error.TIMEOUT:
      return {
        kind: "timeout",
        message: "Det tog för lång tid att hämta GPS-position. Försök igen.",
      };
    default:
      return {
        kind: "unknown",
        message: "Kunde inte hämta GPS-position.",
      };
  }
}

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [membershipStatus, setMembershipStatus] =
    useState<MembershipStatus>("guest");

  const [caughtFor, setCaughtFor] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");
  const [fishType, setFishType] = useState("");
  const [fineFishType, setFineFishType] = useState("");
  const [weight, setWeight] = useState("");
  const [catchDate, setCatchDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<GpsErrorState | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const [approvedCatches, setApprovedCatches] = useState<Catch[]>([]);
  const [filter, setFilter] = useState<LeaderboardFilter>("bigfive");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const hasActiveMembership = membershipStatus === "active";

  const leaderboard = useMemo(() => {
    return buildLeaderboard(approvedCatches, filter);
  }, [approvedCatches, filter]);

  const recentApprovedCatches = useMemo(() => {
    return approvedCatches.slice(0, 5);
  }, [approvedCatches]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        const [membersResponse, catchesResponse] = await Promise.all([
          supabase
            .from("members")
            .select(HOME_ACTIVE_MEMBERS_SELECT)
            .eq("is_active", true)
            .order("name", { ascending: true }),
          supabase
            .from("catches")
            .select(HOME_APPROVED_CATCHES_SELECT)
            .eq("status", "approved")
            .order("created_at", { ascending: false }),
        ]);

        if (!mounted) return;

        if (membersResponse.error) {
          console.error(membersResponse.error);
        } else {
          setMembers(membersResponse.data || []);
        }

        if (catchesResponse.error) {
          console.error(catchesResponse.error);
        } else {
          setApprovedCatches(catchesResponse.data || []);
        }
      } catch (error) {
        if (!mounted) return;
        console.error(error);
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadMembershipStatus(userId: string) {
      const { data: memberData, error } = await supabase
        .from("members")
        .select("is_active")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error(error);
        setMembershipStatus("pending");
        return;
      }

      setMembershipStatus(memberData?.is_active ? "active" : "pending");
    }

    async function loadAuthState() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setIsLoggedIn(false);
        setMembershipStatus("guest");
        return;
      }

      setIsLoggedIn(true);
      await loadMembershipStatus(session.user.id);
    }

    loadAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setIsLoggedIn(false);
        setMembershipStatus("guest");
        return;
      }

      setIsLoggedIn(true);
      await loadMembershipStatus(session.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const compressImage = useCallback(async (file: File): Promise<File> => {
    const imageBitmap = await createImageBitmap(file);

    const maxWidth = 1200;
    const maxHeight = 1200;
    const { width, height } = imageBitmap;

    const scale = Math.min(maxWidth / width, maxHeight / height, 1);

    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Kunde inte skapa canvas-kontext.");
    }

    ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.78);
    });

    if (!blob) {
      throw new Error("Kunde inte komprimera bilden.");
    }

    const originalName = file.name.replace(/\.[^/.]+$/, "");
    return new File([blob], `${originalName}.jpg`, {
      type: "image/jpeg",
    });
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<UploadImageResult> => {
      const originalSizeBytes = file.size;
      const compressedFile = await compressImage(file);
      const compressedSizeBytes = compressedFile.size;

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.jpg`;
      const filePath = `catches/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("catch-images")
        .upload(filePath, compressedFile, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("catch-images")
        .getPublicUrl(filePath);

      return {
        imageUrl: data.publicUrl,
        originalSizeBytes,
        compressedSizeBytes,
      };
    },
    [compressImage]
  );

  const handleFilterChange = useCallback((value: LeaderboardFilter) => {
    setFilter(value);
  }, []);

  const handleCaughtForChange = useCallback((value: string) => {
    setCaughtFor((prevCaughtFor) => {
      setRegisteredBy((prevRegisteredBy) =>
        prevRegisteredBy === "" || prevRegisteredBy === prevCaughtFor
          ? value
          : prevRegisteredBy
      );

      return value;
    });
  }, []);

  const handleFishTypeChange = useCallback((value: string) => {
    setFishType(value);

    if (value !== "Fina fisken") {
      setFineFishType("");
    }
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    setImageFile(file);
  }, []);

  const handleGetGps = useCallback(async () => {
    if (!hasActiveMembership) {
      return;
    }

    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError({
        kind: "unsupported",
        message: "GPS stöds inte i den här enheten/webbläsaren.",
      });
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);

        if (!locationName.trim()) {
          setLocationName("GPS-hämtad plats");
        }

        setGpsError(null);
        setGpsLoading(false);
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        setGpsError(getGeolocationErrorState(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  }, [hasActiveMembership, locationName]);

  const handleMapSelect = useCallback(
    (lat: number, lng: number) => {
      if (!hasActiveMembership) {
        return;
      }

      setLatitude(lat);
      setLongitude(lng);
      setGpsError(null);

      if (!locationName.trim()) {
        setLocationName(`Kartvald plats (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      }

      setMapOpen(false);
    },
    [hasActiveMembership, locationName]
  );

  const handleOpenMap = useCallback(() => {
    setGpsError(null);
    setMapOpen(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    setMapOpen(false);
  }, []);

  const handleImageClick = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const handleCloseSelectedImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!isLoggedIn) {
        alert("Du behöver vara inloggad för att registrera en fångst.");
        window.location.href = "/login";
        return;
      }

      if (!hasActiveMembership) {
        alert(
          "Ditt medlemskap är under granskning, så snart vi fiskat klart kikar vi på din ansökan."
        );
        return;
      }

      if (
        !caughtFor.trim() ||
        !registeredBy.trim() ||
        !fishType.trim() ||
        !weight.trim() ||
        !catchDate
      ) {
        alert("Fyll i alla obligatoriska fält.");
        return;
      }

      if (fishType === "Fina fisken" && !fineFishType.trim()) {
        alert("Fyll i art på fina fisken.");
        return;
      }

      if (!imageFile) {
        alert("Välj en bild.");
        return;
      }

      if (!locationName.trim()) {
        const shouldContinue = window.confirm(
          "Du har inte angett plats, säker att du vill fortsätta?"
        );

        if (!shouldContinue) {
          return;
        }
      }

      setLoading(true);

      try {
        const uploadResult = await uploadImage(imageFile);

        const { error } = await supabase.from("catches").insert([
          {
            caught_for: caughtFor.trim(),
            registered_by: registeredBy.trim(),
            fish_type: fishType,
            fine_fish_type:
              fishType === "Fina fisken" ? fineFishType.trim() : null,
            weight_g: Number(weight),
            catch_date: catchDate,
            location_name: locationName.trim() || null,
            image_url: uploadResult.imageUrl,
            latitude,
            longitude,
            original_image_size_bytes: uploadResult.originalSizeBytes,
            compressed_image_size_bytes: uploadResult.compressedSizeBytes,
            status: "pending",
          },
        ]);

        if (error) {
          console.error(error);
          alert("Fel vid sparning.");
          setLoading(false);
          return;
        }

        setCaughtFor("");
        setRegisteredBy("");
        setFishType("");
        setFineFishType("");
        setWeight("");
        setCatchDate("");
        setLocationName("");
        setImageFile(null);
        setLatitude(null);
        setLongitude(null);
        setGpsError(null);
        setFileInputKey((prev) => prev + 1);

        alert("Fångsten skickades in och väntar på godkännande.");
      } catch (error) {
        console.error(error);
        alert("Fel vid bilduppladdning.");
      }

      setLoading(false);
    },
    [
      isLoggedIn,
      hasActiveMembership,
      caughtFor,
      registeredBy,
      fishType,
      fineFishType,
      weight,
      catchDate,
      imageFile,
      locationName,
      uploadImage,
      latitude,
      longitude,
    ]
  );

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mx-auto max-w-xl">
        <div id="leaderboard-section" className="scroll-mt-[360px]">
          <LeaderboardSection
            leaderboard={leaderboard}
            members={members}
            filter={filter}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent" />

        <div id="upload-section" className="scroll-mt-[360px]">
          <UploadCatchSection
            isLoggedIn={isLoggedIn}
            hasActiveMembership={hasActiveMembership}
            members={members}
            caughtFor={caughtFor}
            registeredBy={registeredBy}
            fishType={fishType}
            fineFishType={fineFishType}
            weight={weight}
            catchDate={catchDate}
            locationName={locationName}
            latitude={latitude}
            longitude={longitude}
            gpsLoading={gpsLoading}
            gpsError={gpsError}
            mapOpen={mapOpen}
            previewUrl={previewUrl}
            fileInputKey={fileInputKey}
            loading={loading}
            onSubmit={handleSubmit}
            onCaughtForChange={handleCaughtForChange}
            onRegisteredByChange={setRegisteredBy}
            onFishTypeChange={handleFishTypeChange}
            onFineFishTypeChange={setFineFishType}
            onWeightChange={setWeight}
            onCatchDateChange={setCatchDate}
            onLocationNameChange={setLocationName}
            onGetGps={handleGetGps}
            onOpenMap={handleOpenMap}
            onCloseMap={handleCloseMap}
            onMapSelect={handleMapSelect}
            onImageChange={handleImageChange}
          />
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent" />

        <div id="approved-section" className="scroll-mt-[360px]">
          <RecentApprovedSection
            catches={recentApprovedCatches}
            onImageClick={handleImageClick}
          />
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent" />

        <div id="map-section" className="scroll-mt-[360px]">
          <MapPreviewSection
            isLoggedIn={isLoggedIn}
            hasActiveMembership={hasActiveMembership}
            catches={approvedCatches}
          />
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={handleCloseSelectedImage}
          >
            <img
              src={selectedImage}
              alt="Förstorad fångstbild"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
              decoding="async"
            />
          </div>
        )}
      </div>
    </main>
  );
}
