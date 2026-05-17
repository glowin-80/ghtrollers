import type { SupabaseClient } from "@supabase/supabase-js";
import { achievementDefinitions, getUnlockedAchievementsByValue, type AchievementDefinition } from "@/lib/achievements";

export const ACHIEVEMENT_START_DATE = "2026-03-01";
export const ACHIEVEMENT_START_ISO = `${ACHIEVEMENT_START_DATE}T00:00:00.000Z`;

export type AchievementUnlockRow = {
  id?: string;
  member_id: string;
  category_id: string;
  achievement_id: string;
  unlocked_at: string;
  source: "backfill" | "live";
  source_table?: string | null;
  source_id?: string | null;
  created_at?: string;
};

export type AchievementUnlockMap = Record<string, string>;

function asSafeIso(value: string | null | undefined) {
  if (!value) return new Date().toISOString();
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return new Date().toISOString();
  return new Date(time).toISOString();
}

export function clampAchievementUnlockedAt(value: string | null | undefined) {
  const candidate = asSafeIso(value);
  return new Date(candidate).getTime() < new Date(ACHIEVEMENT_START_ISO).getTime()
    ? ACHIEVEMENT_START_ISO
    : candidate;
}

export function getAchievementUnlockKey(categoryId: string, achievementId: string) {
  return `${categoryId}:${achievementId}`;
}

export function createAchievementUnlockMap(rows: Pick<AchievementUnlockRow, "category_id" | "achievement_id" | "unlocked_at">[]) {
  return rows.reduce<AchievementUnlockMap>((acc, row) => {
    acc[getAchievementUnlockKey(row.category_id, row.achievement_id)] = row.unlocked_at;
    return acc;
  }, {});
}

export function getAchievementUnlockedAt(
  unlockMap: AchievementUnlockMap,
  achievement: Pick<AchievementDefinition, "categoryId" | "id">
) {
  return unlockMap[getAchievementUnlockKey(achievement.categoryId, achievement.id)] ?? null;
}

export async function fetchMemberAchievementUnlocks(
  supabase: SupabaseClient,
  memberId: string
): Promise<AchievementUnlockMap> {
  const { data, error } = await supabase
    .from("member_achievements")
    .select("category_id, achievement_id, unlocked_at")
    .eq("member_id", memberId);

  if (error) {
    throw error;
  }

  return createAchievementUnlockMap((data ?? []) as AchievementUnlockRow[]);
}

export async function recordAchievementUnlock(
  supabase: SupabaseClient,
  input: {
    memberId: string;
    achievement: AchievementDefinition;
    unlockedAt?: string | null;
    source: "backfill" | "live";
    sourceTable?: string | null;
    sourceId?: string | null;
  }
) {
  const payload = {
    member_id: input.memberId,
    category_id: input.achievement.categoryId,
    achievement_id: input.achievement.id,
    unlocked_at: clampAchievementUnlockedAt(input.unlockedAt),
    source: input.source,
    source_table: input.sourceTable ?? null,
    source_id: input.sourceId ?? null,
  };

  const { data, error } = await supabase
    .from("member_achievements")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return { inserted: false, duplicate: true };
    }

    throw error;
  }

  return { inserted: Boolean(data), duplicate: false };
}

export async function recordAchievementUnlocks(
  supabase: SupabaseClient,
  input: {
    memberId: string;
    achievements: AchievementDefinition[];
    unlockedAt?: string | null;
    source: "backfill" | "live";
    sourceTable?: string | null;
    sourceId?: string | null;
  }
) {
  const results = [];

  for (const achievement of input.achievements) {
    results.push(
      await recordAchievementUnlock(supabase, {
        memberId: input.memberId,
        achievement,
        unlockedAt: input.unlockedAt,
        source: input.source,
        sourceTable: input.sourceTable,
        sourceId: input.sourceId,
      })
    );
  }

  return results;
}

export function getUnlockedAchievementDefinitionsForBackfill(input: {
  categoryId: string;
  value: number;
}) {
  return getUnlockedAchievementsByValue(input.value, input.categoryId).filter((achievement) =>
    achievementDefinitions.some((definition) => definition.id === achievement.id)
  );
}
