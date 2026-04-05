import type { Catch, LeaderboardFilter } from "@/types/home";

export type CatchShareDetails = {
  shareText: string;
  shareTitle: string;
  yearlyRank: number | null;
  isCurrentAllTimeLeader: boolean;
  categoryLabel: string;
  fishLabel: string;
};

function getCatchCategory(catchItem: Catch): LeaderboardFilter | null {
  if (catchItem.fish_type === "Abborre") {
    return "abborre";
  }

  if (catchItem.fish_type === "Gädda") {
    return "gädda";
  }

  if (catchItem.fish_type === "Fina fisken") {
    return "fina";
  }

  return null;
}

export function getCatchFishLabel(catchItem: Catch) {
  if (catchItem.fish_type === "Fina fisken" && catchItem.fine_fish_type) {
    return catchItem.fine_fish_type;
  }

  return catchItem.fish_type;
}

export function getCatchCategoryLabel(catchItem: Catch) {
  const category = getCatchCategory(catchItem);

  if (category === "fina") {
    return "Fina fisken";
  }

  return getCatchFishLabel(catchItem);
}

export function formatCatchDateForDisplay(dateString?: string | null) {
  if (!dateString) {
    return "Saknas";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
  }).format(new Date(dateString));
}

export function formatCatchWeightForDisplay(weightG: number) {
  if (weightG >= 1000) {
    return `${(weightG / 1000).toFixed(2)} kg`;
  }

  return `${weightG} g`;
}

function isSameCategory(candidate: Catch, target: Catch) {
  return getCatchCategory(candidate) === getCatchCategory(target);
}

function getYearlyRank(target: Catch, approvedCatches: Catch[]) {
  const catchYear = target.catch_date?.slice(0, 4);
  const targetCategory = getCatchCategory(target);

  if (!catchYear || !targetCategory) {
    return null;
  }

  const higherWeightCount = approvedCatches.filter((candidate) => {
    return (
      candidate.id !== target.id &&
      candidate.status === "approved" &&
      candidate.catch_date?.startsWith(catchYear) &&
      isSameCategory(candidate, target) &&
      candidate.weight_g > target.weight_g
    );
  }).length;

  return higherWeightCount + 1;
}

function isCurrentAllTimeLeader(target: Catch, approvedCatches: Catch[]) {
  const targetCategory = getCatchCategory(target);

  if (!targetCategory) {
    return false;
  }

  return !approvedCatches.some((candidate) => {
    return (
      candidate.id !== target.id &&
      candidate.status === "approved" &&
      isSameCategory(candidate, target) &&
      candidate.weight_g > target.weight_g
    );
  });
}

export function buildCatchShareDetails(
  catchItem: Catch,
  approvedCatches: Catch[]
): CatchShareDetails {
  const fishLabel = getCatchFishLabel(catchItem);
  const categoryLabel = getCatchCategoryLabel(catchItem);
  const yearlyRank = getYearlyRank(catchItem, approvedCatches);
  const currentAllTimeLeader = isCurrentAllTimeLeader(catchItem, approvedCatches);
  const formattedDate = formatCatchDateForDisplay(catchItem.catch_date);

  const baseText = `${catchItem.caught_for} drog upp en ${fishLabel} på ${catchItem.weight_g} g den ${formattedDate}.`;

  const yearlyText = yearlyRank
    ? ` Fångsten placerar ${catchItem.caught_for} på plats ${yearlyRank} i årets tävling.`
    : "";

  const allTimeText = currentAllTimeLeader
    ? ` Fångsten tar även förstaplatsen i All-Time-High för ${categoryLabel}.`
    : "";

  return {
    shareTitle: `${catchItem.caught_for} · ${fishLabel} · Gäddhäng Trollers`,
    shareText: `${baseText}${yearlyText}${allTimeText}`.trim(),
    yearlyRank,
    isCurrentAllTimeLeader: currentAllTimeLeader,
    categoryLabel,
    fishLabel,
  };
}