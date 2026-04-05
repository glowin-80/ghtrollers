"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  highlightedCatchId?: string | null;
};

type CatchYearFilter = "all" | string;

export default function MyCatchesSection({
  catches,
  highlightedCatchId,
}: MyCatchesSectionProps) {
  const currentSwedenYear = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
    });

    return formatter.format(new Date());
  }, []);

  const [selectedYear, setSelectedYear] =
    useState<CatchYearFilter>(currentSwedenYear);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const availableYears = useMemo(() => {
    const startYear = 2016;
    const endYear = Number(currentSwedenYear);

    const years: string[] = [];

    for (let year = endYear; year >= startYear; year -= 1) {
      years.push(String(year));
    }

    return years;
  }, [currentSwedenYear]);

  useEffect(() => {
    if (!highlightedCatchId) {
      return;
    }

    const targetCatch = catches.find((item) => item.id === highlightedCatchId);

    if (!targetCatch?.catch_date) {
      return;
    }

    const targetYear = targetCatch.catch_date.slice(0, 4);

    if (targetYear) {
      setSelectedYear(targetYear);
    }
  }, [highlightedCatchId, catches]);

  const filteredCatches = useMemo(() => {
    if (selectedYear === "all") {
      return catches;
    }

    return catches.filter((item) => item.catch_date?.startsWith(selectedYear));
  }, [catches, selectedYear]);

  useEffect(() => {
    if (!highlightedCatchId) {
      return;
    }

    const node = cardRefs.current[highlightedCatchId];

    if (!node) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedCatchId, filteredCatches]);

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

        <div className="flex flex-wrap items-center gap-2">
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

          <div className="relative">
            <select
              value={selectedYear === "all" ? currentSwedenYear : selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-full border border-[#d8d2c7] bg-[#f7f4ee] px-4 py-2 pr-10 text-sm font-semibold text-[#4b5563] outline-none transition hover:bg-[#f1ece3] focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
              aria-label="Välj år"
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

      {filteredCatches.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d8d2c7] bg-[#faf8f4] p-5 text-sm text-[#6b7280]">
          {catches.length === 0
            ? "Du har inga registrerade fångster ännu."
            : "Det finns inga fångster för det valda året."}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredCatches.map((item) => {
            const isHighlighted = highlightedCatchId === item.id;

            return (
              <div
                key={item.id}
                ref={(node) => {
                  cardRefs.current[item.id] = node;
                }}
                className={[
                  "rounded-[22px] border px-4 py-4 shadow-sm transition",
                  isHighlighted
                    ? "border-[#d7b75a] bg-[#fff9e9] shadow-[0_10px_20px_rgba(183,141,40,0.16)]"
                    : "border-[#ddd8cf] bg-[#fffdfb]",
                ].join(" ")}
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
                      Fångad av: {item.caught_for} • Registrerad av:{" "}
                      {item.registered_by}
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
            );
          })}
        </div>
      )}
    </section>
  );
}