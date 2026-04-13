"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import HashSectionScroller from "@/components/shared/HashSectionScroller";
import { scrollToSection } from "@/components/header/header-navigation";
import { useHomeData } from "@/hooks/useHomeData";
import {
  buildAllTimeBigFiveLeader,
  buildAllTimeHighlights,
} from "@/lib/home";
import type {
  AllTimeHighlight,
  BigFiveBreakdown,
  LeaderboardFilter,
} from "@/types/home";

const sections: { label: string; value: LeaderboardFilter }[] = [
  { label: "Abborre", value: "abborre" },
  { label: "Gädda", value: "gädda" },
  { label: "Fina fisken", value: "fina" },
  { label: "Big Five", value: "bigfive" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatWeight(filter: LeaderboardFilter, total: number) {
  if (filter === "bigfive") {
    return `${(total / 1000).toFixed(2)} kg`;
  }

  if (total >= 1000) {
    return `${(total / 1000).toFixed(2)} kg`;
  }

  return `${total} g`;
}

function formatWeightFromGrams(weight: number) {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(2)} kg`;
  }

  return `${weight} g`;
}

function formatDate(dateString?: string | null) {
  if (!dateString) {
    return "Saknas";
  }

  return new Intl.DateTimeFormat("sv-SE").format(new Date(dateString));
}

function getSectionId(filter: LeaderboardFilter) {
  return `all-time-${filter}`;
}

function getCardCopy(item: AllTimeHighlight) {
  if (item.filter === "bigfive") {
    return item.bestYear ? `Big Five · ${item.bestYear}` : "Big Five";
  }

  if (item.filter === "fina" && item.detail) {
    return `Fina fisken med en ${item.detail}`;
  }

  return item.title;
}

function BigFiveBreakdownPanel({
  breakdown,
}: {
  breakdown: BigFiveBreakdown;
}) {
  return (
    <div className="mt-4 rounded-[22px] border border-[#dccb97] bg-white/72 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">
          Underlag för Big Five
        </div>
        <div className="text-[0.78rem] font-semibold text-[#6c5b3d]">
          Total: {formatWeightFromGrams(breakdown.total)}
        </div>
      </div>

      <div className="space-y-2">
        {breakdown.items.map((item) => (
          <div
            key={item.catchId}
            className="rounded-[16px] border border-[#eadfbe] bg-[#fffdf7] px-3 py-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[0.95rem] font-bold leading-tight text-[#1f2937]">
                  {item.fishLabel}
                </div>
                <div className="mt-1 text-[0.8rem] text-[#6b7280]">
                  {formatDate(item.catchDate)}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[0.92rem] font-bold leading-tight text-[#1f2937]">
                  {item.usesMultiplier
                    ? `${formatWeightFromGrams(item.originalWeight)} ×4`
                    : formatWeightFromGrams(item.originalWeight)}
                </div>
                <div className="mt-1 text-[0.78rem] font-semibold text-[#7a6540]">
                  {item.usesMultiplier
                    ? `Räknas som ${formatWeightFromGrams(item.adjustedWeight)}`
                    : "Ingen justering"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyAllTimeCard({ filter }: { filter: LeaderboardFilter }) {
  const titleMap: Record<LeaderboardFilter, string> = {
    bigfive: "Big Five",
    abborre: "Abborre",
    gädda: "Gädda",
    fina: "Fina fisken",
  };

  return (
    <section id={getSectionId(filter)} className="scroll-mt-[360px]">
      <div className="rounded-[30px] border border-dashed border-[#d8d2c7] bg-[#fcfbf8] px-5 py-6 shadow-[0_10px_24px_rgba(18,35,28,0.05)] sm:px-6">
        <div className="text-[0.92rem] font-medium tracking-wide text-[#74685a]">
          {titleMap[filter]}
        </div>
        <h2 className="mt-2 text-[1.75rem] font-bold leading-none text-[#1f2937] sm:text-[1.95rem]">
          Ingen highscore ännu
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280]">
          Så fort det finns godkända catches för{" "}
          {titleMap[filter].toLowerCase()} i databasen visas rekordet här.
        </p>
      </div>
    </section>
  );
}

function AllTimeCard({
  item,
  profileImage,
  bigFiveBreakdown,
  isExpanded,
  onToggleExpanded,
  onImageClick,
}: {
  item: AllTimeHighlight;
  profileImage: string | null;
  bigFiveBreakdown?: BigFiveBreakdown;
  isExpanded: boolean;
  onToggleExpanded?: () => void;
  onImageClick: (imageUrl: string) => void;
}) {
  const isBigFiveCard =
    item.filter === "bigfive" && bigFiveBreakdown && onToggleExpanded;

  return (
    <section id={getSectionId(item.filter)} className="scroll-mt-[360px]">
      <div className="relative overflow-visible rounded-[30px] border border-[#d8d2c7] bg-[#fcfbf8] shadow-[0_12px_36px_rgba(18,35,28,0.08)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[170px] rounded-t-[30px] bg-[radial-gradient(circle_at_top_left,rgba(228,209,165,0.45),transparent_42%),linear-gradient(180deg,rgba(244,236,221,0.78)_0%,rgba(252,251,248,0)_100%)]" />

        <div className="relative px-5 pb-5 pt-7 sm:px-6 sm:pt-8">
          <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
            <div className="relative">
              <div className="absolute inset-0 scale-110 rounded-full bg-[#e5d3a3]/35 blur-xl" />

              <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[4px] border-[#d6bf83] bg-gradient-to-br from-[#31492d] to-[#1f2b1d] shadow-[0_16px_30px_rgba(0,0,0,0.16)] sm:h-28 sm:w-28">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={item.winnerName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#e5d3a3] sm:text-4xl">
                    {getInitials(item.winnerName)}
                  </span>
                )}
              </div>

              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#d8d2c7] bg-[#f2ede5] px-3 py-1 text-xs font-semibold text-[#5c4d3f] shadow-[0_6px_14px_rgba(0,0,0,0.08)]">
                Rekordhållare
              </div>
            </div>
          </div>

          <div className="pl-[108px] sm:pl-[126px]">
            <div className="flex min-h-[136px] items-start gap-3 sm:min-h-[150px]">
              <div className="min-w-0 flex-1">
                <h1 className="text-[1.95rem] font-bold leading-[0.94] text-[#1f2937] sm:text-[2.15rem]">
                  {item.winnerName}
                </h1>

                <div className="mt-2 text-[1.2rem] font-medium leading-tight text-[#74685a] sm:text-[1.35rem]">
                  {getCardCopy(item)}
                </div>

                {isBigFiveCard ? (
                  <button
                    type="button"
                    onClick={onToggleExpanded}
                    className="mt-3 inline-flex rounded-full border border-[#d8d2c7] bg-white px-3 py-1.5 text-[0.82rem] font-semibold text-[#5c4d3f] shadow-[0_4px_10px_rgba(0,0,0,0.04)] transition hover:bg-[#f9f7f3]"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? "Dölj underlag" : "Visa underlag"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="pointer-events-none relative">
              <div className="h-px bg-gradient-to-r from-transparent via-[#d6c08a] to-transparent" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcfbf8] px-3 text-base text-[#c8a85c]">
                ✦
              </div>
            </div>
          </div>

          {item.catchImageUrl ? (
            <button
              type="button"
              onClick={() => onImageClick(item.catchImageUrl as string)}
              className="mt-8 block w-full overflow-hidden rounded-[24px] border border-[#e5ddd0] bg-[#fffdf9] text-left shadow-[0_8px_18px_rgba(18,35,28,0.06)] transition hover:brightness-[1.02]"
              aria-label={`Öppna fångstbild för ${item.winnerName}`}
            >
              <img
                src={item.catchImageUrl}
                alt={`Fångstbild för ${item.winnerName}`}
                className="h-56 w-full object-cover sm:h-72"
                loading="lazy"
                decoding="async"
              />
            </button>
          ) : null}

          {isBigFiveCard && isExpanded ? (
            <BigFiveBreakdownPanel breakdown={bigFiveBreakdown} />
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-[#e5ddd0] bg-white/82 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:col-span-2">
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Resultat
              </div>
              <div className="mt-2 text-[1.5rem] font-bold leading-none text-[#1f2937]">
                {formatWeight(item.filter, item.total)}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#e5ddd0] bg-white/82 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:col-span-2">
              <div className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Datum
              </div>
              <div className="mt-2 text-[1.02rem] font-semibold leading-snug text-[#374151]">
                {formatDate(item.catchDate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AllTimeHighPage() {
  const { approvedCatches, members } = useHomeData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedBigFive, setExpandedBigFive] = useState(false);

  const allTimeHighlights = useMemo(() => {
    return buildAllTimeHighlights(approvedCatches, members);
  }, [approvedCatches, members]);

  const allTimeBigFiveLeader = useMemo(() => {
    return buildAllTimeBigFiveLeader(approvedCatches, members);
  }, [approvedCatches, members]);

  const memberImageMap = useMemo(() => {
    return members.reduce<Record<string, string | null>>((acc, member) => {
      if (member.id) {
        acc[member.id] = member.profile_image_url || null;
      }

      if (member.name) {
        acc[member.name] = member.profile_image_url || null;
      }

      return acc;
    }, {});
  }, [members]);

  const highlightMap = useMemo(() => {
    return allTimeHighlights.reduce<
      Partial<Record<LeaderboardFilter, AllTimeHighlight>>
    >((acc, item) => {
      acc[item.filter] = item;
      return acc;
    }, {});
  }, [allTimeHighlights]);

  return (
    <>
      <HashSectionScroller watchValues={[allTimeHighlights.length]} />

      <main className="px-4 pb-10 pt-4">
        <div className="mx-auto max-w-5xl">
          <section className="rounded-[30px] border border-[#d8d2c7] bg-[#fcfbf8] p-5 shadow-[0_12px_30px_rgba(18,35,28,0.08)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-[0.95rem] font-medium tracking-wide text-[#74685a]">
                  🏅 Historiska rekord
                </div>
                <h1 className="mt-2 text-[2rem] font-bold leading-none text-[#1f2937] sm:text-[2.3rem]">
                  All-time-high
                </h1>
              </div>

              <Link
                href="/#leaderboard-section"
                className="inline-flex h-[46px] shrink-0 items-center justify-center rounded-full border border-[#d8d2c7] bg-white px-4 text-sm font-semibold text-[#374151] shadow-[0_4px_10px_rgba(0,0,0,0.04)] transition hover:bg-[#f9f7f3]"
              >
                Till leaderboard
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1">
              {sections.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    const sectionId = getSectionId(item.value);
                    window.history.replaceState(null, "", `#${sectionId}`);
                    scrollToSection(sectionId);
                  }}
                  className="shrink-0 rounded-full border border-[#d8d2c7] bg-[#f7f4ee] px-3.5 py-2 text-sm font-semibold text-[#4b5563] transition hover:bg-[#f1ece3]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-6 space-y-6">
            {sections.map((section) => {
              const highlight = highlightMap[section.value];

              if (!highlight) {
                return <EmptyAllTimeCard key={section.value} filter={section.value} />;
              }

              return (
                <AllTimeCard
                  key={section.value}
                  item={highlight}
                  profileImage={memberImageMap[highlight.identityKey || highlight.winnerName] || null}
                  bigFiveBreakdown={
                    section.value === "bigfive"
                      ? allTimeBigFiveLeader?.breakdown
                      : undefined
                  }
                  isExpanded={section.value === "bigfive" ? expandedBigFive : false}
                  onToggleExpanded={
                    section.value === "bigfive"
                      ? () => setExpandedBigFive((current) => !current)
                      : undefined
                  }
                  onImageClick={setSelectedImage}
                />
              );
            })}
          </div>

          {selectedImage ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <img
                src={selectedImage}
                alt="Förstorad fångstbild"
                className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
                decoding="async"
              />
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}