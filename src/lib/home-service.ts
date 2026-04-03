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
  const [members, approvedCatches] = await Promise.all([
    fetchActiveMembers(),
    fetchApprovedCatches(),
  ]);

  return {
    members,
    approvedCatches,
  };
}
