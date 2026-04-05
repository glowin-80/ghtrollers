import type {
  BestFineFishBySpecies,
  MemberBigFiveBreakdown,
  MemberCatch,
  MemberStats,
  SpeciesAggregateStat,
} from "@/types/member-page";

export function formatWeight(weightG: number | null | undefined): string {
  if (!weightG || weightG <= 0) {
    return "-";
  }

  return `${(weightG / 1000).toFixed(2)} kg`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("sv-SE");
}

export function getDisplayFishName(catchItem: MemberCatch): string {
  if (catchItem.fish_type === "Fina fisken" && catchItem.fine_fish_type) {
    return `Fina fisken (${catchItem.fine_fish_type})`;
  }

  return catchItem.fish_type;
}

export function getStatusLabel(status: string): string {
  if (status === "approved") return "Godkänd";
  if (status === "pending") return "Väntar";
  if (status === "rejected") return "Nekad";
  return status;
}

export function getStatusClasses(status: string): string {
  if (status === "approved") {
    return "bg-[#e8f6ea] text-[#2f6b3b]";
  }

  if (status === "pending") {
    return "bg-[#fff7e6] text-[#8a5a00]";
  }

  if (status === "rejected") {
    return "bg-[#fdecec] text-[#9f2d2d]";
  }

  return "bg-[#eef2f3] text-[#4b5563]";
}

export function normalizeFineFishSpeciesName(
  value: string | null | undefined
): string {
  const raw = (value || "Okänd").trim();

  if (!raw) {
    return "Okänd";
  }

  const normalized = raw.toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getBigFiveScore(catchItem: MemberCatch) {
  return catchItem.fish_type === "Abborre"
    ? catchItem.weight_g * 4
    : catchItem.weight_g;
}

function getCatchYear(catchItem: MemberCatch) {
  return catchItem.catch_date?.slice(0, 4) || null;
}

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

function buildBigFiveBreakdownForCatches(
  catches: MemberCatch[],
  year: string | null
): MemberBigFiveBreakdown {
  const topFiveCatches = [...catches]
    .sort((a, b) => getBigFiveScore(b) - getBigFiveScore(a))
    .slice(0, 5);

  const items = topFiveCatches.map((catchItem) => ({
    catchId: catchItem.id,
    fishLabel:
      catchItem.fish_type === "Fina fisken" && catchItem.fine_fish_type
        ? normalizeFineFishSpeciesName(catchItem.fine_fish_type)
        : catchItem.fish_type,
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

export function buildMemberBestBigFiveBreakdown(
  catches: MemberCatch[]
): MemberBigFiveBreakdown | null {
  const approved = getApprovedCatches(catches);

  if (!approved.length) {
    return null;
  }

  const groupedByYear: Record<string, MemberCatch[]> = {};

  approved.forEach((catchItem) => {
    const year = getCatchYear(catchItem);

    if (!year) {
      return;
    }

    if (!groupedByYear[year]) {
      groupedByYear[year] = [];
    }

    groupedByYear[year].push(catchItem);
  });

  const bestPerYear = Object.entries(groupedByYear)
    .map(([year, yearCatches]) => buildBigFiveBreakdownForCatches(yearCatches, year))
    .sort((a, b) => b.totalWeightG - a.totalWeightG);

  return bestPerYear[0] || null;
}

export function calculateMemberStats(catches: MemberCatch[]): MemberStats {
  const approved = catches.filter((c) => c.status === "approved");
  const pending = catches.filter((c) => c.status === "pending");

  const perch = approved.filter((c) => c.fish_type === "Abborre");
  const pike = approved.filter((c) => c.fish_type === "Gädda");
  const fine = approved.filter((c) => c.fish_type === "Fina fisken");

  const biggestPike =
    pike.length > 0 ? Math.max(...pike.map((c) => c.weight_g)) : 0;

  const biggestPerch =
    perch.length > 0 ? Math.max(...perch.map((c) => c.weight_g)) : 0;

  const bestFine =
    fine.length > 0
      ? [...fine].sort((a, b) => b.weight_g - a.weight_g)[0]
      : null;

  const bestBigFiveBreakdown = buildMemberBestBigFiveBreakdown(catches);

  const sum = (arr: MemberCatch[]) => arr.reduce((s, c) => s + c.weight_g, 0);

  const fineSpeciesMap: Record<string, { count: number; weight: number }> = {};
  const bestFineFishBySpeciesMap: Record<string, number> = {};
  const speciesAggregateMap: Record<string, { count: number; weight: number }> = {};

  perch.forEach((c) => {
    if (!speciesAggregateMap.Abborre) {
      speciesAggregateMap.Abborre = { count: 0, weight: 0 };
    }

    speciesAggregateMap.Abborre.count += 1;
    speciesAggregateMap.Abborre.weight += c.weight_g;
  });

  pike.forEach((c) => {
    if (!speciesAggregateMap.Gädda) {
      speciesAggregateMap.Gädda = { count: 0, weight: 0 };
    }

    speciesAggregateMap.Gädda.count += 1;
    speciesAggregateMap.Gädda.weight += c.weight_g;
  });

  fine.forEach((c) => {
    const species = normalizeFineFishSpeciesName(c.fine_fish_type);

    if (!fineSpeciesMap[species]) {
      fineSpeciesMap[species] = { count: 0, weight: 0 };
    }

    fineSpeciesMap[species].count += 1;
    fineSpeciesMap[species].weight += c.weight_g;

    if (
      !bestFineFishBySpeciesMap[species] ||
      c.weight_g > bestFineFishBySpeciesMap[species]
    ) {
      bestFineFishBySpeciesMap[species] = c.weight_g;
    }

    if (!speciesAggregateMap[species]) {
      speciesAggregateMap[species] = { count: 0, weight: 0 };
    }

    speciesAggregateMap[species].count += 1;
    speciesAggregateMap[species].weight += c.weight_g;
  });

  const fineFishSpeciesStats = Object.entries(fineSpeciesMap)
    .map(([species, data]) => ({
      species,
      count: data.count,
      totalWeight: `${(data.weight / 1000).toFixed(2)} kg`,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.species.localeCompare(b.species, "sv");
    });

  const bestFineFishBySpecies: BestFineFishBySpecies[] = Object.entries(
    bestFineFishBySpeciesMap
  )
    .map(([species, weight]) => ({
      species,
      weight: formatWeight(weight),
      weightG: weight,
    }))
    .sort((a, b) => {
      if (b.weightG !== a.weightG) {
        return b.weightG - a.weightG;
      }

      return a.species.localeCompare(b.species, "sv");
    });

  const speciesAggregateStats: SpeciesAggregateStat[] = Object.entries(
    speciesAggregateMap
  )
    .map(([species, data]) => ({
      species,
      count: data.count,
      totalWeight: formatWeight(data.weight),
      totalWeightG: data.weight,
    }))
    .sort((a, b) => {
      if (b.totalWeightG !== a.totalWeightG) {
        return b.totalWeightG - a.totalWeightG;
      }

      return a.species.localeCompare(b.species, "sv");
    });

  return {
    totalCatches: catches.length,
    approvedCatches: approved.length,
    pendingCatches: pending.length,

    biggestPike: formatWeight(biggestPike),
    biggestPerch: formatWeight(biggestPerch),
    bestFineFish: bestFine
      ? `${normalizeFineFishSpeciesName(bestFine.fine_fish_type)} - ${formatWeight(
          bestFine.weight_g
        )}`
      : "-",
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