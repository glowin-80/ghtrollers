import { buildAllTimeBigFiveLeader } from "@/lib/home-bigfive";
import type { AllTimeHighlight, Catch } from "@/types/home";

export function buildAllTimeHighlights(catches: Catch[]): AllTimeHighlight[] {
  const bigFiveLeader = buildAllTimeBigFiveLeader(catches);
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
      winnerName: bigFiveLeader.winnerName,
      total: bigFiveLeader.total,
      sourceCount: bigFiveLeader.sourceCount,
      catchDate: bigFiveLeader.catchDate,
      catchImageUrl: bigFiveLeader.catchImageUrl,
      bestYear: bigFiveLeader.bestYear,
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
