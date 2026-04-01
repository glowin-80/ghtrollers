import type { Catch, LeaderboardEntry, LeaderboardFilter } from "@/types/home";

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
    }));
}