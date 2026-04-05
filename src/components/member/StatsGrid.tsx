"use client";

import { useMemo, useState } from "react";
import {
  buildMemberBestBigFiveBreakdown,
  calculateMemberStats,
  findBestCatchByFishType,
  findBestFineFishBySpeciesCatchMap,
  formatDate,
  formatWeight,
} from "@/lib/member-page";
import type {
  MemberBigFiveBreakdown,
  MemberCatch,
  MemberStats,
} from "@/types/member-page";

type Props = {
  catches: MemberCatch[];
  onSelectCatch?: (catchId: string) => void;
};

type CatchYearFilter = "all" | string;

type ClickableStatCardProps = {
  title: string;
  value: string | number;
  onClick?: () => void;
};

function StatCard({ title, value, onClick }: ClickableStatCardProps) {
  const className = [
    "rounded-[20px] border border-[#ddd8cf] bg-[#fffdfb] px-3.5 py-3 shadow-sm text-left transition",
    onClick ? "hover:bg-[#faf7f2] hover:border-[#d0c6b8] cursor-pointer" : "",
  ]
    .join(" ")
    .trim();

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <div className="text-[0.85rem] font-semibold leading-snug text-[#6f685d]">
          {title}
        </div>

        <div className="mt-2 break-words text-[1.2rem] font-bold leading-tight text-[#1f2937]">
          {value}
        </div>
      </button>
    );
  }

  return (
    <div className={className}>
      <div className="text-[0.85rem] font-semibold leading-snug text-[#6f685d]">
        {title}
      </div>

      <div className="mt-2 break-words text-[1.2rem] font-bold leading-tight text-[#1f2937]">
        {value}
      </div>
    </div>
  );
}

function getFilterBadgeLabel(selectedYear: CatchYearFilter): string {
  if (selectedYear === "all") {
    return "Alla år";
  }

  return selectedYear;
}

function YearFilterControls({
  selectedYear,
  currentSwedenYear,
  availableYears,
  onChange,
}: {
  selectedYear: CatchYearFilter;
  currentSwedenYear: string;
  availableYears: string[];
  onChange: (value: CatchYearFilter) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
        Filter
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange("all")}
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            selectedYear === "all"
              ? "bg-[#324b2f] text-white"
              : "border border-[#d8d2c7] bg-[#f7f4ee] text-[#4b5563] hover:bg-[#f1ece3]",
          ].join(" ")}
        >
          Alla år
        </button>

        <div className="relative">
          <select
            value={selectedYear === "all" ? currentSwedenYear : selectedYear}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-full border border-[#d8d2c7] bg-[#f7f4ee] px-4 py-2 pr-10 text-sm font-semibold text-[#4b5563] outline-none transition hover:bg-[#f1ece3] focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            aria-label="Välj år för stats"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6b7280]">
            ▼
          </span>
        </div>
      </div>
    </div>
  );
}

function BigFiveBreakdownPanel({
  breakdown,
  onSelectCatch,
}: {
  breakdown: MemberBigFiveBreakdown;
  onSelectCatch?: (catchId: string) => void;
}) {
  return (
    <div className="mt-4 rounded-[22px] border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">
            Underlag för Big Five
          </div>
          <div className="mt-1 text-sm text-[#6b7280]">
            År: {breakdown.year || "Saknas"}
          </div>
        </div>

        <div className="text-[0.82rem] font-semibold text-[#6c5b3d]">
          Total: {breakdown.totalWeight}
        </div>
      </div>

      <div className="space-y-2">
        {breakdown.items.map((item) => (
          <button
            key={item.catchId}
            type="button"
            onClick={() => onSelectCatch?.(item.catchId)}
            className="w-full rounded-[16px] border border-[#eadfbe] bg-[#fffdf7] px-3 py-2.5 text-left transition hover:bg-[#fff8ec]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[0.95rem] font-bold leading-tight text-[#1f2937]">
                  {item.fishLabel}
                </div>
                <div className="mt-1 text-[0.8rem] text-[#6b7280]">
                  {item.catchDate ? formatDate(item.catchDate) : "Saknas"}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[0.92rem] font-bold leading-tight text-[#1f2937]">
                  {item.usesMultiplier
                    ? `${formatWeight(item.originalWeight)} ×4`
                    : formatWeight(item.originalWeight)}
                </div>
                <div className="mt-1 text-[0.78rem] font-semibold text-[#7a6540]">
                  {item.usesMultiplier
                    ? `Räknas som ${formatWeight(item.adjustedWeight)}`
                    : "Ingen justering"}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function StatsGrid({ catches, onSelectCatch }: Props) {
  const currentSwedenYear = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
    });

    return formatter.format(new Date());
  }, []);

  const [selectedYear, setSelectedYear] = useState<CatchYearFilter>("all");
  const [bigFiveExpanded, setBigFiveExpanded] = useState(false);

  const availableYears = useMemo(() => {
    const startYear = 2016;
    const endYear = Number(currentSwedenYear);

    const years: string[] = [];

    for (let year = endYear; year >= startYear; year -= 1) {
      years.push(String(year));
    }

    return years;
  }, [currentSwedenYear]);

  const filteredCatches = useMemo(() => {
    if (selectedYear === "all") {
      return catches;
    }

    return catches.filter((item) => item.catch_date?.startsWith(selectedYear));
  }, [catches, selectedYear]);

  const stats: MemberStats = useMemo(
    () => calculateMemberStats(filteredCatches),
    [filteredCatches]
  );

  const bestPikeCatch = useMemo(
    () => findBestCatchByFishType(filteredCatches, "Gädda"),
    [filteredCatches]
  );
  const bestPerchCatch = useMemo(
    () => findBestCatchByFishType(filteredCatches, "Abborre"),
    [filteredCatches]
  );
  const bestFineCatch = useMemo(
    () => findBestCatchByFishType(filteredCatches, "Fina fisken"),
    [filteredCatches]
  );
  const bestFineFishBySpeciesCatchMap = useMemo(
    () => findBestFineFishBySpeciesCatchMap(filteredCatches),
    [filteredCatches]
  );
  const bestBigFiveBreakdown = useMemo(
    () => buildMemberBestBigFiveBreakdown(filteredCatches),
    [filteredCatches]
  );

  const filterBadgeLabel = getFilterBadgeLabel(selectedYear);

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-[#d8d2c7] bg-white p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-[1.6rem] font-bold leading-tight text-[#1f2937] sm:text-[1.8rem]">
              Mina bästa fiskefångster genom tiderna!
            </h2>
            <p className="mt-1 text-sm text-[#6b7280]">
              Filtrera på år för att se dina bästa fångster för en viss säsong.
            </p>
          </div>

          <div className="shrink-0">
            <YearFilterControls
              selectedYear={selectedYear}
              currentSwedenYear={currentSwedenYear}
              availableYears={availableYears}
              onChange={(value) => {
                setSelectedYear(value);
                setBigFiveExpanded(false);
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5c4d3f]">
            {filterBadgeLabel}
          </span>

          <span className="rounded-full bg-[#eef3eb] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#466143]">
            {stats.approvedCatches} godkända fångster
          </span>
        </div>

        {filteredCatches.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-[#d8d2c7] bg-[#faf8f4] p-5 text-sm text-[#6b7280]">
            {catches.length === 0
              ? "Du har inga registrerade fångster ännu."
              : "Det finns inga fångster för det valda året."}
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard
                title="Min bästa Big Five"
                value={stats.bestBigFive}
                onClick={
                  bestBigFiveBreakdown
                    ? () => setBigFiveExpanded((current) => !current)
                    : undefined
                }
              />
              <StatCard
                title="Min bästa Fina Fisken"
                value={stats.bestFineFish}
                onClick={bestFineCatch ? () => onSelectCatch?.(bestFineCatch.id) : undefined}
              />
              <StatCard
                title="Min bästa Gädda"
                value={stats.biggestPike}
                onClick={bestPikeCatch ? () => onSelectCatch?.(bestPikeCatch.id) : undefined}
              />
              <StatCard
                title="Min bästa Abborre"
                value={stats.biggestPerch}
                onClick={bestPerchCatch ? () => onSelectCatch?.(bestPerchCatch.id) : undefined}
              />

              {stats.bestFineFishBySpecies.map((item) => (
                <StatCard
                  key={item.species}
                  title={`Min bästa ${item.species}`}
                  value={item.weight}
                  onClick={
                    bestFineFishBySpeciesCatchMap[item.species]
                      ? () => onSelectCatch?.(bestFineFishBySpeciesCatchMap[item.species].id)
                      : undefined
                  }
                />
              ))}
            </div>

            {bigFiveExpanded && bestBigFiveBreakdown ? (
              <BigFiveBreakdownPanel
                breakdown={bestBigFiveBreakdown}
                onSelectCatch={onSelectCatch}
              />
            ) : null}

            <div className="mt-5 rounded-[22px] border border-[#ddd8cf] bg-[#fffdfb] px-4 py-4">
              <div className="min-w-0">
                <h3 className="text-[1.1rem] font-bold leading-tight text-[#1f2937]">
                  Antal fångade fiskar och kilo fisk!
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Se hur många fiskar du fångat och hur många kilo det blivit under valt år eller alla år.
                </p>

                <div className="mt-3">
                  <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5c4d3f]">
                    {filterBadgeLabel}
                  </span>
                </div>
              </div>

              {stats.speciesAggregateStats.length > 0 ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
                      Antal
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {stats.speciesAggregateStats.map((item) => (
                        <StatCard
                          key={`count-${item.species}`}
                          title={item.species}
                          value={item.count}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
                      Vikt
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {stats.speciesAggregateStats.map((item) => (
                        <StatCard
                          key={`weight-${item.species}`}
                          title={item.species}
                          value={item.totalWeight}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-[#d8d2c7] bg-[#faf8f4] p-5 text-sm text-[#6b7280]">
                  Det finns inga godkända fångster att visa för det valda året.
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}