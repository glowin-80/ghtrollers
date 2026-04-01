"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Catch,
  LeaderboardEntry,
  LeaderboardFilter,
  Member,
  UploadImageResult,
} from "@/types/home";
import LeaderboardSection from "@/components/home/LeaderboardSection";
import UploadCatchSection from "@/components/home/UploadCatchSection";
import RecentApprovedSection from "@/components/home/RecentApprovedSection";
import MapPreviewSection from "@/components/home/MapPreviewSection";

type MembershipStatus = "guest" | "pending" | "active";

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
  const [mapOpen, setMapOpen] = useState(false);

  const [approvedCatches, setApprovedCatches] = useState<Catch[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<LeaderboardFilter>("bigfive");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const hasActiveMembership = membershipStatus === "active";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    loadMembers();
    loadApprovedCatches();
    loadLeaderboard("bigfive");
  }, []);

  useEffect(() => {
    let mounted = true;

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

      const { data: memberData, error } = await supabase
        .from("members")
        .select("is_active")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error(error);
        setMembershipStatus("pending");
        return;
      }

      setMembershipStatus(memberData?.is_active ? "active" : "pending");
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

      const { data: memberData, error } = await supabase
        .from("members")
        .select("is_active")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setMembershipStatus("pending");
        return;
      }

      setMembershipStatus(memberData?.is_active ? "active" : "pending");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setMembers(data || []);
  }

  async function loadApprovedCatches() {
    const { data, error } = await supabase
      .from("catches")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setApprovedCatches(data || []);
  }

  async function loadLeaderboard(type: LeaderboardFilter) {
    const { data, error } = await supabase
      .from("catches")
      .select("*")
      .eq("status", "approved");

    if (error) {
      console.error(error);
      return;
    }

    if (!data || data.length === 0) {
      setLeaderboard([]);
      return;
    }

    if (type === "bigfive") {
      const grouped: Record<string, number[]> = {};

      data.forEach((c) => {
        const score = c.fish_type === "Abborre" ? c.weight_g * 4 : c.weight_g;

        if (!grouped[c.caught_for]) {
          grouped[c.caught_for] = [];
        }

        grouped[c.caught_for].push(score);
      });

      const result = Object.entries(grouped)
        .map(([name, scores]) => {
          const topFive = scores.sort((a, b) => b - a).slice(0, 5);
          const total = topFive.reduce((sum, value) => sum + value, 0);

          return { name, total, detail: null };
        })
        .sort((a, b) => b.total - a.total);

      setLeaderboard(result);
      return;
    }

    let filtered = data;

    if (type === "gädda") {
      filtered = data.filter((c) => c.fish_type === "Gädda");
    }

    if (type === "abborre") {
      filtered = data.filter((c) => c.fish_type === "Abborre");
    }

    if (type === "fina") {
      filtered = data.filter((c) => c.fish_type === "Fina fisken");
    }

    const sorted = filtered
      .sort((a, b) => b.weight_g - a.weight_g)
      .map((c) => ({
        name: c.caught_for,
        total: c.weight_g,
        detail: type === "fina" ? c.fine_fish_type || null : null,
      }));

    setLeaderboard(sorted);
  }

  async function compressImage(file: File): Promise<File> {
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
  }

  async function uploadImage(file: File): Promise<UploadImageResult> {
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
  }

  function handleFilterChange(value: LeaderboardFilter) {
    setFilter(value);
    loadLeaderboard(value);
  }

  function handleCaughtForChange(value: string) {
    setCaughtFor(value);
    setRegisteredBy((prev) => (prev === "" || prev === caughtFor ? value : prev));
  }

  function handleFishTypeChange(value: string) {
    setFishType(value);

    if (value !== "Fina fisken") {
      setFineFishType("");
    }
  }

  function handleImageChange(file: File | null) {
    setImageFile(file);
  }

  async function handleGetGps() {
    if (!hasActiveMembership) {
      return;
    }

    if (!navigator.geolocation) {
      alert("GPS stöds inte i den här enheten/webbläsaren.");
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

        setGpsLoading(false);
      },
      (error) => {
        console.error(error);
        alert("Kunde inte hämta GPS-position.");
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  function handleMapSelect(lat: number, lng: number) {
    if (!hasActiveMembership) {
      return;
    }

    setLatitude(lat);
    setLongitude(lng);

    if (!locationName.trim()) {
      setLocationName(`Kartvald plats (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }

    setMapOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
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
      setFileInputKey((prev) => prev + 1);

      alert("Fångsten skickades in och väntar på godkännande.");
    } catch (error) {
      console.error(error);
      alert("Fel vid bilduppladdning.");
    }

    setLoading(false);
  }

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
            onOpenMap={() => setMapOpen(true)}
            onCloseMap={() => setMapOpen(false)}
            onMapSelect={handleMapSelect}
            onImageChange={handleImageChange}
          />
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent" />

        <div id="approved-section" className="scroll-mt-[360px]">
          <RecentApprovedSection
            catches={approvedCatches.slice(0, 5)}
            onImageClick={(url) => setSelectedImage(url)}
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
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Förstorad fångstbild"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </main>
  );
}
