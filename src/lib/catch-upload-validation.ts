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

  if (
    !input.caughtFor.trim() ||
    !input.registeredBy.trim() ||
    !input.fishType.trim() ||
    !input.weight.trim() ||
    !input.catchDate
  ) {
    return {
      ok: false,
      message: {
        variant: "error",
        message: "Fyll i alla obligatoriska fält.",
      },
    };
  }

  const normalizedFineFishType = normalizeFineFishTypeForSave(input.fineFishType);

  if (input.fishType === "Fina fisken" && !normalizedFineFishType) {
    return {
      ok: false,
      message: {
        variant: "error",
        message: "Fyll i art på fina fisken.",
      },
    };
  }

  if (!input.imageFile) {
    return {
      ok: false,
      message: {
        variant: "error",
        message: "Välj en bild.",
      },
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
