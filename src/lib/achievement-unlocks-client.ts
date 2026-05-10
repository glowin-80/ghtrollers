import { supabase } from "@/lib/supabase";
import { fetchMemberAchievementUnlocks } from "@/lib/achievement-unlocks";

export async function fetchCurrentMemberAchievementUnlocks(memberId: string) {
  return fetchMemberAchievementUnlocks(supabase, memberId);
}
