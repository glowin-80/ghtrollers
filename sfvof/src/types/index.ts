export type SfvofMember = {
  id: number;
  user_id: string;
  name: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SfvofMeasurement = {
  id: number;
  registered_by_user_id: string;
  registered_by_name: string;
  fish_length_cm: number;
  length_interval_id: number;
  length_interval_label: string;
  gps_lat: number;
  gps_lng: number;
  measured_at: string;
  image_url: string | null;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
};

export type SfvofAccessState = {
  isLoggedIn: boolean;
  member: SfvofMember | null;
  measurements: SfvofMeasurement[];
};
