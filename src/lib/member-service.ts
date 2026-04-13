import { supabase } from "@/lib/supabase";
import { getCurrentAuthMemberState } from "@/lib/auth-member";
import type { MemberCatch, MemberProfile } from "@/types/member-page";

export type AchievementMemberSummary = MemberProfile & {
  catchCount: number;
};

const MEMBER_CATCHES_SELECT =
  "id, caught_for, registered_by, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, latitude, longitude, fishing_method, live_scope, caught_abroad, is_location_private, status, created_at";

export async function fetchCurrentMemberProfile(): Promise<MemberProfile | null> {
  const authState = await getCurrentAuthMemberState();
  return authState.member;
}

export async function fetchMemberCatchesByName(
  memberName: string
): Promise<MemberCatch[]> {
  const { data, error } = await supabase
    .from("catches")
    .select(MEMBER_CATCHES_SELECT)
    .eq("caught_for", memberName)
    .order("catch_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function signOutMember() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function fetchActiveAchievementMembers(): Promise<AchievementMemberSummary[]> {
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select("id, name, email, is_admin, is_super_admin, is_active, member_role, profile_image_url")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (membersError) {
    throw membersError;
  }

  const { data: catches, error: catchesError } = await supabase
    .from("catches")
    .select("caught_for");

  if (catchesError) {
    throw catchesError;
  }

  const catchCountByMemberName = (catches ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = typeof row.caught_for === "string" ? row.caught_for.trim() : "";

    if (!key) {
      return acc;
    }

    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (members ?? []).map((member) => ({
    ...member,
    catchCount: catchCountByMemberName[member.name?.trim() ?? ""] ?? 0,
  }));
}
