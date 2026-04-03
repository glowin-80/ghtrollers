"use client";

import { useMemo, useState } from "react";
import { calculateMemberStats } from "@/lib/member-page";
import type { MemberCatch, MemberStats } from "@/types/member-page";

type Props = {
  catches: MemberCatch[];
};

type CatchYearFilter = "all" | string;

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[20px] border border-[#ddd8cf] bg-[#fffdfb] px-3.5 py-3 shadow-sm">
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

export default function StatsGrid({ catches }: Props) {
  const currentSwedenYear = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
    });

    return formatter.format(new Date());
  }, []);

  const [selectedYear, setSelectedYear] = useState<CatchYearFilter>("all");

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
              onChange={setSelectedYear}
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
              <StatCard title="Min bästa Big Five" value={stats.bestBigFive} />
              <StatCard title="Min bästa Fina Fisken" value={stats.bestFineFish} />
              <StatCard title="Min bästa Gädda" value={stats.biggestPike} />
              <StatCard title="Min bästa Abborre" value={stats.biggestPerch} />

              {stats.bestFineFishBySpecies.map((item) => (
                <StatCard
                  key={item.species}
                  title={`Min bästa ${item.species}`}
                  value={item.weight}
                />
              ))}
            </div>

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