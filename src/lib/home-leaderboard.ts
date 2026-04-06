import { getBigFiveScore } from "@/lib/big-five";
import type { Catch, LeaderboardEntry, LeaderboardFilter } from "@/types/home";

function filterCatchesByLeaderboardType(
  catches: Catch[],
  filter: LeaderboardFilter
): Catch[] {
  if (filter === "gädda") {
    return catches.filter((catchItem) => catchItem.fish_type === "Gädda");
  }

  if (filter === "abborre") {
    return catches.filter((catchItem) => catchItem.fish_type === "Abborre");
  }

  if (filter === "fina") {
    return catches.filter((catchItem) => catchItem.fish_type === "Fina fisken");
  }

  return catches;
}

export function buildLeaderboard(
  catches: Catch[],
  filter: LeaderboardFilter
): LeaderboardEntry[] {
  if (!catches.length) {
    return [];
  }

  if (filter === "bigfive") {
    const groupedCatches: Record<string, Catch[]> = {};

    catches.forEach((catchItem) => {
      if (!groupedCatches[catchItem.caught_for]) {
        groupedCatches[catchItem.caught_for] = [];
      }

      groupedCatches[catchItem.caught_for].push(catchItem);
    });

    return Object.entries(groupedCatches)
      .map(([name, memberCatches]) => {
        const topFiveCatches = [...memberCatches]
          .sort((a, b) => getBigFiveScore(b) - getBigFiveScore(a))
          .slice(0, 5);

        const total = topFiveCatches.reduce(
          (sum, catchItem) => sum + getBigFiveScore(catchItem),
          0
        );

        return {
          name,
          total,
          detail: null,
          sourceCount: topFiveCatches.length,
          catchImageUrl: topFiveCatches[0]?.image_url || null,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  return [...filterCatchesByLeaderboardType(catches, filter)]
    .sort((a, b) => b.weight_g - a.weight_g)
    .map((catchItem) => ({
      name: catchItem.caught_for,
      total: catchItem.weight_g,
      detail: filter === "fina" ? catchItem.fine_fish_type || null : null,
      sourceCount: 1,
      catchImageUrl: catchItem.image_url || null,
    }));
}
