import { supabase } from "@/lib/supabase";
import {
  HOME_ACTIVE_MEMBERS_SELECT,
  HOME_APPROVED_CATCHES_SELECT,
} from "@/lib/home";
import type { Catch, Member } from "@/types/home";

export async function fetchActiveMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select(HOME_ACTIVE_MEMBERS_SELECT)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchApprovedCatches(): Promise<Catch[]> {
  const { data, error } = await supabase
    .from("catches")
    .select(HOME_APPROVED_CATCHES_SELECT)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchHomePageData(): Promise<{
  members: Member[];
  approvedCatches: Catch[];
}> {
  const [membersResult, approvedCatchesResult] = await Promise.allSettled([
    fetchActiveMembers(),
    fetchApprovedCatches(),
  ]);

  const members =
    membersResult.status === "fulfilled" ? membersResult.value : [];

  if (membersResult.status === "rejected") {
    console.warn("Could not load active members for home data", membersResult.reason);
  }

  if (approvedCatchesResult.status === "rejected") {
    throw approvedCatchesResult.reason;
  }

  return {
    members,
    approvedCatches: approvedCatchesResult.value,
  };
}