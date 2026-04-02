import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import {
  getGeolocationErrorState,
  uploadCatchImage,
} from "@/lib/home-upload";
import type { GpsErrorState } from "@/components/home/upload/types";

type UseCatchUploadOptions = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
};

export function useCatchUpload({
  isLoggedIn,
  hasActiveMembership,
}: UseCatchUploadOptions) {
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
  const [loading, setLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetForm = useCallback(() => {
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
    setMapOpen(false);
    setFileInputKey((prev) => prev + 1);
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

  const handleRegisteredByChange = useCallback((value: string) => {
    setRegisteredBy(value);
  }, []);

  const handleFineFishTypeChange = useCallback((value: string) => {
    setFineFishType(value);
  }, []);

  const handleWeightChange = useCallback((value: string) => {
    setWeight(value);
  }, []);

  const handleCatchDateChange = useCallback((value: string) => {
    setCatchDate(value);
  }, []);

  const handleLocationNameChange = useCallback((value: string) => {
    setLocationName(value);
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    setImageFile(file);
  }, []);

  const handleGetGps = useCallback(() => {
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

  const handleOpenMap = useCallback(() => {
    setGpsError(null);
    setMapOpen(true);
  }, []);

  const handleCloseMap = useCallback(() => {
    setMapOpen(false);
  }, []);

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

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
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
        const uploadResult = await uploadCatchImage(imageFile);

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

        resetForm();
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
      latitude,
      longitude,
      resetForm,
    ]
  );

  return {
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
    handleRegisteredByChange,
    handleFineFishTypeChange,
    handleWeightChange,
    handleCatchDateChange,
    handleLocationNameChange,
    handleImageChange,
    handleCaughtForChange,
    handleFishTypeChange,
    handleGetGps,
    handleOpenMap,
    handleCloseMap,
    handleMapSelect,
    handleSubmit,
  };
}