import { supabase } from "@/lib/supabase";
import { getCurrentAuthMemberState } from "@/lib/auth-member";
import type { MemberCatch, MemberProfile } from "@/types/member-page";

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