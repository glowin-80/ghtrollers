import {
  buildBigFiveBreakdownForCatches,
  getBigFiveScore,
  getCatchYearKey,
} from "@/lib/big-five";
import {
  getCatchOwnerDisplayName,
  getCatchOwnerIdentityKey,
} from "@/lib/catch-identity";
import { isCompetitionEligibleCatch } from "@/lib/ght-rules";
import type { BigFiveBreakdown, Catch, Member } from "@/types/home";

export function buildBigFiveBreakdowns(
  catches: Catch[],
  members: Member[]
): Record<string, BigFiveBreakdown> {
  if (!catches.length) return {};

  const eligibleCatches = catches.filter((catchItem) =>
    isCompetitionEligibleCatch(catchItem, members)
  );
  const groupedCatches: Record<string, Catch[]> = {};

  eligibleCatches.forEach((catchItem) => {
    const key = getCatchOwnerIdentityKey(catchItem);
    if (!key) return;
    if (!groupedCatches[key]) groupedCatches[key] = [];
    groupedCatches[key].push(catchItem);
  });

  return Object.fromEntries(
    Object.entries(groupedCatches).map(([identityKey, memberCatches]) => {
      const displayName =
        getCatchOwnerDisplayName(memberCatches[0], members) || identityKey;

      return [
        identityKey,
        {
          ...buildBigFiveBreakdownForCatches(displayName, memberCatches),
          identityKey,
          name: displayName,
        },
      ];
    })
  );
}

export function buildAllTimeBigFiveLeader(
  catches: Catch[],
  members: Member[]
): {
  identityKey: string;
  winnerName: string;
  bestYear: string;
  total: number;
  sourceCount: number;
  catchDate: string | null;
  catchImageUrl: string | null;
  breakdown: BigFiveBreakdown;
} | null {
  if (!catches.length) return null;

  const eligibleCatches = catches.filter((catchItem) =>
    isCompetitionEligibleCatch(catchItem, members)
  );
  const groupedByMemberYear: Record<string, Catch[]> = {};

  eligibleCatches.forEach((catchItem) => {
    const year = getCatchYearKey(catchItem);
    const ownerKey = getCatchOwnerIdentityKey(catchItem);

    if (!year || !ownerKey) return;

    const key = `${ownerKey}__${year}`;
    if (!groupedByMemberYear[key]) groupedByMemberYear[key] = [];
    groupedByMemberYear[key].push(catchItem);
  });

  const candidates = Object.entries(groupedByMemberYear)
    .map(([key, memberYearCatches]) => {
      const [identityKey, bestYear] = key.split("__");
      const winnerName = getCatchOwnerDisplayName(memberYearCatches[0], members);

      const breakdown: BigFiveBreakdown = {
        ...buildBigFiveBreakdownForCatches(winnerName, memberYearCatches),
        identityKey,
        name: winnerName,
      };

      const latestTopFiveDate =
        [...breakdown.items]
          .map((item) => item.catchDate)
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(b as string).getTime() - new Date(a as string).getTime()
          )[0] || null;

      const topCatch = [...memberYearCatches].sort(
        (a, b) => getBigFiveScore(b) - getBigFiveScore(a)
      )[0];

      return {
        identityKey,
        winnerName,
        bestYear,
        total: breakdown.total,
        sourceCount: breakdown.items.length,
        catchDate: latestTopFiveDate,
        catchImageUrl: topCatch?.image_url || null,
        breakdown,
      };
    })
    .sort((a, b) => b.total - a.total);

  return candidates[0] || null;
}