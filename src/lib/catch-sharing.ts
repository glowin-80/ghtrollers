import { getCatchOwnerDisplayName } from "@/lib/catch-identity";
import { getCompetitionExclusionReason, isCompetitionEligibleCatch } from "@/lib/ght-rules";
import type { Catch, LeaderboardFilter, Member } from "@/types/home";

export type CatchShareDetails = {
  shareText: string;
  shareTitle: string;
  yearlyRank: number | null;
  yearlyRankYear: string | null;
  isCurrentAllTimeLeader: boolean;
  categoryLabel: string;
  fishLabel: string;
};

function getCatchCategory(catchItem: Catch): LeaderboardFilter | null {
  if (catchItem.fish_type === "Abborre") return "abborre";
  if (catchItem.fish_type === "Gädda") return "gädda";
  if (catchItem.fish_type === "Fina fisken") return "fina";
  return null;
}

export function getCatchFishLabel(catchItem: Catch) {
  return catchItem.fish_type === "Fina fisken" && catchItem.fine_fish_type
    ? catchItem.fine_fish_type
    : catchItem.fish_type;
}

export function getCatchCategoryLabel(catchItem: Catch) {
  const category = getCatchCategory(catchItem);
  return category === "fina" ? "Fina fisken" : getCatchFishLabel(catchItem);
}

export function formatCatchDateForDisplay(dateString?: string | null) {
  if (!dateString) return "Saknas";
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date(dateString));
}

export function formatCatchWeightForDisplay(weightG: number) {
  return weightG >= 1000 ? `${(weightG / 1000).toFixed(2)} kg` : `${weightG} g`;
}

function isSameCategory(candidate: Catch, target: Catch) {
  return getCatchCategory(candidate) === getCatchCategory(target);
}

function getYearlyRank(target: Catch, approvedCatches: Catch[], members: Member[]) {
  const catchYear = target.catch_date?.slice(0, 4);
  const targetCategory = getCatchCategory(target);
  if (!catchYear || !targetCategory || !isCompetitionEligibleCatch(target, members)) return null;
  return (
    approvedCatches.filter(
      (candidate) =>
        candidate.id !== target.id &&
        candidate.status === "approved" &&
        candidate.catch_date?.startsWith(catchYear) &&
        isSameCategory(candidate, target) &&
        isCompetitionEligibleCatch(candidate, members) &&
        candidate.weight_g > target.weight_g
    ).length + 1
  );
}

function isCurrentAllTimeLeader(target: Catch, approvedCatches: Catch[], members: Member[]) {
  const targetCategory = getCatchCategory(target);
  if (!targetCategory || !isCompetitionEligibleCatch(target, members)) return false;
  return !approvedCatches.some(
    (candidate) =>
      candidate.id !== target.id &&
      candidate.status === "approved" &&
      isSameCategory(candidate, target) &&
      isCompetitionEligibleCatch(candidate, members) &&
      candidate.weight_g > target.weight_g
  );
}

function getFirstName(fullName: string) {
  const trimmedName = fullName.trim();
  if (!trimmedName) return fullName;
  return trimmedName.split(/\s+/)[0] || trimmedName;
}

function getCurrentCompetitionYear() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric" }).format(new Date());
}

function formatRankForSentence(rank: number) {
  if (rank <= 0) return `${rank}`;
  if (rank === 1 || rank === 2) return `${rank}:a`;
  return `${rank}:e`;
}

function buildYearlyPlacementText(fullName: string, yearlyRank: number | null, catchYear: string | null) {
  if (!yearlyRank || !catchYear) return "";
  const firstName = getFirstName(fullName);
  const currentYear = getCurrentCompetitionYear();
  if (catchYear === currentYear) return ` Fångsten placerar ${firstName} på plats ${yearlyRank} i årets tävling.`;
  if (Number(catchYear) === Number(currentYear) - 1) return ` Förra året gav detta ${firstName} en ${formatRankForSentence(yearlyRank)} plats i tävlingen.`;
  return ` År ${catchYear} gav detta ${firstName} en ${formatRankForSentence(yearlyRank)} plats i tävlingen.`;
}

export function buildCatchShareDetails(catchItem: Catch, approvedCatches: Catch[], members: Member[]): CatchShareDetails {
  const fishLabel = getCatchFishLabel(catchItem);
  const categoryLabel = getCatchCategoryLabel(catchItem);
  const yearlyRank = getYearlyRank(catchItem, approvedCatches, members);
  const currentAllTimeLeader = isCurrentAllTimeLeader(catchItem, approvedCatches, members);
  const formattedDate = formatCatchDateForDisplay(catchItem.catch_date);
  const catchYear = catchItem.catch_date?.slice(0, 4) ?? null;
  const exclusionReason = getCompetitionExclusionReason(catchItem, members);
  const ownerName = getCatchOwnerDisplayName(catchItem, members);
  const baseText = `${ownerName} drog upp en ${fishLabel} på ${catchItem.weight_g} g den ${formattedDate}.`;
  const yearlyText = buildYearlyPlacementText(ownerName, yearlyRank, catchYear);
  const allTimeText = currentAllTimeLeader ? ` Fångsten tar även förstaplatsen i All-Time-High för ${categoryLabel}.` : "";
  const exclusionText = exclusionReason ? ` Fångsten räknas inte i tävlingen eftersom den är markerad som ${exclusionReason.toLowerCase()}.` : "";
  return {
    shareTitle: `${ownerName} · ${fishLabel} · Gäddhäng Trollers`,
    shareText: `${baseText}${yearlyText}${allTimeText}${exclusionText}`.trim(),
    yearlyRank,
    yearlyRankYear: catchYear,
    isCurrentAllTimeLeader: currentAllTimeLeader,
    categoryLabel,
    fishLabel,
  };
}
