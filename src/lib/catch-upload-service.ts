import { supabase } from "@/lib/supabase";
import { uploadCatchImage } from "@/lib/home-upload";
import { identifyWaterBody, isValidCoordinate } from "@/lib/water-identification";

export class CatchUploadDatabaseError extends Error {
  constructor(message = "Fel vid sparning.") {
    super(message);
    this.name = "CatchUploadDatabaseError";
  }
}

export type SubmitCatchPayload = {
  caughtFor: string;
  caughtForMemberId?: string | null;
  registeredBy: string;
  registeredByMemberId?: string | null;
  fishType: string;
  fineFishType: string;
  weight: string;
  catchDate: string;
  fishingMethod: string;
  liveScope: boolean;
  caughtAbroad: boolean;
  isLocationPrivate: boolean;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  imageFile: File;
};

type CatchWaterIdentification = {
  waterName: string | null;
  waterKey: string | null;
};

function getStoragePathFromPublicUrl(publicUrl: string) {
  const marker = "/storage/v1/object/public/catch-images/";
  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return publicUrl.slice(index + marker.length);
}

async function cleanupUploadedCatchImage(imageUrl: string) {
  const filePath = getStoragePathFromPublicUrl(imageUrl);

  if (!filePath) {
    return;
  }

  const { error } = await supabase.storage.from("catch-images").remove([filePath]);

  if (error) {
    console.error(error);
  }
}

async function identifyWaterForCatch(
  latitude: number | null,
  longitude: number | null
): Promise<CatchWaterIdentification> {
  if (latitude === null || longitude === null) {
    return {
      waterName: null,
      waterKey: null,
    };
  }

  if (!isValidCoordinate(latitude, longitude)) {
    return {
      waterName: null,
      waterKey: null,
    };
  }

  try {
    const water = await identifyWaterBody(latitude, longitude);

    // Dubbel logik:
    // - water.found kan vara true upp till 1000 meter för visning i UI.
    // - water.achievementEligible är bara true för säker fångstkoppling (inne i vatten eller max 250 meter).
    // Därför sparar vi bara water_name/water_key på catch när den är säker nog för achievements.
    if (!water.achievementEligible || !water.name || !water.waterKey) {
      return {
        waterName: null,
        waterKey: null,
      };
    }

    return {
      waterName: water.name,
      waterKey: water.waterKey,
    };
  } catch (error) {
    console.warn("Could not identify water for catch upload", error);

    return {
      waterName: null,
      waterKey: null,
    };
  }
}

export async function submitCatchWithImage(payload: SubmitCatchPayload) {
  const uploadResult = await uploadCatchImage(payload.imageFile);
  const waterIdentification = await identifyWaterForCatch(
    payload.latitude,
    payload.longitude
  );

  const { error } = await supabase.from("catches").insert([
    {
      caught_for: payload.caughtFor.trim(),
      caught_for_member_id: payload.caughtForMemberId?.trim() || null,
      registered_by: payload.registeredBy.trim(),
      registered_by_member_id: payload.registeredByMemberId?.trim() || null,
      fish_type: payload.fishType,
      fine_fish_type:
        payload.fishType === "Fina fisken" ? payload.fineFishType : null,
      weight_g: Number(payload.weight),
      catch_date: payload.catchDate,
      fishing_method: payload.fishingMethod.trim(),
      live_scope: payload.liveScope,
      caught_abroad: payload.caughtAbroad,
      is_location_private: payload.isLocationPrivate,
      location_name: payload.locationName.trim() || null,
      water_name: waterIdentification.waterName,
      water_key: waterIdentification.waterKey,
      image_url: uploadResult.imageUrl,
      latitude: payload.latitude,
      longitude: payload.longitude,
      original_image_size_bytes: uploadResult.originalSizeBytes,
      compressed_image_size_bytes: uploadResult.compressedSizeBytes,
      status: "pending",
    },
  ]);

  if (error) {
    await cleanupUploadedCatchImage(uploadResult.imageUrl);
    throw new CatchUploadDatabaseError();
  }
}
