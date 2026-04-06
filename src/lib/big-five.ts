import { getCatchYear, getFishLabel } from "@/lib/catch-display";
import type { Catch, BigFiveBreakdown } from "@/types/home";
import type { MemberCatch, MemberBigFiveBreakdown } from "@/types/member-page";

export type BigFiveCatchLike = Pick<
  Catch,
  "id" | "fish_type" | "fine_fish_type" | "weight_g" | "catch_date" | "caught_for" | "image_url"
>;

export function getBigFiveScore(catchItem: Pick<BigFiveCatchLike, "fish_type" | "weight_g">): number {
  return catchItem.fish_type === "Abborre" ? catchItem.weight_g * 4 : catchItem.weight_g;
}

export function buildBigFiveBreakdownForCatches(
  name: string,
  catches: BigFiveCatchLike[]
): BigFiveBreakdown {
  const topFiveCatches = [...catches]
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

  return { name, total, items };
}

export function buildMemberBigFiveBreakdownForCatches(
  catches: MemberCatch[],
  year: string | null,
  formatWeight: (weightG: number | null | undefined) => string
): MemberBigFiveBreakdown {
  const topFiveCatches = [...catches]
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

  const totalWeightG = items.reduce((sum, item) => sum + item.adjustedWeight, 0);

  return {
    year,
    totalWeightG,
    totalWeight: formatWeight(totalWeightG),
    items,
  };
}

export function getCatchYearKey(catchItem: Pick<BigFiveCatchLike, "catch_date">): string | null {
  return getCatchYear(catchItem);
}
