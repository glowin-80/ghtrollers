export type FishingSpotStatus = "pending" | "approved" | string;

export type FishingSpot = {
  id: string;
  created_at: string;
  updated_at?: string | null;
  created_by_member_id: string;
  created_by_name: string;
  latitude: number;
  longitude: number;
  title: string | null;
  notes: string | null;
  is_private?: boolean | null;
  status: FishingSpotStatus;
  pending_latitude?: number | null;
  pending_longitude?: number | null;
  pending_title?: string | null;
  pending_notes?: string | null;
  pending_is_private?: boolean | null;
  has_pending_edit?: boolean;
  approved_at?: string | null;
  approved_by_member_id?: string | null;
};

export type FishingSpotMapFilter = "all" | "catches" | "spots";

export type FishingSpotReviewType = "new" | "edit";
