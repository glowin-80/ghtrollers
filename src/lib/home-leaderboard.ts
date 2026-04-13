import { getBigFiveScore } from "@/lib/big-five";
import {
  getCatchOwnerDisplayName,
  getCatchOwnerIdentityKey,
} from "@/lib/catch-identity";
import { isCompetitionEligibleCatch } from "@/lib/ght-rules";
import type { Catch, LeaderboardEntry, LeaderboardFilter, Member } from "@/types/home";

function filterCatchesByLeaderboardType(catches: Catch[], filter: LeaderboardFilter): Catch[] {
  if (filter === "gädda") return catches.filter((catchItem) => catchItem.fish_type === "Gädda");
  if (filter === "abborre") return catches.filter((catchItem) => catchItem.fish_type === "Abborre");
  if (filter === "fina") return catches.filter((catchItem) => catchItem.fish_type === "Fina fisken");
  return catches;
}

export function buildLeaderboard(catches: Catch[], filter: LeaderboardFilter, members: Member[]): LeaderboardEntry[] {
  if (!catches.length) return [];

  const eligibleCatches = catches.filter((catchItem) => isCompetitionEligibleCatch(catchItem, members));

  if (!eligibleCatches.length) return [];

  if (filter === "bigfive") {
    const groupedCatches: Record<string, Catch[]> = {};
    eligibleCatches.forEach((catchItem) => {
      const key = getCatchOwnerIdentityKey(catchItem);
      if (!key) return;
      if (!groupedCatches[key]) groupedCatches[key] = [];
      groupedCatches[key].push(catchItem);
    });

    return Object.entries(groupedCatches)
      .map(([identityKey, memberCatches]) => {
        const topFiveCatches = [...memberCatches]
          .sort((a, b) => getBigFiveScore(b) - getBigFiveScore(a))
          .slice(0, 5);
        const total = topFiveCatches.reduce(
          (sum, catchItem) => sum + getBigFiveScore(catchItem),
          0
        );
        const displayName = getCatchOwnerDisplayName(memberCatches[0], members);
        return {
          identityKey,
          name: displayName || identityKey,
          total,
          detail: null,
          sourceCount: topFiveCatches.length,
          catchImageUrl: topFiveCatches[0]?.image_url || null,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  return [...filterCatchesByLeaderboardType(eligibleCatches, filter)]
    .sort((a, b) => b.weight_g - a.weight_g)
    .map((catchItem) => ({
      identityKey: getCatchOwnerIdentityKey(catchItem),
      name: getCatchOwnerDisplayName(catchItem, members),
      total: catchItem.weight_g,
      detail: filter === "fina" ? catchItem.fine_fish_type || null : null,
      sourceCount: 1,
      catchImageUrl: catchItem.image_url || null,
    }));
}
