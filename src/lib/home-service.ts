import { supabase } from "@/lib/supabase";
import { fetchApprovedFishingSpots } from "@/lib/fishing-spots";
import {
  HOME_ACTIVE_MEMBERS_SELECT,
  HOME_APPROVED_CATCHES_SELECT,
} from "@/lib/home";
import { sanitizeCatchLocationForViewer } from "@/lib/ght-rules";
import type { Catch, FishingSpot, Member } from "@/types/home";

export async function fetchActiveMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select(HOME_ACTIVE_MEMBERS_SELECT)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchApprovedCatches(): Promise<Catch[]> {
  const { data, error } = await supabase
    .from("catches")
    .select(HOME_APPROVED_CATCHES_SELECT)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchHomePageData(options?: {
  includeFishingSpots?: boolean;
  viewer?: {
    isLoggedIn?: boolean;
    memberName?: string | null;
    isSuperAdmin?: boolean;
  };
}): Promise<{
  members: Member[];
  approvedCatches: Catch[];
  approvedFishingSpots: FishingSpot[];
}> {
  const includeFishingSpots = options?.includeFishingSpots ?? false;

  const [membersResult, approvedCatchesResult, approvedFishingSpotsResult] =
    await Promise.allSettled([
      fetchActiveMembers(),
      fetchApprovedCatches(),
      includeFishingSpots ? fetchApprovedFishingSpots() : Promise.resolve([]),
    ]);

  const members = membersResult.status === "fulfilled" ? membersResult.value : [];

  if (membersResult.status === "rejected") {
    console.warn("Could not load active members for home data", membersResult.reason);
  }
  if (approvedCatchesResult.status === "rejected") {
    throw approvedCatchesResult.reason;
  }
  if (approvedFishingSpotsResult.status === "rejected") {
    console.warn("Could not load approved fishing spots for home data", approvedFishingSpotsResult.reason);
  }

  const approvedCatches = approvedCatchesResult.value.map((catchItem) =>
    sanitizeCatchLocationForViewer(catchItem, {
      isLoggedIn: options?.viewer?.isLoggedIn,
      memberName: options?.viewer?.memberName,
      isSuperAdmin: options?.viewer?.isSuperAdmin,
    })
  );

  return {
    members,
    approvedCatches,
    approvedFishingSpots: approvedFishingSpotsResult.status === "fulfilled" ? approvedFishingSpotsResult.value : [],
  };
}
