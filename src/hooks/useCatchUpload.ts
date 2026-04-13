import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getGeolocationErrorState } from "@/lib/home-upload";
import { useCatchUploadForm } from "@/hooks/useCatchUploadForm";
import { validateCatchUpload } from "@/lib/catch-upload-validation";
import {
  CatchUploadDatabaseError,
  submitCatchWithImage,
} from "@/lib/catch-upload-service";
import type { Member } from "@/types/home";
import type {
  GpsErrorState,
  UploadFeedbackMessage,
} from "@/components/home/upload/types";

type UseCatchUploadOptions = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
  registeredByDefault: string;
  registeredByMemberId?: string | null;
  isGuestAngler?: boolean;
  members: Member[];
};

export function useCatchUpload({
  isLoggedIn,
  hasActiveMembership,
  registeredByDefault,
  registeredByMemberId = null,
  isGuestAngler = false,
  members,
}: UseCatchUploadOptions) {
  const router = useRouter();
  const {
    caughtForMemberId,
    registeredBy,
    registeredByMemberId: currentRegisteredByMemberId,
    fishType,
    fineFishType,
    weight,
    catchDate,
    fishingMethod,
    liveScope,
    caughtAbroad,
    isLocationPrivate,
    locationName,
    imageFile,
    previewUrl,
    fileInputKey,
    resetForm,
    handleCaughtForChange,
    handleFishTypeChange,
    handleFineFishTypeChange,
    handleWeightChange,
    handleCatchDateChange,
    handleFishingMethodChange,
    handleLiveScopeChange,
    handleCaughtAbroadChange,
    handleIsLocationPrivateChange,
    handleLocationNameChange,
    handleImageChange,
  } = useCatchUploadForm({
    registeredByDefault,
    registeredByMemberIdDefault: registeredByMemberId,
  });

  const caughtForMember = useMemo(
    () => members.find((member) => member.id === caughtForMemberId) ?? null,
    [members, caughtForMemberId]
  );
  const caughtForName = caughtForMember?.name ?? "";

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<GpsErrorState | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [locationChooserOpen, setLocationChooserOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<UploadFeedbackMessage | null>(null);
  const [confirmMissingLocationOpen, setConfirmMissingLocationOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [validationDialogMessage, setValidationDialogMessage] = useState<string | null>(null);

  const resetLocationState = useCallback(() => {
    setLatitude(null);
    setLongitude(null);
    setGpsError(null);
    setLocationChooserOpen(false);
    setMapOpen(false);
    setConfirmMissingLocationOpen(false);
  }, []);

  const resetEntireForm = useCallback(() => {
    resetForm();
    resetLocationState();
  }, [resetForm, resetLocationState]);

  const dismissFormMessage = useCallback(() => setFormMessage(null), []);
  const dismissSuccessDialog = useCallback(() => setSuccessDialogOpen(false), []);
  const dismissValidationDialog = useCallback(
    () => setValidationDialogMessage(null),
    []
  );

  const handleFormMessageAction = useCallback(() => {
    if (formMessage?.actionType === "login") router.push("/login");
  }, [formMessage, router]);

  const handleOpenLocationChooser = useCallback(
    () => setLocationChooserOpen(true),
    []
  );
  const handleCloseLocationChooser = useCallback(
    () => setLocationChooserOpen(false),
    []
  );

  const handleSaveManualLocation = useCallback(
    (value: string) => {
      handleLocationNameChange(value);
      setLatitude(null);
      setLongitude(null);
      setGpsError(null);
      setLocationChooserOpen(false);
    },
    [handleLocationNameChange]
  );

  const handleGetGps = useCallback(() => {
    if (!hasActiveMembership) return;
    setGpsError(null);
    setLocationChooserOpen(false);

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
        handleLocationNameChange("GPS-hämtad plats");
        setGpsError(null);
        setGpsLoading(false);
      },
      (error) => {
        console.error(error);
        setGpsLoading(false);
        setGpsError(getGeolocationErrorState(error));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  }, [hasActiveMembership, handleLocationNameChange]);

  const handleOpenMap = useCallback(() => {
    setGpsError(null);
    setLocationChooserOpen(false);
    setMapOpen(true);
  }, []);

  const handleCloseMap = useCallback(() => setMapOpen(false), []);

  const handleMapSelect = useCallback(
    (lat: number, lng: number) => {
      if (!hasActiveMembership) return;
      setLatitude(lat);
      setLongitude(lng);
      setGpsError(null);
      handleLocationNameChange(`Kartvald plats (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      setLocationChooserOpen(false);
      setMapOpen(false);
    },
    [hasActiveMembership, handleLocationNameChange]
  );

  const submitCatch = useCallback(
    async ({ allowMissingLocation }: { allowMissingLocation: boolean }) => {
      const validationResult = validateCatchUpload({
        isLoggedIn,
        hasActiveMembership,
        caughtFor: caughtForName,
        registeredBy,
        fishType,
        fineFishType,
        weight,
        catchDate,
        fishingMethod,
        locationName,
        imageFile,
        allowMissingLocation,
      });

      if (!validationResult.ok) {
        if (validationResult.requiresMissingLocationConfirmation) {
          setConfirmMissingLocationOpen(true);
          return;
        }

        if (validationResult.missingSections?.length) {
          setValidationDialogMessage(validationResult.message.message);
          return;
        }

        setFormMessage(validationResult.message);
        return;
      }

      setLoading(true);
      setFormMessage(null);
      setValidationDialogMessage(null);
      setConfirmMissingLocationOpen(false);

      try {
        await submitCatchWithImage({
          caughtFor: caughtForName,
          caughtForMemberId: caughtForMember?.id ?? null,
          registeredBy,
          registeredByMemberId: currentRegisteredByMemberId,
          fishType,
          fineFishType: validationResult.normalizedFineFishType,
          weight,
          catchDate,
          fishingMethod,
          liveScope,
          caughtAbroad,
          isLocationPrivate,
          locationName,
          latitude,
          longitude,
          imageFile: imageFile as File,
        });
        resetEntireForm();
        setSuccessDialogOpen(true);
      } catch (error) {
        console.error(error);
        setFormMessage({
          variant: "error",
          message:
            error instanceof CatchUploadDatabaseError
              ? "Fel vid sparning."
              : "Fel vid bilduppladdning.",
        });
      } finally {
        setLoading(false);
      }
    },
    [
      isLoggedIn,
      hasActiveMembership,
      caughtForName,
      caughtForMember,
      registeredBy,
      currentRegisteredByMemberId,
      fishType,
      fineFishType,
      weight,
      catchDate,
      fishingMethod,
      locationName,
      imageFile,
      liveScope,
      caughtAbroad,
      isLocationPrivate,
      latitude,
      longitude,
      resetEntireForm,
    ]
  );

  return {
    caughtForMemberId,
    registeredBy,
    fishType,
    fineFishType,
    weight,
    catchDate,
    fishingMethod,
    liveScope,
    caughtAbroad,
    isLocationPrivate,
    locationName,
    latitude,
    longitude,
    gpsLoading,
    gpsError,
    formMessage,
    confirmMissingLocationOpen,
    successDialogOpen,
    validationDialogMessage,
    mapOpen,
    locationChooserOpen,
    previewUrl,
    fileInputKey,
    loading,
    handleFineFishTypeChange,
    handleWeightChange,
    handleCatchDateChange,
    handleFishingMethodChange,
    handleLiveScopeChange,
    handleCaughtAbroadChange,
    handleIsLocationPrivateChange,
    handleLocationNameChange,
    handleImageChange,
    handleCaughtForChange,
    handleFishTypeChange,
    handleOpenLocationChooser,
    handleCloseLocationChooser,
    handleSaveManualLocation,
    handleGetGps,
    handleOpenMap,
    handleCloseMap,
    handleMapSelect,
    handleSubmit: useCallback(
      async (e: FormEvent) => {
        e.preventDefault();
        await submitCatch({ allowMissingLocation: false });
      },
      [submitCatch]
    ),
    dismissFormMessage,
    handleFormMessageAction,
    handleConfirmMissingLocation: useCallback(async () => {
      await submitCatch({ allowMissingLocation: true });
    }, [submitCatch]),
    handleCancelMissingLocation: useCallback(
      () => setConfirmMissingLocationOpen(false),
      []
    ),
    onDismissSuccessDialog: dismissSuccessDialog,
    onDismissValidationDialog: dismissValidationDialog,
  };
}
