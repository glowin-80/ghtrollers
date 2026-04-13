import { supabase } from "@/lib/supabase";
import { getCurrentAuthMemberState } from "@/lib/auth-member";
import { dedupeCatchesById, getMemberIdentityCount } from "@/lib/catch-identity";
import type { MemberCatch, MemberProfile } from "@/types/member-page";

export type AchievementMemberSummary = MemberProfile & {
  catchCount: number;
};

const MEMBER_CATCHES_SELECT =
  "id, caught_for, caught_for_member_id, registered_by, registered_by_member_id, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, latitude, longitude, fishing_method, live_scope, caught_abroad, is_location_private, status, created_at";

export async function fetchCurrentMemberProfile(): Promise<MemberProfile | null> {
  const authState = await getCurrentAuthMemberState();
  return authState.member;
}

export async function fetchMemberCatchesForMember(
  member: Pick<MemberProfile, "id" | "name">
): Promise<MemberCatch[]> {
  const memberId = member.id?.trim();
  const memberName = member.name?.trim();

  const queries: Promise<{ data: MemberCatch[] | null; error: Error | null }>[] = [];

  if (memberId) {
    queries.push(
      supabase
        .from("catches")
        .select(MEMBER_CATCHES_SELECT)
        .eq("caught_for_member_id", memberId)
        .order("catch_date", { ascending: false })
    );
  }

  if (memberName) {
    queries.push(
      supabase
        .from("catches")
        .select(MEMBER_CATCHES_SELECT)
        .eq("caught_for", memberName)
        .order("catch_date", { ascending: false })
    );
  }

  if (!queries.length) {
    return [];
  }

  const results = await Promise.all(queries);
  const firstError = results.find((result) => result.error)?.error;

  if (firstError) {
    throw firstError;
  }

  return dedupeCatchesById(
    results.flatMap((result) => result.data ?? [])
  ).sort((a, b) => {
    const left = a.catch_date ? new Date(a.catch_date).getTime() : 0;
    const right = b.catch_date ? new Date(b.catch_date).getTime() : 0;
    return right - left;
  });
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
    .select("id, caught_for, caught_for_member_id");

  if (catchesError) {
    throw catchesError;
  }

  return (members ?? []).map((member: MemberProfile) => ({
    ...member,
    catchCount: getMemberIdentityCount(catches ?? [], member),
  }));
}
