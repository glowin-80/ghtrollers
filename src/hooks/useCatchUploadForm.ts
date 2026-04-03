import { useCallback, useEffect, useMemo, useState } from "react";
import { normalizeFineFishTypeInput } from "@/lib/home-upload";

export function useCatchUploadForm() {
  const [caughtFor, setCaughtFor] = useState("");
  const [registeredBy, setRegisteredBy] = useState("");
  const [fishType, setFishType] = useState("");
  const [fineFishType, setFineFishType] = useState("");
  const [weight, setWeight] = useState("");
  const [catchDate, setCatchDate] = useState("");
  const [locationName, setLocationName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    setFineFishType(normalizeFineFishTypeInput(value));
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

  return {
    caughtFor,
    registeredBy,
    fishType,
    fineFishType,
    weight,
    catchDate,
    locationName,
    imageFile,
    previewUrl,
    fileInputKey,
    resetForm,
    handleCaughtForChange,
    handleFishTypeChange,
    handleRegisteredByChange,
    handleFineFishTypeChange,
    handleWeightChange,
    handleCatchDateChange,
    handleLocationNameChange,
    handleImageChange,
  };
}
