"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  achievementCategories,
  getAchievementCategory,
  getCurrentAchievementByValue,
} from "@/lib/achievements";
import {
  fetchActiveAchievementMembers,
  type AchievementMemberSummary,
} from "@/lib/member-service";

type RankedAchievementMember = AchievementMemberSummary & {
  achievementTitle: string;
  achievementDescription: string;
  achievementImageSrc: string;
  achievementSortOrder: number;
  categoryValue: number;
};

function formatCategoryValue(categoryId: string, value: number) {
  switch (categoryId) {
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

        if (selectedCategory.status === "coming_soon") {
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
            let categoryValue = 0;

            switch (selectedCategoryId) {
              case "reported_catches":
                categoryValue = member.catchCount ?? 0;
                break;
              default:
                categoryValue = 0;
            }

            const achievement = getCurrentAchievementByValue(
              categoryValue,
              selectedCategoryId
            );

            return {
              ...member,
              categoryValue,
              achievementTitle: achievement?.title ?? "Fiskesugen",
              achievementDescription: achievement?.description ?? "",
              achievementImageSrc:
                achievement?.imageSrc ?? "/Achievments/catch/catchBadge_1.png",
              achievementSortOrder: achievement?.sortOrder ?? 1,
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
    () =>
      achievementCategories.filter((category) => category.status === "active"),
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
                    {category.status === "coming_soon"
                      ? `${category.label} — Coming soon`
                      : category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4 sm:col-span-3">
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
                Medlemmar i listan
              </div>
              <div className="mt-2 text-[1.1rem] font-bold text-[#1f2937]">
                {formatMemberCount(members.length)}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Högsta nivå just nu
              </div>
              <div className="mt-2 text-[1.1rem] font-bold text-[#1f2937]">
                {getHighestAchievementTitle(members)}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Total i kategorin
              </div>
              <div className="mt-2 text-[1.1rem] font-bold text-[#1f2937]">
                {formatCategoryValue(selectedCategoryId, totalCategoryValue)}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        {selectedCategory.status === "coming_soon" ? (
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

              <div className="hidden text-sm text-[#6b7280] sm:block">
                {liveCategories.length} livekategori
                {liveCategories.length === 1 ? "" : "er"}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-5 text-sm text-[#4b5563]">
                  Laddar Gäddhängs achievements...
                </div>
              ) : null}

              {!loading &&
                members.map((member) => (
                  <details
                    key={member.id}
                    className="group overflow-hidden rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8]"
                    open={expandedMemberId === member.id}
                    onToggle={(event) => {
                      const nextOpen = (event.currentTarget as HTMLDetailsElement)
                        .open;
                      setExpandedMemberId(nextOpen ? member.id : null);
                    }}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#324b2f] text-sm font-bold text-white">
                        {members.findIndex((row) => row.id === member.id) + 1}
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
                        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8b7449]">
                          Namn: {member.name}
                        </div>
                        <div className="mt-1 text-[1.08rem] font-bold leading-tight text-[#1f2937]">
                          {member.achievementTitle}
                        </div>
                        <div className="mt-1 text-sm text-[#6b7280]">
                          {formatCategoryValue(
                            selectedCategoryId,
                            member.categoryValue
                          )}
                        </div>
                      </div>

                      <img
                        src={member.achievementImageSrc}
                        alt={member.achievementTitle}
                        className="h-14 w-14 shrink-0 object-contain"
                        loading="lazy"
                      />
                    </summary>

                    <div className="border-t border-[#efe7d7] px-5 py-4 text-sm leading-7 text-[#6b7280]">
                      <div className="flex items-start gap-4">
                        <img
                          src={member.achievementImageSrc}
                          alt={member.achievementTitle}
                          className="h-20 w-20 shrink-0 object-contain"
                          loading="lazy"
                        />

                        <div className="min-w-0">
                          <div className="font-semibold text-[#1f2937]">
                            {member.achievementTitle}
                          </div>
                          <div className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                            {formatCategoryValue(
                              selectedCategoryId,
                              member.categoryValue
                            )}
                          </div>
                          <p className="mt-2">{member.achievementDescription}</p>
                        </div>
                      </div>
                    </div>
                  </details>
                ))}

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