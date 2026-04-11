import type { FishingSpot } from "@/types/fishing-spots";

export type Member = {
  id: string;
  name: string;
  category: "junior" | "senior" | string;
  email?: string | null;
  is_admin?: boolean;
  is_super_admin?: boolean;
  is_active?: boolean;
  member_role?: "competition_member" | "guest_angler" | string;
  created_at?: string;
  profile_image_url?: string | null;
};

export type Catch = {
  id: string;
  caught_for: string;
  registered_by: string;
  fish_type: string;
  fine_fish_type?: string | null;
  weight_g: number;
  catch_date: string;
  location_name?: string | null;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  fishing_method?: string | null;
  caught_abroad?: boolean | null;
  is_location_private?: boolean | null;
  original_image_size_bytes?: number | null;
  compressed_image_size_bytes?: number | null;
  status: "pending" | "approved" | "rejected" | string;
  created_at?: string;
};

export type { FishingSpot };

export type LeaderboardFilter = "bigfive" | "abborre" | "gädda" | "fina";

export type LeaderboardEntry = {
  name: string;
  total: number;
  detail?: string | null;
  sourceCount?: number;
  catchImageUrl?: string | null;
};

export type BigFiveBreakdownItem = {
  catchId: string;
  fishLabel: string;
  originalWeight: number;
  adjustedWeight: number;
  catchDate: string | null;
  usesMultiplier: boolean;
};

export type BigFiveBreakdown = {
  name: string;
  total: number;
  items: BigFiveBreakdownItem[];
};

export type AllTimeHighlight = {
  filter: LeaderboardFilter;
  title: string;
  winnerName: string;
  total: number;
  detail?: string | null;
  catchDate?: string | null;
  locationName?: string | null;
  sourceCount?: number;
  catchImageUrl?: string | null;
  bestYear?: string | null;
};

export type UploadImageResult = {
  imageUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
};
