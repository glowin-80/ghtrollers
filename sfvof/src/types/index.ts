export type SfvofMember = {
  id: number;
  user_id: string;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SfvofMeasurement = {
  id: number;
  registered_by_user_id: string;
  registered_by_name: string;
  fish_species: string | null;
  fish_length_cm: number;
  length_interval_id: number | null;
  length_interval_label: string | null;
  gps_lat: number;
  gps_lng: number;
  measured_at: string;
  image_url: string | null;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
};

export type SfvofPendingMember = {
  id: number;
  user_id: string;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SfvofMemberMeasurementStats = {
  totalCount: number;
  bySpecies: Array<{
    label: string;
    count: number;
  }>;
};

export type SfvofAccessState = {
  isLoggedIn: boolean;
  member: SfvofMember | null;
  measurements: SfvofMeasurement[];
  errorMessage?: string | null;
};

export type SfvofMemberPageData = {
  isLoggedIn: boolean;
  member: SfvofMember | null;
  measurements: SfvofMeasurement[];
  stats: SfvofMemberMeasurementStats;
  pendingMembers: SfvofPendingMember[];
  pendingMeasurements: SfvofMeasurement[];
  errorMessage: string | null;
};
