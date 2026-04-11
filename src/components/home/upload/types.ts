import type { FormEvent } from "react";
import type { Member } from "@/types/home";

export type GpsErrorKind =
  | "permission-denied"
  | "position-unavailable"
  | "timeout"
  | "unsupported"
  | "unknown";

export type GpsErrorState = {
  kind: GpsErrorKind;
  message: string;
};

export type MobileHelpPlatform = "iphone" | "android";

export type UploadFeedbackVariant = "info" | "success" | "error";

export type UploadFeedbackMessage = {
  variant: UploadFeedbackVariant;
  message: string;
  actionLabel?: string;
  actionType?: "login";
};

export type UploadCatchSectionProps = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
  members: Member[];
  caughtFor: string;
  registeredBy: string;
  fishType: string;
  fineFishType: string;
  weight: string;
  catchDate: string;
  fishingMethod: string;
  caughtAbroad: boolean;
  isLocationPrivate: boolean;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  gpsLoading: boolean;
  gpsError: GpsErrorState | null;
  formMessage: UploadFeedbackMessage | null;
  confirmMissingLocationOpen: boolean;
  mapOpen: boolean;
  locationChooserOpen: boolean;
  previewUrl: string | null;
  fileInputKey: number;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
  onCaughtForChange: (value: string) => void;
  onFishTypeChange: (value: string) => void;
  onFineFishTypeChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onCatchDateChange: (value: string) => void;
  onFishingMethodChange: (value: string) => void;
  onCaughtAbroadChange: (value: boolean) => void;
  onIsLocationPrivateChange: (value: boolean) => void;
  onLocationNameChange: (value: string) => void;
  onOpenLocationChooser: () => void;
  onCloseLocationChooser: () => void;
  onSaveManualLocation: (value: string) => void;
  onGetGps: () => void;
  onOpenMap: () => void;
  onCloseMap: () => void;
  onMapSelect: (lat: number, lng: number) => void;
  onImageChange: (file: File | null) => void;
  onDismissFormMessage: () => void;
  onFormMessageAction: () => void;
  onConfirmMissingLocation: () => void;
  onCancelMissingLocation: () => void;
};