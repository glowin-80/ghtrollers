import {
  formatWeight,
  normalizeFineFishSpeciesName,
} from "@/lib/member-page-format";
import { buildMemberBestBigFiveBreakdown } from "@/lib/member-page-bigfive";
import type {
  BestFineFishBySpecies,
  MemberCatch,
  MemberStats,
  SpeciesAggregateStat,
} from "@/types/member-page";

function getApprovedCatches(catches: MemberCatch[]) {
  return catches.filter((c) => c.status === "approved");
}

export function findBestCatchByFishType(
  catches: MemberCatch[],
  fishType: "Gädda" | "Abborre" | "Fina fisken"
): MemberCatch | null {
  const approved = getApprovedCatches(catches)
    .filter((catchItem) => catchItem.fish_type === fishType)
    .sort((a, b) => b.weight_g - a.weight_g);

  return approved[0] || null;
}

export function findBestFineFishBySpeciesCatchMap(
  catches: MemberCatch[]
): Record<string, MemberCatch> {
  const approvedFineFish = getApprovedCatches(catches).filter(
    (catchItem) => catchItem.fish_type === "Fina fisken"
  );

  const bestBySpecies: Record<string, MemberCatch> = {};

  approvedFineFish.forEach((catchItem) => {
    const species = normalizeFineFishSpeciesName(catchItem.fine_fish_type);
    const existing = bestBySpecies[species];

    if (!existing || catchItem.weight_g > existing.weight_g) {
      bestBySpecies[species] = catchItem;
    }
  });

  return bestBySpecies;
}

export function calculateMemberStats(catches: MemberCatch[], memberRole?: string | null): MemberStats {
  const approved = catches.filter((c) => c.status === "approved");
  const pending = catches.filter((c) => c.status === "pending");

  const perch = approved.filter((c) => c.fish_type === "Abborre");
  const pike = approved.filter((c) => c.fish_type === "Gädda");
  const fine = approved.filter((c) => c.fish_type === "Fina fisken");

  const biggestPike = pike.length > 0 ? Math.max(...pike.map((c) => c.weight_g)) : 0;
  const biggestPerch = perch.length > 0 ? Math.max(...perch.map((c) => c.weight_g)) : 0;
  const bestFine = fine.length > 0 ? [...fine].sort((a, b) => b.weight_g - a.weight_g)[0] : null;
  const bestBigFiveBreakdown = buildMemberBestBigFiveBreakdown(catches, memberRole);
  const sum = (arr: MemberCatch[]) => arr.reduce((s, c) => s + c.weight_g, 0);

  const fineSpeciesMap: Record<string, { count: number; weight: number }> = {};
  const bestFineFishBySpeciesMap: Record<string, number> = {};
  const speciesAggregateMap: Record<string, { count: number; weight: number }> = {};

  perch.forEach((c) => {
    if (!speciesAggregateMap.Abborre) speciesAggregateMap.Abborre = { count: 0, weight: 0 };
    speciesAggregateMap.Abborre.count += 1;
    speciesAggregateMap.Abborre.weight += c.weight_g;
  });

  pike.forEach((c) => {
    if (!speciesAggregateMap.Gädda) speciesAggregateMap.Gädda = { count: 0, weight: 0 };
    speciesAggregateMap.Gädda.count += 1;
    speciesAggregateMap.Gädda.weight += c.weight_g;
  });

  fine.forEach((c) => {
    const species = normalizeFineFishSpeciesName(c.fine_fish_type);

    if (!fineSpeciesMap[species]) fineSpeciesMap[species] = { count: 0, weight: 0 };
    fineSpeciesMap[species].count += 1;
    fineSpeciesMap[species].weight += c.weight_g;

    if (!bestFineFishBySpeciesMap[species] || c.weight_g > bestFineFishBySpeciesMap[species]) {
      bestFineFishBySpeciesMap[species] = c.weight_g;
    }

    if (!speciesAggregateMap[species]) speciesAggregateMap[species] = { count: 0, weight: 0 };
    speciesAggregateMap[species].count += 1;
    speciesAggregateMap[species].weight += c.weight_g;
  });

  const fineFishSpeciesStats = Object.entries(fineSpeciesMap)
    .map(([species, data]) => ({ species, count: data.count, totalWeight: `${(data.weight / 1000).toFixed(2)} kg` }))
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.species.localeCompare(b.species, "sv")));

  const bestFineFishBySpecies: BestFineFishBySpecies[] = Object.entries(bestFineFishBySpeciesMap)
    .map(([species, weight]) => ({ species, weight: formatWeight(weight), weightG: weight }))
    .sort((a, b) => (b.weightG !== a.weightG ? b.weightG - a.weightG : a.species.localeCompare(b.species, "sv")));

  const speciesAggregateStats: SpeciesAggregateStat[] = Object.entries(speciesAggregateMap)
    .map(([species, data]) => ({ species, count: data.count, totalWeight: formatWeight(data.weight), totalWeightG: data.weight }))
    .sort((a, b) => (b.totalWeightG !== a.totalWeightG ? b.totalWeightG - a.totalWeightG : a.species.localeCompare(b.species, "sv")));

  return {
    totalCatches: catches.length,
    approvedCatches: approved.length,
    pendingCatches: pending.length,
    biggestPike: formatWeight(biggestPike),
    biggestPerch: formatWeight(biggestPerch),
    bestFineFish: bestFine ? `${normalizeFineFishSpeciesName(bestFine.fine_fish_type)} - ${formatWeight(bestFine.weight_g)}` : "-",
    bestBigFive: bestBigFiveBreakdown?.totalWeight || "-",
    totalPerchCount: perch.length,
    totalPikeCount: pike.length,
    totalFineFishCount: fine.length,
    totalPerchWeight: formatWeight(sum(perch)),
    totalPikeWeight: formatWeight(sum(pike)),
    totalFineFishWeight: formatWeight(sum(fine)),
    fineFishSpeciesStats,
    bestFineFishBySpecies,
    speciesAggregateStats,
  };
}
