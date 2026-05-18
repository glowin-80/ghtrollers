import { supabase } from "@/lib/supabase";

export const CATCH_REACTIONS_ENABLED = false;

export const CATCH_REACTION_EMOJIS = ["🔥", "😂", "🎣", "👍", "👎"] as const;

export type CatchReactionEmoji = (typeof CATCH_REACTION_EMOJIS)[number];

export type CatchReactionSummary = {
  emoji: CatchReactionEmoji;
  count: number;
  reactedByMe: boolean;
  memberNames: string[];
};

export type CatchReactionState = Record<string, CatchReactionSummary[]>;

type CatchReactionRow = {
  catch_id: string;
  member_id: string;
  emoji: string;
};

type ReactionMemberRow = {
  id: string;
  name: string | null;
};

export function isAllowedCatchReactionEmoji(value: string): value is CatchReactionEmoji {
  return CATCH_REACTION_EMOJIS.includes(value as CatchReactionEmoji);
}

function createEmptyReactionSummary(): CatchReactionSummary[] {
  return CATCH_REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: 0,
    reactedByMe: false,
    memberNames: [],
  }));
}

export function createEmptyCatchReactionState(catchIds: string[]): CatchReactionState {
  return catchIds.reduce<CatchReactionState>((acc, catchId) => {
    acc[catchId] = createEmptyReactionSummary();
    return acc;
  }, {});
}

function getMemberDisplayName(memberId: string, memberNameById: Map<string, string>) {
  return memberNameById.get(memberId) ?? "Okänd medlem";
}

export function buildCatchReactionState(params: {
  catchIds: string[];
  rows: CatchReactionRow[];
  currentMemberId: string | null;
  memberNameById?: Map<string, string>;
}): CatchReactionState {
  const state = createEmptyCatchReactionState(params.catchIds);
  const catchIdSet = new Set(params.catchIds);
  const memberNameById = params.memberNameById ?? new Map<string, string>();

  for (const row of params.rows) {
    if (!catchIdSet.has(row.catch_id) || !isAllowedCatchReactionEmoji(row.emoji)) {
      continue;
    }

    const summary = state[row.catch_id]?.find((item) => item.emoji === row.emoji);

    if (!summary) {
      continue;
    }

    summary.count += 1;
    summary.memberNames.push(getMemberDisplayName(row.member_id, memberNameById));

    if (params.currentMemberId && row.member_id === params.currentMemberId) {
      summary.reactedByMe = true;
    }
  }

  for (const catchSummaries of Object.values(state)) {
    for (const summary of catchSummaries) {
      summary.memberNames = [...new Set(summary.memberNames)].sort((a, b) => a.localeCompare(b, "sv"));
    }
  }

  return state;
}

async function fetchReactionMemberNames(memberIds: string[]) {
  const uniqueMemberIds = [...new Set(memberIds.filter(Boolean))];

  if (uniqueMemberIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("members")
    .select("id, name")
    .in("id", uniqueMemberIds);

  if (error) {
    throw error;
  }

  return ((data ?? []) as ReactionMemberRow[]).reduce<Map<string, string>>((acc, member) => {
    acc.set(member.id, member.name?.trim() || "Okänd medlem");
    return acc;
  }, new Map<string, string>());
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

  const rows = (data ?? []) as CatchReactionRow[];
  const memberNameById = await fetchReactionMemberNames(rows.map((row) => row.member_id));

  return buildCatchReactionState({
    catchIds: uniqueCatchIds,
    rows,
    currentMemberId: params.currentMemberId,
    memberNameById,
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
