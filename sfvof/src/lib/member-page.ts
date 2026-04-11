import { sfvofSupabase } from "@sfvof/lib/supabase";
import type {
  SfvofMember,
  SfvofMeasurement,
  SfvofMemberMeasurementStats,
  SfvofMemberPageData,
  SfvofPendingMember,
} from "@sfvof/types";

const MEMBER_SELECT =
  "id, user_id, name, email, is_admin, is_active, profile_image_url, created_at, updated_at";

const MEASUREMENT_SELECT =
  "id, registered_by_user_id, registered_by_name, fish_species, fish_length_cm, length_interval_id, length_interval_label, gps_lat, gps_lng, measured_at, image_url, comment, is_approved, created_at, updated_at";

const PLACEHOLDER_SPECIES = ["Gös", "Gädda", "Abborre"];

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const message = "message" in error && typeof error.message === "string" ? error.message : null;
    const details = "details" in error && typeof error.details === "string" ? error.details : null;
    const hint = "hint" in error && typeof error.hint === "string" ? error.hint : null;
    return [message, details, hint].filter(Boolean).join(" | ") || "Okänt SFVOF-fel.";
  }
  return "Okänt SFVOF-fel.";
}

function buildStats(measurements: SfvofMeasurement[]): SfvofMemberMeasurementStats {
  const counts = new Map<string, number>();

  for (const label of PLACEHOLDER_SPECIES) {
    counts.set(label, 0);
  }

  for (const item of measurements) {
    const rawLabel = item.fish_species?.trim() || item.length_interval_label?.trim() || "Okänd art";
    counts.set(rawLabel, (counts.get(rawLabel) ?? 0) + 1);
  }

  return {
    totalCount: measurements.length,
    bySpecies: Array.from(counts.entries()).map(([label, count]) => ({ label, count })),
  };
}

export async function getSfvofMemberPageData(): Promise<SfvofMemberPageData> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await sfvofSupabase.auth.getSession();

    if (sessionError) {
      return {
        isLoggedIn: false,
        member: null,
        measurements: [],
        stats: buildStats([]),
        pendingMembers: [],
        pendingMeasurements: [],
        errorMessage: `Kunde inte läsa auth-session: ${getErrorMessage(sessionError)}`,
      };
    }

    const user = session?.user;
    if (!user) {
      return {
        isLoggedIn: false,
        member: null,
        measurements: [],
        stats: buildStats([]),
        pendingMembers: [],
        pendingMeasurements: [],
        errorMessage: null,
      };
    }

    const { data: member, error: memberError } = await sfvofSupabase
      .schema("sfvof")
      .from("members")
      .select(MEMBER_SELECT)
      .eq("user_id", user.id)
      .maybeSingle<SfvofMember>();

    if (memberError) {
      return {
        isLoggedIn: true,
        member: null,
        measurements: [],
        stats: buildStats([]),
        pendingMembers: [],
        pendingMeasurements: [],
        errorMessage: `Kunde inte läsa sfvof.members: ${getErrorMessage(memberError)}`,
      };
    }

    if (!member) {
      return {
        isLoggedIn: true,
        member: null,
        measurements: [],
        stats: buildStats([]),
        pendingMembers: [],
        pendingMeasurements: [],
        errorMessage: "Du är inloggad men saknar medlemsrad i sfvof.members.",
      };
    }

    const { data: measurements, error: measurementsError } = await sfvofSupabase
      .schema("sfvof")
      .from("measurements")
      .select(MEASUREMENT_SELECT)
      .eq("registered_by_user_id", user.id)
      .order("measured_at", { ascending: false })
      .returns<SfvofMeasurement[]>();

    if (measurementsError) {
      return {
        isLoggedIn: true,
        member,
        measurements: [],
        stats: buildStats([]),
        pendingMembers: [],
        pendingMeasurements: [],
        errorMessage: `Kunde inte läsa sfvof.measurements: ${getErrorMessage(measurementsError)}`,
      };
    }

    let pendingMembers: SfvofPendingMember[] = [];
    let pendingMeasurements: SfvofMeasurement[] = [];

    if (member.is_admin) {
      const [pendingMembersResult, pendingMeasurementsResult] = await Promise.all([
        sfvofSupabase
          .schema("sfvof")
          .from("members")
          .select(MEMBER_SELECT)
          .eq("is_active", false)
          .order("created_at", { ascending: true })
          .returns<SfvofPendingMember[]>(),
        sfvofSupabase
          .schema("sfvof")
          .from("measurements")
          .select(MEASUREMENT_SELECT)
          .eq("is_approved", false)
          .order("measured_at", { ascending: false })
          .returns<SfvofMeasurement[]>(),
      ]);

      if (pendingMembersResult.error) {
        return {
          isLoggedIn: true,
          member,
          measurements: measurements ?? [],
          stats: buildStats(measurements ?? []),
          pendingMembers: [],
          pendingMeasurements: [],
          errorMessage: `Kunde inte läsa väntande SFVOF-medlemmar: ${getErrorMessage(pendingMembersResult.error)}`,
        };
      }

      if (pendingMeasurementsResult.error) {
        return {
          isLoggedIn: true,
          member,
          measurements: measurements ?? [],
          stats: buildStats(measurements ?? []),
          pendingMembers: pendingMembersResult.data ?? [],
          pendingMeasurements: [],
          errorMessage: `Kunde inte läsa väntande SFVOF-mätningar: ${getErrorMessage(pendingMeasurementsResult.error)}`,
        };
      }

      pendingMembers = pendingMembersResult.data ?? [];
      pendingMeasurements = pendingMeasurementsResult.data ?? [];
    }

    return {
      isLoggedIn: true,
      member,
      measurements: measurements ?? [],
      stats: buildStats(measurements ?? []),
      pendingMembers,
      pendingMeasurements,
      errorMessage: null,
    };
  } catch (error) {
    return {
      isLoggedIn: false,
      member: null,
      measurements: [],
      stats: buildStats([]),
      pendingMembers: [],
      pendingMeasurements: [],
      errorMessage: `Oväntat SFVOF-fel: ${getErrorMessage(error)}`,
    };
  }
}

export async function uploadSfvofProfileImage(userId: string, file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${userId}/profile-${Date.now()}.${extension}`;

  const { error: uploadError } = await sfvofSupabase.storage
    .from("sfvof-profile-images")
    .upload(filePath, file, { upsert: true, cacheControl: "3600" });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = sfvofSupabase.storage.from("sfvof-profile-images").getPublicUrl(filePath);

  const { error: updateError } = await sfvofSupabase
    .schema("sfvof")
    .from("members")
    .update({ profile_image_url: data.publicUrl })
    .eq("user_id", userId);

  if (updateError) {
    throw updateError;
  }

  return data.publicUrl;
}

export async function approveSfvofMember(userId: string) {
  const { error } = await sfvofSupabase
    .schema("sfvof")
    .from("members")
    .update({ is_active: true })
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function rejectSfvofMember(userId: string) {
  const { error } = await sfvofSupabase
    .schema("sfvof")
    .from("members")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function approveSfvofMeasurement(id: number) {
  const { error } = await sfvofSupabase
    .schema("sfvof")
    .from("measurements")
    .update({ is_approved: true })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function rejectSfvofMeasurement(id: number) {
  const { error } = await sfvofSupabase
    .schema("sfvof")
    .from("measurements")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
