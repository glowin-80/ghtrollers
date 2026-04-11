import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeFineFishTypeInput } from "@/lib/home-upload";

type UseCatchUploadFormOptions = { registeredByDefault: string };

export function useCatchUploadForm({ registeredByDefault }: UseCatchUploadFormOptions) {
  const [caughtFor, setCaughtFor] = useState("");
  const [registeredBy, setRegisteredBy] = useState(registeredByDefault);
  const [fishType, setFishType] = useState("");
  const [fineFishType, setFineFishType] = useState("");
  const [weight, setWeight] = useState("");
  const [catchDate, setCatchDate] = useState("");
  const [fishingMethod, setFishingMethod] = useState("");
  const [liveScope, setLiveScope] = useState(false);
  const [caughtAbroad, setCaughtAbroad] = useState(false);
  const [isLocationPrivate, setIsLocationPrivate] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    setRegisteredBy(registeredByDefault);
  }, [registeredByDefault]);

  const resetForm = useCallback(() => {
    setCaughtFor("");
    setRegisteredBy(registeredByDefault);
    setFishType("");
    setFineFishType("");
    setWeight("");
    setCatchDate("");
    setFishingMethod("");
    setLiveScope(false);
    setCaughtAbroad(false);
    setIsLocationPrivate(false);
    setLocationName("");
    setImageFile(null);
    setFileInputKey((prev) => prev + 1);
  }, [registeredByDefault]);

  const handleFishTypeChange = useCallback((value: string) => {
    setFishType(value);
    if (value !== "Fina fisken") {
      setFineFishType("");
    }
  }, []);

  return {
    caughtFor,
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
    imageFile,
    previewUrl,
    fileInputKey,
    resetForm,
    handleCaughtForChange: useCallback((value: string) => setCaughtFor(value), []),
    handleFishTypeChange,
    handleFineFishTypeChange: useCallback(
      (value: string) => setFineFishType(normalizeFineFishTypeInput(value)),
      []
    ),
    handleWeightChange: useCallback((value: string) => setWeight(value), []),
    handleCatchDateChange: useCallback((value: string) => setCatchDate(value), []),
    handleFishingMethodChange: useCallback((value: string) => setFishingMethod(value), []),
    handleLiveScopeChange: useCallback((value: boolean) => setLiveScope(value), []),
    handleCaughtAbroadChange: useCallback((value: boolean) => setCaughtAbroad(value), []),
    handleIsLocationPrivateChange: useCallback((value: boolean) => setIsLocationPrivate(value), []),
    handleLocationNameChange: useCallback((value: string) => setLocationName(value), []),
    handleImageChange: useCallback((file: File | null) => setImageFile(file), []),
  };
}
