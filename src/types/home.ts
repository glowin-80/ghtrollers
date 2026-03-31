export type Member = {
  id: string;
  name: string;
  category: "junior" | "senior" | string;
  email?: string | null;
  is_admin?: boolean;
  is_active?: boolean;
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
  original_image_size_bytes?: number | null;
  compressed_image_size_bytes?: number | null;
  status: "pending" | "approved" | "rejected" | string;
  created_at?: string;
};

export type LeaderboardFilter = "bigfive" | "abborre" | "gädda" | "fina";

export type LeaderboardEntry = {
  name: string;
  total: number;
  detail?: string | null;
};

export type UploadImageResult = {
  imageUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
};
