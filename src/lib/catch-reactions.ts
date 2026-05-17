import { supabase } from "@/lib/supabase";

export const CATCH_REACTION_EMOJIS = ["🔥", "😂", "🎣", "👍", "👎"] as const;

export type CatchReactionEmoji = (typeof CATCH_REACTION_EMOJIS)[number];

export type CatchReactionSummary = {
  emoji: CatchReactionEmoji;
  count: number;
  reactedByMe: boolean;
};

export type CatchReactionState = Record<string, CatchReactionSummary[]>;

type CatchReactionRow = {
  catch_id: string;
  member_id: string;
  emoji: string;
};

export function isAllowedCatchReactionEmoji(value: string): value is CatchReactionEmoji {
  return CATCH_REACTION_EMOJIS.includes(value as CatchReactionEmoji);
}

function createEmptyReactionSummary(): CatchReactionSummary[] {
  return CATCH_REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: 0,
    reactedByMe: false,
  }));
}

export function createEmptyCatchReactionState(catchIds: string[]): CatchReactionState {
  return catchIds.reduce<CatchReactionState>((acc, catchId) => {
    acc[catchId] = createEmptyReactionSummary();
    return acc;
  }, {});
}

export function buildCatchReactionState(params: {
  catchIds: string[];
  rows: CatchReactionRow[];
  currentMemberId: string | null;
}): CatchReactionState {
  const state = createEmptyCatchReactionState(params.catchIds);
  const catchIdSet = new Set(params.catchIds);

  for (const row of params.rows) {
    if (!catchIdSet.has(row.catch_id) || !isAllowedCatchReactionEmoji(row.emoji)) {
      continue;
    }

    const summary = state[row.catch_id]?.find((item) => item.emoji === row.emoji);

    if (!summary) {
      continue;
    }

    summary.count += 1;

    if (params.currentMemberId && row.member_id === params.currentMemberId) {
      summary.reactedByMe = true;
    }
  }

  return state;
}

export async function fetchCatchReactions(params: {
  catchIds: string[];
  currentMemberId: string | null;
}): Promise<CatchReactionState> {
  const uniqueCatchIds = [...new Set(params.catchIds.filter(Boolean))];

  if (uniqueCatchIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("catch_reactions")
    .select("catch_id, member_id, emoji")
    .in("catch_id", uniqueCatchIds);

  if (error) {
    throw error;
  }

  return buildCatchReactionState({
    catchIds: uniqueCatchIds,
    rows: (data ?? []) as CatchReactionRow[],
    currentMemberId: params.currentMemberId,
  });
}

export async function addCatchReaction(params: {
  catchId: string;
  memberId: string;
  emoji: CatchReactionEmoji;
}) {
  const { error } = await supabase.from("catch_reactions").insert({
    catch_id: params.catchId,
    member_id: params.memberId,
    emoji: params.emoji,
  });

  if (error) {
    throw error;
  }
}

export async function removeCatchReaction(params: {
  catchId: string;
  memberId: string;
  emoji: CatchReactionEmoji;
}) {
  const { error } = await supabase
    .from("catch_reactions")
    .delete()
    .eq("catch_id", params.catchId)
    .eq("member_id", params.memberId)
    .eq("emoji", params.emoji);

  if (error) {
    throw error;
  }
}
