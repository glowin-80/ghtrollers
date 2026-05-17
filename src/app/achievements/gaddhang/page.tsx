"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchActiveAchievementMembers, type AchievementMemberSummary } from "@/lib/member-service";
import {
  achievementCategories,
  getAchievementCategory,
  getAchievementProgressValue,
  getCurrentAchievementByValue,
} from "@/lib/achievements";

function formatAchievementCategoryOptionLabel(category: {
  label: string;
  status: string;
  comingSoonLabel?: string;
}) {
  if (category.status !== "coming_soon") {
    return category.label;
  }

  return `${category.label} — ${category.comingSoonLabel ?? "Coming soon"}`;
}

type RankedAchievementMember = AchievementMemberSummary & {
  achievementTitle: string;
  achievementDescription: string;
  achievementImageSrc: string;
  achievementSortOrder: number;
  categoryValue: number;
};


function LockedAchievementBadge({
  size = "md",
  label = "Låst",
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const sizeClass =
    size === "lg" ? "h-20 w-20" : size === "sm" ? "h-14 w-14" : "h-16 w-16";
  const questionClass = size === "lg" ? "h-11 w-11 text-[20px]" : "h-8 w-8 text-[16px]";

  return (
    <div
      aria-label="Achievement"
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#c7b584] bg-[radial-gradient(circle_at_35%_28%,#f8f2df_0%,#d8c38a_24%,#786b52_48%,#202833_100%)] shadow-[0_6px_14px_rgba(18,35,28,0.14),inset_0_1px_0_rgba(255,255,255,0.42)] ring-2 ring-[#324b2f]/20",
        sizeClass,
      ].join(" ")}
    >
      <div className="absolute inset-[6px] rounded-full border border-white/25 bg-black/35" />
      <div
        className={[
          "relative flex items-center justify-center rounded-full border border-[#d8c38a]/75 bg-[#202833]/90 font-black text-[#f5e6b8] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
          questionClass,
        ].join(" ")}
      >
        ?
      </div>
      <div className="absolute bottom-[5px] rounded-full bg-black/45 px-2 py-[1px] text-[8px] font-black uppercase tracking-[0.12em] text-[#f5e6b8]">
        {label}
      </div>
    </div>
  );
}

function AchievementBadgeVisual({
  categoryId,
  imageSrc,
  title,
  size = "md",
}: {
  categoryId: string;
  imageSrc: string;
  title: string;
  size?: "sm" | "md" | "lg";
}) {
  const isWaterBaseline =
    categoryId === "waters" && !imageSrc.startsWith("/Achievments/waters/");

  if (isWaterBaseline) {
    return <LockedAchievementBadge size={size} label="Spanare" />;
  }

  const sizeClass =
    size === "lg" ? "h-20 w-20" : size === "sm" ? "h-14 w-14" : "h-16 w-16";

  return (
    <img
      src={imageSrc}
      alt={title}
      className={["shrink-0 object-contain", sizeClass].join(" ")}
      loading="lazy"
    />
  );
}

function shouldShowMemberOverview(status: string) {
  return status === "active";
}

function formatCategoryValue(categoryId: string, value: number) {
  switch (categoryId) {
    case "waters":
      return value === 1 ? "1 vatten" : `${value} vatten`;
    case "fishing_spots":
      return value === 1 ? "1 fiskeplats" : `${value} fiskeplatser`;
    case "reported_catches":
      return `${value} fångster`;
    default:
      return `${value}`;
  }
}

function formatMemberCount(count: number) {
  if (count === 1) return "1 medlem";
  return `${count} medlemmar`;
}

function getHighestAchievementTitle(members: RankedAchievementMember[]) {
  if (!members.length) return "Ingen nivå ännu";
  return members[0].achievementTitle;
}

export default function GaddhangAchievementsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("reported_catches");
  const [members, setMembers] = useState<RankedAchievementMember[]>([]);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory =
    getAchievementCategory(selectedCategoryId) ?? achievementCategories[0];

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const showMemberOverview = shouldShowMemberOverview(selectedCategory.status);

        if (!showMemberOverview) {
          if (!mounted) return;
          setMembers([]);
          setExpandedMemberId(null);
          setLoading(false);
          return;
        }

        const resolvedMembers = await fetchActiveAchievementMembers();

        if (!mounted) return;

        const rankedMembers: RankedAchievementMember[] = resolvedMembers
          .map((member: AchievementMemberSummary) => {
            const categoryValue = getAchievementProgressValue({
              categoryId: selectedCategoryId,
              catchCount: member.catchCount ?? 0,
              uniqueWaterCount: member.uniqueWaterCount ?? 0,
              fishingSpotCount: member.fishingSpotCount ?? 0,
            });

            const achievement = getCurrentAchievementByValue(
              categoryValue,
              selectedCategoryId
            );

            return {
              ...member,
              categoryValue,
              achievementTitle: achievement?.title ?? "Ingen nivå ännu",
              achievementDescription:
                achievement?.description ??
                "När medlemmen börjar samla framsteg i kategorin visas nivån här.",
              achievementImageSrc:
                achievement?.imageSrc ?? "/Achievments/catch/catchBadge_0.svg",
              achievementSortOrder: achievement?.sortOrder ?? 0,
            };
          })
          .sort((a, b) => {
            if (b.achievementSortOrder !== a.achievementSortOrder) {
              return b.achievementSortOrder - a.achievementSortOrder;
            }
            if (b.categoryValue !== a.categoryValue) {
              return b.categoryValue - a.categoryValue;
            }
            return (a.name || "").localeCompare(b.name || "", "sv");
          });

        setMembers(rankedMembers);
        setExpandedMemberId(null);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Kunde inte ladda Gäddhängs achievements just nu.");
        setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [selectedCategoryId, selectedCategory.status]);

  const liveCategories = useMemo(
    () => achievementCategories.filter((category) => category.status === "active"),
    []
  );

  const upcomingCategories = useMemo(
    () =>
      achievementCategories.filter(
        (category) => category.status === "coming_soon"
      ),
    []
  );

  const totalCategoryValue = useMemo(
    () => members.reduce((sum, member) => sum + member.categoryValue, 0),
    [members]
  );

  const topMember = members[0] ?? null;

  return (
    <main className="px-4 pb-8 pt-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/achievements"
              className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[#d8d2c7] bg-[#fcfbf8] px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#f8f5ef]"
            >
              Mina achievements
            </Link>

            <div className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#324b2f] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(50,75,47,0.18)]">
              Gäddhängs achievements
            </div>
          </div>

          <div className="mt-4">
            <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
              Gäddhäng
            </div>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight text-[#1f2937] sm:text-[2.4rem]">
              Gäddhängs achievements
            </h1>
            <p className="mt-3 max-w-3xl text-[1rem] leading-8 text-[#667085]">
              Här ser du hur aktiva medlemmar ligger till i den valda
              achievement-kategorin. Detta är helt separat från tävlingen, Big
              Five, roller och medlemsnivåer.
            </p>
          </div>
        </section>

        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Kategori
              </div>
              <h2 className="mt-2 text-[1.5rem] font-bold text-[#1f2937]">
                Välj achievement-kategori
              </h2>
            </div>

            <div className="w-full sm:max-w-[320px]">
              <label htmlFor="gaddhang-achievement-category" className="sr-only">
                Välj achievement-kategori
              </label>
              <select
                id="gaddhang-achievement-category"
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
                className="h-[48px] w-full rounded-full border border-[#d8d2c7] bg-[#fcfbf8] px-4 text-sm font-semibold text-[#374151] shadow-[0_4px_10px_rgba(0,0,0,0.04)] outline-none transition focus:border-[#cab98f]"
              >
                {achievementCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {formatAchievementCategoryOptionLabel(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Vald kategori
              </div>
              <div className="mt-2 text-[1.2rem] font-bold text-[#1f2937]">
                {selectedCategory.label}
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6b7280]">
                {selectedCategory.description}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Högsta nivå just nu
              </div>
              {topMember ? (
                <div className="mt-3 flex items-center gap-3">
                  <AchievementBadgeVisual
                    categoryId={selectedCategoryId}
                    imageSrc={topMember.achievementImageSrc}
                    title={topMember.achievementTitle}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-[1rem] font-bold text-[#1f2937]">
                      {topMember.achievementTitle}
                    </div>
                    <div className="mt-1 text-sm text-[#6b7280]">
                      {topMember.name} ·{" "}
                      {formatCategoryValue(selectedCategoryId, topMember.categoryValue)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-[1rem] font-bold text-[#1f2937]">
                  Ingen nivå ännu
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Medlemmar i listan
              </div>
              <div className="mt-2 text-[1.6rem] font-bold leading-none text-[#1f2937]">
                {members.length}
              </div>
              <div className="mt-2 text-sm text-[#6b7280]">
                {formatMemberCount(members.length)}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Total i kategorin
              </div>
              <div className="mt-2 text-[1.6rem] font-bold leading-none text-[#1f2937]">
                {totalCategoryValue}
              </div>
              <div className="mt-2 text-sm text-[#6b7280]">
                {formatCategoryValue(selectedCategoryId, totalCategoryValue)}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Live-kategorier
              </div>
              <div className="mt-2 text-[1.6rem] font-bold leading-none text-[#1f2937]">
                {liveCategories.length}
              </div>
              <div className="mt-2 text-sm text-[#6b7280]">
                Aktiva just nu
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        {!shouldShowMemberOverview(selectedCategory.status) ? (
          <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
            <div className="rounded-[24px] border border-dashed border-[#d8d2c7] bg-[#fbfaf7] px-5 py-10 text-center">
              <div className="text-[1.1rem] font-bold text-[#1f2937]">
                Coming soon
              </div>
              <p className="mt-2 text-sm leading-7 text-[#6b7280]">
                Den här achievement-kategorin är förberedd men ännu inte live.
                När den släpps kommer Gäddhängs ranking och medlemmarnas nivåer
                att visas här.
              </p>
            </div>
          </section>
        ) : (
          <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                  Medlemsöversikt
                </div>
                <h2 className="mt-2 text-[1.5rem] font-bold text-[#1f2937]">
                  Nivåer i {selectedCategory.label}
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-5 text-sm text-[#4b5563]">
                  Laddar Gäddhängs achievements...
                </div>
              ) : null}

              {!loading &&
                members.map((member, index) => {
                  const isExpanded = expandedMemberId === member.id;

                  return (
                    <article
                      key={member.id}
                      className="overflow-hidden rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] shadow-[0_4px_12px_rgba(18,35,28,0.04)]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMemberId((current) =>
                            current === member.id ? null : member.id
                          )
                        }
                        className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-[#faf7f1]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#324b2f] text-sm font-bold text-white shadow-[0_6px_12px_rgba(50,75,47,0.18)]">
                          {index + 1}
                        </div>

                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d8d2c7] bg-[#efe7d7]">
                          {member.profile_image_url ? (
                            <img
                              src={member.profile_image_url}
                              alt={member.name || "Medlem"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-xl">👤</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-[1rem] font-bold leading-tight text-[#1f2937]">
                            {member.name}
                          </div>
                          <div className="mt-1 text-sm font-medium text-[#6b7280]">
                            {member.achievementTitle}
                          </div>
                          <div className="mt-1 text-sm text-[#8b7449]">
                            {formatCategoryValue(
                              selectedCategoryId,
                              member.categoryValue
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <AchievementBadgeVisual
                            categoryId={selectedCategoryId}
                            imageSrc={member.achievementImageSrc}
                            title={member.achievementTitle}
                            size="sm"
                          />
                          <span className="hidden rounded-full border border-[#d8d2c7] bg-white px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#6b7280] sm:inline-flex">
                            {isExpanded ? "Dölj" : "Visa mer"}
                          </span>
                        </div>
                      </button>

                      {isExpanded ? (
                        <div className="border-t border-[#efe7d7] bg-white/70 px-5 py-4">
                          <div className="flex items-start gap-4">
                            <AchievementBadgeVisual
                              categoryId={selectedCategoryId}
                              imageSrc={member.achievementImageSrc}
                              title={member.achievementTitle}
                              size="lg"
                            />

                            <div className="min-w-0">
                              <div className="text-[1rem] font-bold text-[#1f2937]">
                                {member.achievementTitle}
                              </div>
                              <div className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                                Namn: {member.name}
                              </div>
                              <div className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                                {formatCategoryValue(
                                  selectedCategoryId,
                                  member.categoryValue
                                )}
                              </div>
                              <p className="mt-3 text-sm leading-7 text-[#6b7280]">
                                {member.achievementDescription}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}

              {!loading && !members.length ? (
                <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-5 text-sm text-[#4b5563]">
                  Inga medlemmar att visa ännu.
                </div>
              ) : null}
            </div>
          </section>
        )}

        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
          <div>
            <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
              Framåt
            </div>
            <h2 className="mt-2 text-[1.5rem] font-bold text-[#1f2937]">
              Fler kategorier på väg
            </h2>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {upcomingCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-[24px] border border-dashed border-[#d8d2c7] bg-[#fbfaf7] px-4 py-4"
              >
                <div className="text-sm font-bold text-[#1f2937]">
                  {category.label}
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7449]">
                  Coming soon
                </div>
                <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                  Den här kategorin är förberedd för att kunna lyftas in senare.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}