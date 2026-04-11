import { sfvofSupabase } from "@sfvof/lib/supabase";
import type { SfvofAccessState, SfvofMeasurement, SfvofMember } from "@sfvof/types";

const SFVOF_MEMBER_SELECT =
  "id, user_id, name, email, is_admin, is_active, profile_image_url, created_at, updated_at";

const SFVOF_MEASUREMENT_SELECT =
  "id, registered_by_user_id, registered_by_name, fish_species, fish_length_cm, length_interval_id, length_interval_label, gps_lat, gps_lng, measured_at, image_url, comment, is_approved, created_at, updated_at";

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = "message" in error && typeof error.message === "string" ? error.message : null;
    const details = "details" in error && typeof error.details === "string" ? error.details : null;
    return [message, details].filter(Boolean).join(" | ") || "Okänt SFVOF-fel.";
  }
  return "Okänt SFVOF-fel.";
}

export async function getSfvofAccessState(): Promise<SfvofAccessState> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await sfvofSupabase.auth.getSession();

    if (sessionError) {
      return { isLoggedIn: false, member: null, measurements: [], errorMessage: getErrorMessage(sessionError) };
    }

    const user = session?.user;
    if (!user) {
      return { isLoggedIn: false, member: null, measurements: [], errorMessage: null };
    }

    const { data: member, error: memberError } = await sfvofSupabase
      .schema("sfvof")
      .from("members")
      .select(SFVOF_MEMBER_SELECT)
      .eq("user_id", user.id)
      .maybeSingle<SfvofMember>();

    if (memberError) {
      return { isLoggedIn: true, member: null, measurements: [], errorMessage: `Kunde inte läsa sfvof.members: ${getErrorMessage(memberError)}` };
    }

    if (!member || !member.is_active) {
      return { isLoggedIn: true, member: member ?? null, measurements: [], errorMessage: null };
    }

    const { data: measurements, error: measurementsError } = await sfvofSupabase
      .schema("sfvof")
      .from("measurements")
      .select(SFVOF_MEASUREMENT_SELECT)
      .eq("registered_by_user_id", user.id)
      .order("measured_at", { ascending: false })
      .returns<SfvofMeasurement[]>();

    if (measurementsError) {
      return {
        isLoggedIn: true,
        member,
        measurements: [],
        errorMessage: `Kunde inte läsa sfvof.measurements: ${getErrorMessage(measurementsError)}`,
      };
    }

    return { isLoggedIn: true, member, measurements: measurements ?? [], errorMessage: null };
  } catch (error) {
    return { isLoggedIn: false, member: null, measurements: [], errorMessage: getErrorMessage(error) };
  }
}
