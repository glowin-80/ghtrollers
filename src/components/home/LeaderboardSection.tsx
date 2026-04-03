"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import type {
  AllTimeHighlight,
  LeaderboardEntry,
  LeaderboardFilter,
  Member,
} from "@/types/home";

type LeaderboardSectionProps = {
  leaderboard: LeaderboardEntry[];
  members: Member[];
  filter: LeaderboardFilter;
  onFilterChange: (value: LeaderboardFilter) => void;
  selectedYear: string;
  availableYears: string[];
  onYearChange: (value: string) => void;
  allTimeHighlights: AllTimeHighlight[];
};

const filters: { label: string; value: LeaderboardFilter }[] = [
  { label: "Big Five", value: "bigfive" },
  { label: "Abborre", value: "abborre" },
  { label: "Gädda", value: "gädda" },
  { label: "Fina fisken", value: "fina" },
];

function formatWeight(filter: LeaderboardFilter, total: number) {
  if (filter === "bigfive") {
    return `${(total / 1000).toFixed(2)} kg`;
  }

  if (total >= 1000) {
    return `${(total / 1000).toFixed(2)} kg`;
  }

  return `${total} g`;
}

function getHeadline(filter: LeaderboardFilter) {
  if (filter === "bigfive") return "Big Five · Topp 3";
  if (filter === "abborre") return "Abborre · Topp 3";
  if (filter === "gädda") return "Gädda · Topp 3";
  return "Fina fisken · Topp 3";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getPlacementCopy(index: number) {
  if (index === 0) return "Leder just nu";
  if (index === 1) return "Jagar förstaplatsen";
  return "Håller pallplats";
}

function getPlacementBadge(index: number) {
  if (index === 0) {
    return {
      medal: "👑",
      label: "1:a plats",
      badgeClass:
        "bg-[#4c3b17] text-[#f8e7a3] border border-[#6a5220]",
      rowClass:
        "border-[#d7b75a] bg-gradient-to-r from-[#fffaf0] via-[#fff6dd] to-[#f5e7b8] shadow-[0_12px_24px_rgba(183,141,40,0.14)]",
      avatarClass: "border-[#e5cb79] ring-[#f3e5ae]/70 bg-white",
      resultClass: "text-[#1f2937]",
    };
  }

  if (index === 1) {
    return {
      medal: "🥈",
      label: "2:a plats",
      badgeClass:
        "bg-[#eef2f6] text-[#495563] border border-[#d8e0e8]",
      rowClass:
        "border-[#dde4ea] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]",
      avatarClass: "border-[#cfd7df] ring-[#edf1f4] bg-[#f9fafb]",
      resultClass: "text-[#111827]",
    };
  }

  return {
    medal: "🥉",
    label: "3:e plats",
    badgeClass: "bg-[#f4ece5] text-[#7a5633] border border-[#e3d3c5]",
    rowClass:
      "border-[#e6ddd5] bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]",
    avatarClass: "border-[#d8b08d] ring-[#f3e8df] bg-[#fbfaf8]",
    resultClass: "text-[#111827]",
  };
}

function LeaderboardRow({
  entry,
  index,
  filter,
  imageUrl,
}: {
  entry: LeaderboardEntry;
  index: number;
  filter: LeaderboardFilter;
  imageUrl: string | null;
}) {
  const styles = getPlacementBadge(index);
  const secondaryText =
    filter === "fina" && entry.detail
      ? `${entry.detail} · ${getPlacementCopy(index)}`
      : getPlacementCopy(index);

  return (
    <div
      className={[
        "rounded-[22px] border px-3.5 py-3.5 transition",
        "sm:px-4 sm:py-4",
        styles.rowClass,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <div
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold",
              styles.badgeClass,
            ].join(" ")}
          >
            <span>{styles.medal}</span>
            <span>{styles.label}</span>
          </div>
        </div>

        <div className="ml-auto shrink-0 text-right">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
            Resultat
          </div>
          <div
            className={[
              "mt-0.5 text-[1.15rem] font-extrabold leading-none tracking-tight sm:text-[1.25rem]",
              styles.resultClass,
            ].join(" ")}
          >
            {formatWeight(filter, entry.total)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative shrink-0">
          <div
            className={[
              "flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 ring-2",
              styles.avatarClass,
            ].join(" ")}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={entry.name}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="text-sm font-bold text-[#5b6470]">
                {getInitials(entry.name)}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[1.35rem] font-extrabold leading-none text-[#1f2937] sm:text-[1.5rem]">
            {entry.name}
          </div>
          <div className="mt-1 text-sm text-[#6b7280]">{secondaryText}</div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardSectionComponent({
  leaderboard,
  members,
  filter,
  onFilterChange,
  selectedYear,
  availableYears,
  onYearChange,
  allTimeHighlights,
}: LeaderboardSectionProps) {
  const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);

  const memberImageMap = useMemo(() => {
    return members.reduce<Record<string, string | null>>((acc, member) => {
      acc[member.name] = member.profile_image_url || null;
      return acc;
    }, {});
  }, [members]);

  const hasAnyAllTimeData = allTimeHighlights.length > 0;

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-4 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[20px]">🏆</span>
        <h2 className="text-[1.95rem] font-bold leading-none text-[#1f2937]">
          Leaderboard
        </h2>
      </div>

      <div className="mb-3 flex items-center justify-start">
        <div className="relative shrink-0">
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="rounded-full border border-[#d8d2c7] bg-[#f7f4ee] px-4 py-2 pr-10 text-sm font-semibold text-[#4b5563] outline-none transition hover:bg-[#f1ece3] focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            aria-label="Välj år för leaderboard"
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

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => {
          const isActive = filter === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={[
                "shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-[#1d2f7a] text-white shadow-[0_8px_16px_rgba(29,47,122,0.22)]"
                  : "border border-[#e2e7ea] bg-[#f2f5f6] text-[#374151] hover:bg-[#e8edef]",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-[24px] border border-[#e5e7eb] bg-[#fcfcfb] p-3 shadow-inner sm:p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[1.65rem] font-bold leading-none text-[#1f2937] sm:text-[1.85rem]">
              {getHeadline(filter)}
            </h3>
            <p className="mt-1 text-sm text-[#6b7280]">Topp 3 för {selectedYear}.</p>
          </div>

          <span className="shrink-0 rounded-full bg-[#f2ede5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5c4d3f]">
            {selectedYear}
          </span>
        </div>

        {topThree.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[#d8d2c7] bg-[#fbfaf7] px-4 py-6 text-sm text-[#6b7280]">
            Inga godkända fångster ännu för {selectedYear}.
          </div>
        ) : (
          <div className="space-y-3">
            {topThree.map((entry, index) => (
              <LeaderboardRow
                key={`${entry.name}-${index}`}
                entry={entry}
                index={index}
                filter={filter}
                imageUrl={memberImageMap[entry.name] || null}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link
          href="/all-time-high"
          className="flex min-h-[56px] w-full items-center justify-center rounded-[20px] border-[2.5px] border-[#d7b75a] bg-[linear-gradient(180deg,#fff8e7_0%,#f5ecd0_100%)] px-4 py-3 text-[1rem] font-bold text-[#4c3b17] shadow-[0_10px_22px_rgba(183,141,40,0.14),inset_0_1px_0_rgba(255,255,255,0.75)] transition hover:brightness-[1.02]"
        >
          {hasAnyAllTimeData ? "Öppna All-time-high" : "All-time-high"}
        </Link>
      </div>
    </section>
  );
}

const LeaderboardSection = memo(LeaderboardSectionComponent);

export default LeaderboardSection;