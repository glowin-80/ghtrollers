import { supabase } from "@/lib/supabase";
import { uploadCatchImage } from "@/lib/home-upload";

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

export async function submitCatchWithImage(payload: SubmitCatchPayload) {
  const uploadResult = await uploadCatchImage(payload.imageFile);

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
