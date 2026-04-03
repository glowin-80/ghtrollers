export type MemberProfile = {
  id: string;
  name: string;
  email?: string | null;
  is_admin?: boolean | null;
  is_active?: boolean | null;
  profile_image_url?: string | null;
};

export type FineFishSpeciesStat = {
  species: string;
  count: number;
  totalWeight: string;
};

export type BestFineFishBySpecies = {
  species: string;
  weight: string;
  weightG: number;
};

export type MemberCatch = {
  id: string;
  caught_for: string;
  registered_by: string;
  fish_type: string;
  fine_fish_type?: string | null;
  weight_g: number;
  catch_date: string;
  location_name?: string | null;
  image_url?: string | null;
  status: "pending" | "approved" | "rejected" | string;
  created_at?: string | null;
};

export type MemberStats = {
  totalCatches: number;
  approvedCatches: number;
  pendingCatches: number;

  biggestPike: string;
  biggestPerch: string;
  bestFineFish: string;
  bestBigFive: string;

  totalPerchCount: number;
  totalPikeCount: number;
  totalFineFishCount: number;

  totalPerchWeight: string;
  totalPikeWeight: string;
  totalFineFishWeight: string;

  fineFishSpeciesStats: FineFishSpeciesStat[];
  bestFineFishBySpecies: BestFineFishBySpecies[];
};