import { sfvofSupabase } from "@sfvof/lib/supabase";
import type {
  SfvofAccessState,
  SfvofMeasurement,
  SfvofMember,
} from "@sfvof/types";

const SFVOF_MEMBER_SELECT =
  "id, user_id, name, email, is_admin, is_active, created_at, updated_at";

const SFVOF_MEASUREMENT_SELECT =
  "id, registered_by_user_id, registered_by_name, fish_length_cm, length_interval_id, length_interval_label, gps_lat, gps_lng, measured_at, image_url, comment, is_approved, created_at, updated_at";

export async function getSfvofAccessState(): Promise<SfvofAccessState> {
  const {
    data: { session },
    error: sessionError,
  } = await sfvofSupabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const user = session?.user;

  if (!user) {
    return {
      isLoggedIn: false,
      member: null,
      measurements: [],
    };
  }

  const { data: member, error: memberError } = await sfvofSupabase
    .schema("sfvof")
    .from("members")
    .select(SFVOF_MEMBER_SELECT)
    .eq("user_id", user.id)
    .maybeSingle<SfvofMember>();

  if (memberError) {
    throw memberError;
  }

  if (!member || !member.is_active) {
    return {
      isLoggedIn: true,
      member: member ?? null,
      measurements: [],
    };
  }

  const { data: measurements, error: measurementsError } = await sfvofSupabase
    .schema("sfvof")
    .from("measurements")
    .select(SFVOF_MEASUREMENT_SELECT)
    .order("measured_at", { ascending: false })
    .returns<SfvofMeasurement[]>();

  if (measurementsError) {
    throw measurementsError;
  }

  return {
    isLoggedIn: true,
    member,
    measurements: measurements ?? [],
  };
}
