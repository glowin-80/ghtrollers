"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatDate,
  formatWeight,
  getCatchReportAnchorId,
  getDisplayFishName,
  getStatusClasses,
  getStatusLabel,
} from "@/lib/member-page";
import {
  getCatchOwnerDisplayName,
  getCatchRegistrarDisplayName,
} from "@/lib/catch-identity";
import type { Member } from "@/types/home";
import type { MemberCatch } from "@/types/member-page";

type MyCatchesSectionProps = {
  catches: MemberCatch[];
  members: Member[];
  targetCatchId?: string | null;
  onTargetHandled?: () => void;
};

type CatchYearFilter = "all" | string;

export default function MyCatchesSection({
  catches,
  members,
  targetCatchId = null,
  onTargetHandled,
}: MyCatchesSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const currentSwedenYear = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
    });

    return formatter.format(new Date());
  }, []);

  const [selectedYear, setSelectedYear] = useState<CatchYearFilter>(currentSwedenYear);
  const [highlightedCatchId, setHighlightedCatchId] = useState<string | null>(null);

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
    if (!targetCatchId) {
      return;
    }

    const targetCatch = catches.find((item) => item.id === targetCatchId);

    if (!targetCatch) {
      onTargetHandled?.();
      return;
    }

    const targetYear = targetCatch.catch_date?.slice(0, 4) || "all";

    const stateTimer = window.setTimeout(() => {
      setSelectedYear(targetYear);
      setHighlightedCatchId(targetCatchId);
    }, 0);

    const sectionTimer = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 40);

    const catchTimer = window.setTimeout(() => {
      const element = document.getElementById(getCatchReportAnchorId(targetCatchId));

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }

      onTargetHandled?.();
    }, 280);

    return () => {
      window.clearTimeout(stateTimer);
      window.clearTimeout(sectionTimer);
      window.clearTimeout(catchTimer);
    };
  }, [targetCatchId, catches, onTargetHandled]);

  useEffect(() => {
    if (!highlightedCatchId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedCatchId(null);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedCatchId]);

  const filteredCatches = useMemo(() => {
    if (selectedYear === "all") {
      return catches;
    }

    return catches.filter((item) => item.catch_date?.startsWith(selectedYear));
  }, [catches, selectedYear]);

  return (
    <section
      ref={sectionRef}
      className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]"
    >
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
            const ownerName = getCatchOwnerDisplayName(item, members);
            const registrarName = getCatchRegistrarDisplayName(item, members);

            return (
              <div
                key={item.id}
                id={getCatchReportAnchorId(item.id)}
                className={[
                  "rounded-[22px] border bg-[#fffdfb] px-4 py-4 shadow-sm transition",
                  isHighlighted
                    ? "border-[#d6c08a] ring-2 ring-[#ead9ab] shadow-[0_10px_24px_rgba(214,192,138,0.24)]"
                    : "border-[#ddd8cf]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[1.65rem] font-bold leading-none text-[#1f2937]">
                      {getDisplayFishName(item)}
                    </div>

                    <div className="mt-2 text-sm leading-6 text-[#6b7280]">
                      {formatWeight(item.weight_g)} • {formatDate(item.catch_date)}
                      {item.is_location_private && !item.location_name
                        ? " • Privat plats"
                        : item.location_name
                          ? ` • ${item.location_name}`
                          : ""}
                    </div>

                    <div className="mt-1 text-sm leading-6 text-[#6b7280]">
                      Fångad av: {ownerName} • Registrerad av: {registrarName}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[#eef6ea] px-3 py-1 text-[#355b2c]">
                        {item.fishing_method || "Ingen metod"}
                      </span>

                      {item.live_scope ? (
                        <span className="rounded-full bg-[#e8eefb] px-3 py-1 text-[#365892]">
                          Live-scope
                        </span>
                      ) : null}

                      {item.caught_abroad ? (
                        <span className="rounded-full bg-[#fff1e6] px-3 py-1 text-[#9a4f1f]">
                          Utomlands
                        </span>
                      ) : null}

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
