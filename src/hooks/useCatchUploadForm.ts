import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeFineFishTypeInput } from "@/lib/home-upload";

type UseCatchUploadFormOptions = {
  registeredByDefault: string;
  registeredByMemberIdDefault?: string | null;
};

export function useCatchUploadForm({
  registeredByDefault,
  registeredByMemberIdDefault = null,
}: UseCatchUploadFormOptions) {
  const [caughtForMemberId, setCaughtForMemberId] = useState("");
  const [registeredBy, setRegisteredBy] = useState(registeredByDefault);
  const [registeredByMemberId, setRegisteredByMemberId] = useState<string | null>(
    registeredByMemberIdDefault
  );
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

  useEffect(() => {
    setRegisteredByMemberId(registeredByMemberIdDefault);
  }, [registeredByMemberIdDefault]);

  const resetForm = useCallback(() => {
    setCaughtForMemberId("");
    setRegisteredBy(registeredByDefault);
    setRegisteredByMemberId(registeredByMemberIdDefault);
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
    setFileInputKey((prev: number) => prev + 1);
  }, [registeredByDefault, registeredByMemberIdDefault]);

  const handleFishTypeChange = useCallback((value: string) => {
    setFishType(value);
    if (value !== "Fina fisken") {
      setFineFishType("");
    }
  }, []);

  return {
    caughtForMemberId,
    registeredBy,
    registeredByMemberId,
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
    handleCaughtForChange: useCallback((value: string) => setCaughtForMemberId(value), []),
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
