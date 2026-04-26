import { supabase } from "@/lib/supabase";
import type { FishingSpot, FishingSpotReviewType } from "@/types/fishing-spots";

const FISHING_SPOT_SELECT =
  "id, created_at, updated_at, created_by_member_id, created_by_name, latitude, longitude, title, notes, is_private, status, pending_latitude, pending_longitude, pending_title, pending_notes, pending_is_private, has_pending_edit, approved_at, approved_by_member_id";

export async function fetchApprovedFishingSpots(viewer?: {
  memberId?: string | null;
  isSuperAdmin?: boolean;
}): Promise<FishingSpot[]> {
  let query = supabase
    .from("fishing_spots")
    .select(FISHING_SPOT_SELECT)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (!viewer?.isSuperAdmin) {
    if (viewer?.memberId) {
      query = query.or(
        `is_private.is.false,and(is_private.is.true,created_by_member_id.eq.${viewer.memberId})`
      );
    } else {
      query = query.or("is_private.is.false,is_private.is.null");
    }
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchOwnFishingSpots(
  memberId: string
): Promise<FishingSpot[]> {
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

async function createPrivateFishingSpotDirect(input: {
  latitude: number;
  longitude: number;
  title: string | null;
  notes: string | null;
}): Promise<FishingSpot> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Du behöver vara inloggad för att spara en privat fiskeplats.");
  }

  const response = await fetch("/api/fishing-spots/create-private", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      latitude: input.latitude,
      longitude: input.longitude,
      title: input.title,
      notes: input.notes,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { spot?: FishingSpot; error?: string }
    | null;

  if (!response.ok || !payload?.spot) {
    throw new Error(payload?.error || "Kunde inte spara privat fiskeplats.");
  }

  return payload.spot;
}

export async function createFishingSpot(input: {
  createdByMemberId: string;
  createdByName: string;
  latitude: number;
  longitude: number;
  title: string | null;
  notes: string | null;
  isPrivate: boolean;
}) {
  if (input.isPrivate) {
    return createPrivateFishingSpotDirect({
      latitude: input.latitude,
      longitude: input.longitude,
      title: input.title,
      notes: input.notes,
    });
  }

  const payload = {
    created_by_member_id: input.createdByMemberId,
    created_by_name: input.createdByName,
    latitude: input.latitude,
    longitude: input.longitude,
    title: input.title,
    notes: input.notes,
    is_private: false,
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

export async function createPendingFishingSpot(input: {
  createdByMemberId: string;
  createdByName: string;
  latitude: number;
  longitude: number;
  title: string | null;
  notes: string | null;
  isPrivate: boolean;
}) {
  return createFishingSpot({
    ...input,
    isPrivate: false,
  });
}

export async function updateOwnPrivateFishingSpot(input: {
  spotId: string;
  createdByMemberId: string;
  latitude: number;
  longitude: number;
  title: string | null;
  notes: string | null;
}) {
  const { data, error } = await supabase
    .from("fishing_spots")
    .update({
      latitude: input.latitude,
      longitude: input.longitude,
      title: input.title,
      notes: input.notes,
      is_private: true,
      status: "approved",
      pending_latitude: null,
      pending_longitude: null,
      pending_title: null,
      pending_notes: null,
      pending_is_private: null,
      has_pending_edit: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.spotId)
    .eq("created_by_member_id", input.createdByMemberId)
    .eq("status", "approved")
    .eq("is_private", true)
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
  isPrivate: boolean;
}) {
  const { data, error } = await supabase.rpc("submit_fishing_spot_edit", {
    p_spot_id: input.spotId,
    p_pending_latitude: input.latitude,
    p_pending_longitude: input.longitude,
    p_pending_title: input.title,
    p_pending_notes: input.notes,
    p_pending_is_private: input.isPrivate,
  });

  if (error) {
    throw error;
  }

  return data;
}

export type PendingFishingSpot = FishingSpot & {
  review_type: FishingSpotReviewType;
};

function shouldShowPendingFishingSpotForAdmin(spot: FishingSpot) {
  if (spot.status === "pending") {
    return spot.is_private !== true;
  }

  if (spot.has_pending_edit) {
    const currentIsPrivate = spot.is_private === true;
    const pendingIsPrivate = spot.pending_is_private === true;

    return !(currentIsPrivate && pendingIsPrivate);
  }

  return false;
}

export async function fetchPendingFishingSpots(viewer?: {
  isSuperAdmin?: boolean;
}): Promise<PendingFishingSpot[]> {
  const { data, error } = await supabase
    .from("fishing_spots")
    .select(FISHING_SPOT_SELECT)
    .or("status.eq.pending,has_pending_edit.eq.true")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const visibleSpots = viewer?.isSuperAdmin
    ? data || []
    : (data || []).filter(shouldShowPendingFishingSpotForAdmin);

  return visibleSpots.map((spot) => ({
    ...spot,
    review_type: spot.status === "pending" ? "new" : "edit",
  }));
}

export async function approvePendingFishingSpot(
  spotId: string,
  approverMemberId: string
) {
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