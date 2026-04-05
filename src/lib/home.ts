import type {
  AllTimeHighlight,
  BigFiveBreakdown,
  Catch,
  LeaderboardEntry,
  LeaderboardFilter,
} from "@/types/home";

export const HOME_ACTIVE_MEMBERS_SELECT =
  "id, name, category, profile_image_url";

export const HOME_APPROVED_CATCHES_SELECT =
  "id, caught_for, registered_by, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, latitude, longitude, status, created_at";

function getBigFiveScore(catchItem: Catch) {
  return catchItem.fish_type === "Abborre"
    ? catchItem.weight_g * 4
    : catchItem.weight_g;
}

function getFishLabel(catchItem: Catch) {
  if (catchItem.fish_type === "Fina fisken" && catchItem.fine_fish_type) {
    return catchItem.fine_fish_type;
  }

  return catchItem.fish_type;
}

export function buildBigFiveBreakdowns(
  catches: Catch[]
): Record<string, BigFiveBreakdown> {
  if (!catches.length) {
    return {};
  }

  const groupedCatches: Record<string, Catch[]> = {};

  catches.forEach((catchItem) => {
    if (!groupedCatches[catchItem.caught_for]) {
      groupedCatches[catchItem.caught_for] = [];
    }

    groupedCatches[catchItem.caught_for].push(catchItem);
  });

  return Object.fromEntries(
    Object.entries(groupedCatches).map(([name, memberCatches]) => {
      const topFiveCatches = [...memberCatches]
        .sort((a, b) => getBigFiveScore(b) - getBigFiveScore(a))
        .slice(0, 5);

      const items = topFiveCatches.map((catchItem) => ({
        catchId: catchItem.id,
        fishLabel: getFishLabel(catchItem),
        originalWeight: catchItem.weight_g,
        adjustedWeight: getBigFiveScore(catchItem),
        catchDate: catchItem.catch_date || null,
        usesMultiplier: catchItem.fish_type === "Abborre",
      }));

      const total = items.reduce((sum, item) => sum + item.adjustedWeight, 0);

      return [
        name,
        {
          name,
          total,
          items,
        },
      ];
    })
  );
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

  let filteredCatches = catches;

  if (filter === "gädda") {
    filteredCatches = catches.filter(
      (catchItem) => catchItem.fish_type === "Gädda"
    );
  }

  if (filter === "abborre") {
    filteredCatches = catches.filter(
      (catchItem) => catchItem.fish_type === "Abborre"
    );
  }

  if (filter === "fina") {
    filteredCatches = catches.filter(
      (catchItem) => catchItem.fish_type === "Fina fisken"
    );
  }

  return [...filteredCatches]
    .sort((a, b) => b.weight_g - a.weight_g)
    .map((catchItem) => ({
      name: catchItem.caught_for,
      total: catchItem.weight_g,
      detail: filter === "fina" ? catchItem.fine_fish_type || null : null,
      sourceCount: 1,
      catchImageUrl: catchItem.image_url || null,
    }));
}

function getBigFiveLeader(catches: Catch[]) {
  const groupedCatches: Record<string, Catch[]> = {};

  catches.forEach((catchItem) => {
    if (!groupedCatches[catchItem.caught_for]) {
      groupedCatches[catchItem.caught_for] = [];
    }

    groupedCatches[catchItem.caught_for].push(catchItem);
  });

  const candidates = Object.entries(groupedCatches)
    .map(([name, memberCatches]) => {
      const topFiveCatches = [...memberCatches]
        .sort((a, b) => getBigFiveScore(b) - getBigFiveScore(a))
        .slice(0, 5);

      const total = topFiveCatches.reduce(
        (sum, catchItem) => sum + getBigFiveScore(catchItem),
        0
      );

      const latestTopFiveDate =
        [...topFiveCatches]
          .map((catchItem) => catchItem.catch_date)
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(b as string).getTime() - new Date(a as string).getTime()
          )[0] || null;

      return {
        name,
        total,
        sourceCount: topFiveCatches.length,
        catchDate: latestTopFiveDate,
        catchImageUrl: topFiveCatches[0]?.image_url || null,
      };
    })
    .sort((a, b) => b.total - a.total);

  return candidates[0] || null;
}

export function buildAllTimeHighlights(catches: Catch[]): AllTimeHighlight[] {
  const bigFiveLeader = getBigFiveLeader(catches);
  const largestPerch = [...catches]
    .filter((catchItem) => catchItem.fish_type === "Abborre")
    .sort((a, b) => b.weight_g - a.weight_g)[0];
  const largestPike = [...catches]
    .filter((catchItem) => catchItem.fish_type === "Gädda")
    .sort((a, b) => b.weight_g - a.weight_g)[0];
  const largestFineFish = [...catches]
    .filter((catchItem) => catchItem.fish_type === "Fina fisken")
    .sort((a, b) => b.weight_g - a.weight_g)[0];

  const highlights: AllTimeHighlight[] = [];

  if (bigFiveLeader) {
    highlights.push({
      filter: "bigfive",
      title: "Big Five",
      winnerName: bigFiveLeader.name,
      total: bigFiveLeader.total,
      sourceCount: bigFiveLeader.sourceCount,
      catchDate: bigFiveLeader.catchDate,
      catchImageUrl: bigFiveLeader.catchImageUrl,
    });
  }

  if (largestPerch) {
    highlights.push({
      filter: "abborre",
      title: "Abborre",
      winnerName: largestPerch.caught_for,
      total: largestPerch.weight_g,
      catchDate: largestPerch.catch_date,
      locationName: largestPerch.location_name || null,
      catchImageUrl: largestPerch.image_url || null,
    });
  }

  if (largestPike) {
    highlights.push({
      filter: "gädda",
      title: "Gädda",
      winnerName: largestPike.caught_for,
      total: largestPike.weight_g,
      catchDate: largestPike.catch_date,
      locationName: largestPike.location_name || null,
      catchImageUrl: largestPike.image_url || null,
    });
  }

  if (largestFineFish) {
    highlights.push({
      filter: "fina",
      title: "Fina fisken",
      winnerName: largestFineFish.caught_for,
      total: largestFineFish.weight_g,
      detail: largestFineFish.fine_fish_type || null,
      catchDate: largestFineFish.catch_date,
      locationName: largestFineFish.location_name || null,
      catchImageUrl: largestFineFish.image_url || null,
    });
  }

  return highlights;
}