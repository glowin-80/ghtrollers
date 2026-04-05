import { supabase } from "@/lib/supabase";
import type { FishingSpot, FishingSpotReviewType } from "@/types/fishing-spots";

const FISHING_SPOT_SELECT =
  "id, created_at, updated_at, created_by_member_id, created_by_name, latitude, longitude, title, notes, status, pending_latitude, pending_longitude, pending_title, pending_notes, has_pending_edit, approved_at, approved_by_member_id";

export async function fetchApprovedFishingSpots(): Promise<FishingSpot[]> {
  const { data, error } = await supabase
    .from("fishing_spots")
    .select(FISHING_SPOT_SELECT)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchOwnFishingSpots(memberId: string): Promise<FishingSpot[]> {
  const { data, error } = await supabase
    .from("fishing_spots")
    .select(FISHING_SPOT_SELECT)
    .eq("created_by_member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function createPendingFishingSpot(input: {
  createdByMemberId: string;
  createdByName: string;
  latitude: number;
  longitude: number;
  title: string | null;
  notes: string | null;
}) {
  const payload = {
    created_by_member_id: input.createdByMemberId,
    created_by_name: input.createdByName,
    latitude: input.latitude,
    longitude: input.longitude,
    title: input.title,
    notes: input.notes,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("fishing_spots")
    .insert(payload)
    .select(FISHING_SPOT_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function submitFishingSpotEdit(input: {
  spotId: string;
  latitude: number;
  longitude: number;
  title: string | null;
  notes: string | null;
}) {
  const { data, error } = await supabase.rpc("submit_fishing_spot_edit", {
    p_spot_id: input.spotId,
    p_pending_latitude: input.latitude,
    p_pending_longitude: input.longitude,
    p_pending_title: input.title,
    p_pending_notes: input.notes,
  });

  if (error) {
    throw error;
  }

  return data;
}

export type PendingFishingSpot = FishingSpot & {
  review_type: FishingSpotReviewType;
};

export async function fetchPendingFishingSpots(): Promise<PendingFishingSpot[]> {
  const { data, error } = await supabase
    .from("fishing_spots")
    .select(FISHING_SPOT_SELECT)
    .or("status.eq.pending,has_pending_edit.eq.true")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map((spot) => ({
    ...spot,
    review_type: spot.status === "pending" ? "new" : "edit",
  }));
}

export async function approvePendingFishingSpot(spotId: string, approverMemberId: string) {
  const { error } = await supabase
    .from("fishing_spots")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by_member_id: approverMemberId,
    })
    .eq("id", spotId);

  if (error) {
    throw error;
  }
}

export async function approvePendingFishingSpotEdit(
  spotId: string,
  approverMemberId: string
) {
  const { data, error } = await supabase.rpc("approve_fishing_spot_edit", {
    p_spot_id: spotId,
    p_admin_member_id: approverMemberId,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePendingFishingSpot(spotId: string) {
  const { error } = await supabase.from("fishing_spots").delete().eq("id", spotId);

  if (error) {
    throw error;
  }
}

export async function rejectPendingFishingSpotEdit(spotId: string) {
  const { data, error } = await supabase.rpc("reject_fishing_spot_edit", {
    p_spot_id: spotId,
  });

  if (error) {
    throw error;
  }

  return data;
}
