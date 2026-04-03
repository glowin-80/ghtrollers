import type {
  BestFineFishBySpecies,
  MemberCatch,
  MemberStats,
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

function normalizeFineFishSpeciesName(value: string | null | undefined): string {
  const raw = (value || "Okänd").trim();

  if (!raw) {
    return "Okänd";
  }

  const normalized = raw.toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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

  const scores = approved.map((c) =>
    c.fish_type === "Abborre" ? c.weight_g * 4 : c.weight_g
  );

  const bestBigFive = [...scores]
    .sort((a, b) => b - a)
    .slice(0, 5)
    .reduce((sum, value) => sum + value, 0);

  const sum = (arr: MemberCatch[]) => arr.reduce((s, c) => s + c.weight_g, 0);

  const speciesMap: Record<string, { count: number; weight: number }> = {};
  const bestFineFishBySpeciesMap: Record<string, number> = {};

  fine.forEach((c) => {
    const key = normalizeFineFishSpeciesName(c.fine_fish_type);

    if (!speciesMap[key]) {
      speciesMap[key] = { count: 0, weight: 0 };
    }

    speciesMap[key].count += 1;
    speciesMap[key].weight += c.weight_g;

    if (!bestFineFishBySpeciesMap[key] || c.weight_g > bestFineFishBySpeciesMap[key]) {
      bestFineFishBySpeciesMap[key] = c.weight_g;
    }
  });

  const fineFishSpeciesStats = Object.entries(speciesMap)
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
    bestBigFive: formatWeight(bestBigFive),

    totalPerchCount: perch.length,
    totalPikeCount: pike.length,
    totalFineFishCount: fine.length,

    totalPerchWeight: formatWeight(sum(perch)),
    totalPikeWeight: formatWeight(sum(pike)),
    totalFineFishWeight: formatWeight(sum(fine)),

    fineFishSpeciesStats,
    bestFineFishBySpecies,
  };
}