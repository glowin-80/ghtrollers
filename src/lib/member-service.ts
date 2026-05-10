import { supabase } from "@/lib/supabase";
import { getCurrentAuthMemberState } from "@/lib/auth-member";
import { getApprovedPublicFishingSpotCount } from "@/lib/fishing-spot-achievements";
import { catchMatchesMemberIdentity, dedupeCatchesById, getMemberIdentityCount } from "@/lib/catch-identity";
import type { MemberCatch, MemberProfile } from "@/types/member-page";

export type AchievementMemberSummary = MemberProfile & {
  catchCount: number;
  uniqueWaterCount: number;
  fishingSpotCount: number;
};

const MEMBER_CATCHES_SELECT =
  "id, caught_for, caught_for_member_id, registered_by, registered_by_member_id, fish_type, fine_fish_type, weight_g, catch_date, location_name, water_name, water_key, image_url, latitude, longitude, fishing_method, live_scope, caught_abroad, is_location_private, status, created_at";

function normalizeWaterName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("sv-SE");
}


export function getUniqueWaterCount(catches: Pick<MemberCatch, "water_key" | "water_name">[]) {
  const uniqueWaters = new Set<string>();

  catches.forEach((catchItem) => {
    const waterKey = catchItem.water_key?.trim();

    if (waterKey) {
      uniqueWaters.add(`key:${waterKey}`);
      return;
    }

    const waterName = catchItem.water_name ? normalizeWaterName(catchItem.water_name) : "";

    if (waterName) {
      uniqueWaters.add(`name:${waterName}`);
    }
  });

  return uniqueWaters.size;
}

export async function fetchCurrentMemberProfile(): Promise<MemberProfile | null> {
  const authState = await getCurrentAuthMemberState();
  return authState.member;
}

export async function fetchMemberCatchesForMember(
  member: Pick<MemberProfile, "id" | "name">
): Promise<MemberCatch[]> {
  const memberId = member.id?.trim();
  const memberName = member.name?.trim();

  const results: MemberCatch[][] = [];

  if (memberId) {
    const { data, error } = await supabase
      .from("catches")
      .select(MEMBER_CATCHES_SELECT)
      .eq("caught_for_member_id", memberId)
      .order("catch_date", { ascending: false });

    if (error) {
      throw error;
    }

    results.push((data ?? []) as MemberCatch[]);
  }

  if (memberName) {
    const { data, error } = await supabase
      .from("catches")
      .select(MEMBER_CATCHES_SELECT)
      .eq("caught_for", memberName)
      .order("catch_date", { ascending: false });

    if (error) {
      throw error;
    }

    results.push((data ?? []) as MemberCatch[]);
  }

  if (!results.length) {
    return [];
  }

  return dedupeCatchesById(results.flat()).sort((a, b) => {
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
    .select("id, caught_for, caught_for_member_id, registered_by_member_id, registered_by, water_name, water_key");

  if (catchesError) {
    throw catchesError;
  }

  const { data: fishingSpots, error: fishingSpotsError } = await supabase
    .from("fishing_spots")
    .select("id, created_by_member_id, status, is_private")
    .eq("status", "approved")
    .or("is_private.is.false,is_private.is.null");

  if (fishingSpotsError) {
    throw fishingSpotsError;
  }

  return ((members ?? []) as MemberProfile[]).map((member) => {
    const memberCatches = dedupeCatchesById(
      ((catches ?? []) as MemberCatch[]).filter((catchItem) =>
        catchMatchesMemberIdentity(catchItem, member)
      )
    );

    const memberFishingSpots = (fishingSpots ?? []).filter(
      (spot) => spot.created_by_member_id === member.id
    );

    return {
      ...member,
      catchCount: getMemberIdentityCount(
        (catches ?? []) as Pick<
          MemberCatch,
          "id" | "caught_for" | "caught_for_member_id" | "registered_by" | "registered_by_member_id"
        >[],
        member
      ),
      uniqueWaterCount: getUniqueWaterCount(memberCatches),
      fishingSpotCount: getApprovedPublicFishingSpotCount(memberFishingSpots),
    };
  });
}