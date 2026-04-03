import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getGeolocationErrorState,
  normalizeFineFishTypeForSave,
  normalizeFineFishTypeInput,
  uploadCatchImage,
} from "@/lib/home-upload";
import type {
  GpsErrorState,
  UploadFeedbackMessage,
  UploadValidationField,
} from "@/components/home/upload/types";

type UseCatchUploadOptions = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
};

type ValidationErrors = Partial<Record<UploadValidationField, boolean>>;

export function useCatchUpload({
  isLoggedIn,
  hasActiveMembership,
}: UseCatchUploadOptions) {
  const router = useRouter();

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

  const [formMessage, setFormMessage] = useState<UploadFeedbackMessage | null>(null);
  const [confirmMissingLocationOpen, setConfirmMissingLocationOpen] =
    useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

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

  const clearValidationError = useCallback((field: UploadValidationField) => {
    setValidationErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const scrollToUploadSection = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }

    const uploadSection = document.getElementById("upload-section");
    uploadSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

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
    setConfirmMissingLocationOpen(false);
    setValidationErrors({});
    setFileInputKey((prev) => prev + 1);
  }, []);

  const dismissFormMessage = useCallback(() => {
    setFormMessage(null);
  }, []);

  const handleFormMessageAction = useCallback(() => {
    if (formMessage?.actionType === "login") {
      router.push("/login");
    }
  }, [formMessage, router]);

  const handleCaughtForChange = useCallback(
    (value: string) => {
      clearValidationError("caughtFor");

      setCaughtFor((prevCaughtFor) => {
        setRegisteredBy((prevRegisteredBy) =>
          prevRegisteredBy === "" || prevRegisteredBy === prevCaughtFor
            ? value
            : prevRegisteredBy
        );

        return value;
      });
    },
    [clearValidationError]
  );

  const handleFishTypeChange = useCallback(
    (value: string) => {
      clearValidationError("fishType");
      setFishType(value);

      if (value !== "Fina fisken") {
        setFineFishType("");
        clearValidationError("fineFishType");
      }
    },
    [clearValidationError]
  );

  const handleRegisteredByChange = useCallback(
    (value: string) => {
      clearValidationError("registeredBy");
      setRegisteredBy(value);
    },
    [clearValidationError]
  );

  const handleFineFishTypeChange = useCallback(
    (value: string) => {
      clearValidationError("fineFishType");
      setFineFishType(normalizeFineFishTypeInput(value));
    },
    [clearValidationError]
  );

  const handleWeightChange = useCallback(
    (value: string) => {
      clearValidationError("weight");
      setWeight(value);
    },
    [clearValidationError]
  );

  const handleCatchDateChange = useCallback(
    (value: string) => {
      clearValidationError("catchDate");
      setCatchDate(value);
    },
    [clearValidationError]
  );

  const handleLocationNameChange = useCallback((value: string) => {
    setLocationName(value);
  }, []);

  const handleImageChange = useCallback(
    (file: File | null) => {
      clearValidationError("imageFile");
      setImageFile(file);
    },
    [clearValidationError]
  );

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

  const submitCatch = useCallback(
    async ({ allowMissingLocation }: { allowMissingLocation: boolean }) => {
      if (!isLoggedIn) {
        setFormMessage({
          variant: "error",
          message: "Du behöver vara inloggad för att registrera en fångst.",
          actionLabel: "Logga in",
          actionType: "login",
        });
        scrollToUploadSection();
        return;
      }

      if (!hasActiveMembership) {
        setFormMessage({
          variant: "info",
          message:
            "Ditt medlemskap är under granskning, så snart vi fiskat klart kikar vi på din ansökan.",
        });
        scrollToUploadSection();
        return;
      }

      const normalizedFineFishType = normalizeFineFishTypeForSave(fineFishType);
      const nextValidationErrors: ValidationErrors = {};

      if (!caughtFor.trim()) {
        nextValidationErrors.caughtFor = true;
      }

      if (!registeredBy.trim()) {
        nextValidationErrors.registeredBy = true;
      }

      if (!fishType.trim()) {
        nextValidationErrors.fishType = true;
      }

      if (!weight.trim()) {
        nextValidationErrors.weight = true;
      }

      if (!catchDate) {
        nextValidationErrors.catchDate = true;
      }

      if (fishType === "Fina fisken" && !normalizedFineFishType) {
        nextValidationErrors.fineFishType = true;
      }

      if (!imageFile) {
        nextValidationErrors.imageFile = true;
      }

      if (Object.keys(nextValidationErrors).length > 0) {
        setValidationErrors(nextValidationErrors);
        setFormMessage({
          variant: "error",
          message: "Fyll i alla obligatoriska fält.",
        });
        scrollToUploadSection();
        return;
      }

            setValidationErrors({});

      const selectedImageFile = imageFile;
      if (!selectedImageFile) {
        setValidationErrors({ imageFile: true });
        setFormMessage({
          variant: "error",
          message: "Fyll i alla obligatoriska fält.",
        });
        scrollToUploadSection();
        return;
      }

      if (!locationName.trim() && !allowMissingLocation) {
        setConfirmMissingLocationOpen(true);
        return;
      }

      setLoading(true);
      setFormMessage(null);
      setConfirmMissingLocationOpen(false);

      try {
        const uploadResult = await uploadCatchImage(selectedImageFile);

        const { error } = await supabase.from("catches").insert([
          {
            caught_for: caughtFor.trim(),
            registered_by: registeredBy.trim(),
            fish_type: fishType,
            fine_fish_type:
              fishType === "Fina fisken" ? normalizedFineFishType : null,
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
          setFormMessage({
            variant: "error",
            message: "Fel vid sparning.",
          });
          scrollToUploadSection();
          setLoading(false);
          return;
        }

        resetForm();
        setFormMessage({
          variant: "success",
          message: "Fångsten skickades in och väntar på godkännande.",
        });
        scrollToUploadSection();
      } catch (error) {
        console.error(error);
        setFormMessage({
          variant: "error",
          message: "Fel vid bilduppladdning.",
        });
        scrollToUploadSection();
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
      scrollToUploadSection,
    ]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await submitCatch({ allowMissingLocation: false });
    },
    [submitCatch]
  );

  const handleConfirmMissingLocation = useCallback(async () => {
    await submitCatch({ allowMissingLocation: true });
  }, [submitCatch]);

  const handleCancelMissingLocation = useCallback(() => {
    setConfirmMissingLocationOpen(false);
  }, []);

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
    formMessage,
    validationErrors,
    confirmMissingLocationOpen,
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
    dismissFormMessage,
    handleFormMessageAction,
    handleConfirmMissingLocation,
    handleCancelMissingLocation,
  };
}