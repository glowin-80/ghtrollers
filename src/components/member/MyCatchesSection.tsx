"use client";

import { useMemo, useState } from "react";
import {
  formatDate,
  formatWeight,
  getDisplayFishName,
  getStatusClasses,
  getStatusLabel,
} from "@/lib/member-page";
import type { MemberCatch } from "@/types/member-page";

type MyCatchesSectionProps = {
  catches: MemberCatch[];
};

type CatchYearFilter = "all" | string;

export default function MyCatchesSection({ catches }: MyCatchesSectionProps) {
  const [selectedYear, setSelectedYear] = useState<CatchYearFilter>("all");

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        catches
          .map((item) => item.catch_date?.slice(0, 4))
          .filter((year): year is string => Boolean(year))
      )
    ).sort((a, b) => Number(b) - Number(a));
  }, [catches]);

  const filteredCatches = useMemo(() => {
    if (selectedYear === "all") {
      return catches;
    }

    return catches.filter((item) => item.catch_date?.startsWith(selectedYear));
  }, [catches, selectedYear]);

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[2rem] font-bold leading-none text-[#1f2937]">
          🎣 Mina fångster
        </h2>

        <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-sm font-semibold text-[#5c4d3f]">
          {filteredCatches.length} st
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
          Filter
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedYear("all")}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              selectedYear === "all"
                ? "bg-[#324b2f] text-white"
                : "border border-[#d8d2c7] bg-[#f7f4ee] text-[#4b5563] hover:bg-[#f1ece3]",
            ].join(" ")}
          >
            Visa allt
          </button>

          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                selectedYear === year
                  ? "bg-[#324b2f] text-white"
                  : "border border-[#d8d2c7] bg-[#f7f4ee] text-[#4b5563] hover:bg-[#f1ece3]",
              ].join(" ")}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {filteredCatches.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d8d2c7] bg-[#faf8f4] p-5 text-sm text-[#6b7280]">
          {catches.length === 0
            ? "Du har inga registrerade fångster ännu."
            : "Det finns inga fångster för det valda året."}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredCatches.map((item) => (
            <div
              key={item.id}
              className="rounded-[22px] border border-[#ddd8cf] bg-[#fffdfb] px-4 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[1.65rem] font-bold leading-none text-[#1f2937]">
                    {getDisplayFishName(item)}
                  </div>

                  <div className="mt-2 text-sm leading-6 text-[#6b7280]">
                    {formatWeight(item.weight_g)} • {formatDate(item.catch_date)}
                    {item.location_name ? ` • ${item.location_name}` : ""}
                  </div>

                  <div className="mt-1 text-sm leading-6 text-[#6b7280]">
                    Fångad av: {item.caught_for} • Registrerad av: {item.registered_by}
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                    item.status
                  )}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
