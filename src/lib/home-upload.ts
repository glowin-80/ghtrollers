import { supabase } from "@/lib/supabase";
import { compressImageFile } from "@/lib/image-processing";
import type { UploadImageResult } from "@/types/home";
import type {
  GpsErrorState,
  MobileHelpPlatform,
} from "@/components/home/upload/types";

export function formatCatchDate(dateString: string) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function uppercaseFirstRealCharacter(value: string): string {
  const firstNonWhitespaceIndex = value.search(/\S/);

  if (firstNonWhitespaceIndex === -1) {
    return value;
  }

  const lowerCased = value.toLocaleLowerCase("sv-SE");

  return (
    lowerCased.slice(0, firstNonWhitespaceIndex) +
    lowerCased.charAt(firstNonWhitespaceIndex).toLocaleUpperCase("sv-SE") +
    lowerCased.slice(firstNonWhitespaceIndex + 1)
  );
}

export function normalizeFineFishTypeInput(value: string): string {
  return uppercaseFirstRealCharacter(value);
}

export function normalizeFineFishTypeForSave(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, " ");

  if (!cleaned) {
    return "";
  }

  return uppercaseFirstRealCharacter(cleaned);
}

export function detectMobileHelpPlatform(): MobileHelpPlatform {
  if (typeof navigator === "undefined") {
    return "iphone";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) {
    return "android";
  }

  return "iphone";
}

export function getGeolocationErrorState(
  error: GeolocationPositionError
): GpsErrorState {
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

export async function compressImage(file: File): Promise<File> {
  const originalName = file.name.replace(/\.[^/.]+$/, "");

  return compressImageFile(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.78,
    outputType: "image/jpeg",
    outputName: `${originalName}.jpg`,
  });
}

export async function uploadCatchImage(file: File): Promise<UploadImageResult> {
  const originalSizeBytes = file.size;
  const compressedFile = await compressImage(file);
  const compressedSizeBytes = compressedFile.size;

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
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

  const { data } = supabase.storage.from("catch-images").getPublicUrl(filePath);

  return {
    imageUrl: data.publicUrl,
    originalSizeBytes,
    compressedSizeBytes,
  };
}
