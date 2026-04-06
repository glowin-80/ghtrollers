import { buildMemberBigFiveBreakdownForCatches, getCatchYearKey } from "@/lib/big-five";
import { formatWeight } from "@/lib/member-page-format";
import type { MemberBigFiveBreakdown, MemberCatch } from "@/types/member-page";

function getApprovedCatches(catches: MemberCatch[]) {
  return catches.filter((c) => c.status === "approved");
}

export function buildMemberBestBigFiveBreakdown(
  catches: MemberCatch[]
): MemberBigFiveBreakdown | null {
  const approved = getApprovedCatches(catches);

  if (!approved.length) {
    return null;
  }

  const groupedByYear: Record<string, MemberCatch[]> = {};

  approved.forEach((catchItem) => {
    const year = getCatchYearKey(catchItem);

    if (!year) {
      return;
    }

    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }

    groupedByYear[year].push(catchItem);
  });

  const bestPerYear = Object.entries(groupedByYear)
    .map(([year, yearCatches]) =>
      buildMemberBigFiveBreakdownForCatches(yearCatches, year, formatWeight)
    )
    .sort((a, b) => b.totalWeightG - a.totalWeightG);

  return bestPerYear[0] || null;
}
