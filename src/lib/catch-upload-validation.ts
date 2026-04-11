import { normalizeFineFishTypeForSave } from "@/lib/home-upload";
import type { UploadFeedbackMessage } from "@/components/home/upload/types";

export type CatchUploadValidationInput = {
  isLoggedIn: boolean;
  hasActiveMembership: boolean;
  caughtFor: string;
  registeredBy: string;
  fishType: string;
  fineFishType: string;
  weight: string;
  catchDate: string;
  fishingMethod: string;
  locationName: string;
  imageFile: File | null;
  allowMissingLocation: boolean;
};

export type CatchUploadValidationResult =
  | {
      ok: true;
      normalizedFineFishType: string;
    }
  | {
      ok: false;
      message: UploadFeedbackMessage;
      requiresMissingLocationConfirmation?: boolean;
      missingSections?: string[];
    };

export function validateCatchUpload(
  input: CatchUploadValidationInput
): CatchUploadValidationResult {
  if (!input.isLoggedIn) {
    return {
      ok: false,
      message: {
        variant: "error",
        message: "Du behöver vara inloggad för att registrera en fångst.",
        actionLabel: "Logga in",
        actionType: "login",
      },
    };
  }

  if (!input.hasActiveMembership) {
    return {
      ok: false,
      message: {
        variant: "info",
        message:
          "Ditt medlemskap är under granskning, så snart vi fiskat klart kikar vi på din ansökan.",
      },
    };
  }

  const missingSections: string[] = [];

  if (!input.caughtFor.trim()) {
    missingSections.push("Vem som fångade fisken");
  }

  if (!input.registeredBy.trim()) {
    missingSections.push("Registrerad av");
  }

  if (!input.fishType.trim()) {
    missingSections.push("Art");
  }

  if (!input.weight.trim()) {
    missingSections.push("Vikt");
  }

  if (!input.catchDate) {
    missingSections.push("Datum för fångst");
  }

  if (!input.fishingMethod.trim()) {
    missingSections.push("Fiskemetod");
  }

  const normalizedFineFishType = normalizeFineFishTypeForSave(input.fineFishType);

  if (input.fishType === "Fina fisken" && !normalizedFineFishType) {
    missingSections.push("Art på fina fisken");
  }

  if (!input.imageFile) {
    missingSections.push("Fångstbild");
  }

  if (missingSections.length > 0) {
    return {
      ok: false,
      message: {
        variant: "error",
        message: `Följande saknas för att registrera fångst:\n• ${missingSections.join("\n• ")}`,
      },
      missingSections,
    };
  }

  if (!input.locationName.trim() && !input.allowMissingLocation) {
    return {
      ok: false,
      message: {
        variant: "info",
        message: "Ingen plats angiven",
      },
      requiresMissingLocationConfirmation: true,
    };
  }

  return {
    ok: true,
    normalizedFineFishType,
  };
}
