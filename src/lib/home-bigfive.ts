import { buildBigFiveBreakdownForCatches, getBigFiveScore, getCatchYearKey } from "@/lib/big-five";
import { buildMemberLookupByName, isCompetitionEligibleCatch } from "@/lib/ght-rules";
import type { BigFiveBreakdown, Catch, Member } from "@/types/home";

export function buildBigFiveBreakdowns(catches: Catch[], members: Member[]): Record<string, BigFiveBreakdown> {
  if (!catches.length) return {};

  const memberLookupByName = buildMemberLookupByName(members);
  const eligibleCatches = catches.filter((catchItem) => isCompetitionEligibleCatch(catchItem, memberLookupByName));
  const groupedCatches: Record<string, Catch[]> = {};

  eligibleCatches.forEach((catchItem) => {
    if (!groupedCatches[catchItem.caught_for]) groupedCatches[catchItem.caught_for] = [];
    groupedCatches[catchItem.caught_for].push(catchItem);
  });

  return Object.fromEntries(Object.entries(groupedCatches).map(([name, memberCatches]) => [name, buildBigFiveBreakdownForCatches(name, memberCatches)]));
}

export function buildAllTimeBigFiveLeader(catches: Catch[], members: Member[]): { winnerName: string; bestYear: string; total: number; sourceCount: number; catchDate: string | null; catchImageUrl: string | null; breakdown: BigFiveBreakdown; } | null {
  if (!catches.length) return null;

  const memberLookupByName = buildMemberLookupByName(members);
  const eligibleCatches = catches.filter((catchItem) => isCompetitionEligibleCatch(catchItem, memberLookupByName));
  const groupedByMemberYear: Record<string, Catch[]> = {};

  eligibleCatches.forEach((catchItem) => {
    const year = getCatchYearKey(catchItem);
    if (!year) return;
    const key = `${catchItem.caught_for}__${year}`;
    if (!groupedByMemberYear[key]) groupedByMemberYear[key] = [];
    groupedByMemberYear[key].push(catchItem);
  });

  const candidates = Object.entries(groupedByMemberYear)
    .map(([key, memberYearCatches]) => {
      const [winnerName, bestYear] = key.split("__");
      const breakdown = buildBigFiveBreakdownForCatches(winnerName, memberYearCatches);
      const latestTopFiveDate = [...breakdown.items].map((item) => item.catchDate).filter(Boolean).sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime())[0] || null;
      const topCatch = [...memberYearCatches].sort((a, b) => getBigFiveScore(b) - getBigFiveScore(a))[0];
      return { winnerName, bestYear, total: breakdown.total, sourceCount: breakdown.items.length, catchDate: latestTopFiveDate, catchImageUrl: topCatch?.image_url || null, breakdown };
    })
    .sort((a, b) => b.total - a.total);

  return candidates[0] || null;
}
