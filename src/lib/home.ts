import type {
  AllTimeHighlight,
  Catch,
  LeaderboardEntry,
  LeaderboardFilter,
} from "@/types/home";

export const HOME_ACTIVE_MEMBERS_SELECT =
  "id, name, category, profile_image_url";

export const HOME_APPROVED_CATCHES_SELECT =
  "id, caught_for, registered_by, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, latitude, longitude, status, created_at";

export function buildLeaderboard(
  catches: Catch[],
  filter: LeaderboardFilter
): LeaderboardEntry[] {
  if (!catches.length) {
    return [];
  }

  if (filter === "bigfive") {
    const groupedScores: Record<string, number[]> = {};

    catches.forEach((catchItem) => {
      const score =
        catchItem.fish_type === "Abborre"
          ? catchItem.weight_g * 4
          : catchItem.weight_g;

      if (!groupedScores[catchItem.caught_for]) {
        groupedScores[catchItem.caught_for] = [];
      }

      groupedScores[catchItem.caught_for].push(score);
    });

    return Object.entries(groupedScores)
      .map(([name, scores]) => {
        const topFiveScores = [...scores].sort((a, b) => b - a).slice(0, 5);
        const total = topFiveScores.reduce((sum, value) => sum + value, 0);

        return {
          name,
          total,
          detail: null,
          sourceCount: topFiveScores.length,
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
    }));
}

export function buildAllTimeHighlights(catches: Catch[]): AllTimeHighlight[] {
  const bigFiveLeader = buildLeaderboard(catches, "bigfive")[0];
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
    });
  }

  return highlights;
}