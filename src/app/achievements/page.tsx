"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchCurrentMemberProfile, fetchMemberCatchesByName } from "@/lib/member-service";
import {
  achievementCategories,
  formatAchievementRange,
  getAchievementCategory,
  getAllUnlockedAchievements,
  getRemainingToNextAchievement,
  getResolvedAchievementsByValue,
} from "@/lib/achievements";

export default function AchievementsPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("reported_catches");
  const [memberName, setMemberName] = useState<string | null>(null);
  const [catchCount, setCatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const member = await fetchCurrentMemberProfile();

        if (!mounted) return;

        setMemberName(member?.name ?? null);

        if (!member?.name) {
          setCatchCount(0);
          setLoading(false);
          return;
        }

        const catches = await fetchMemberCatchesByName(member.name);

        if (!mounted) return;

        setCatchCount(catches.length);
        setLoading(false);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError("Kunde inte ladda achievements just nu.");
        setLoading(false);
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedCategory = getAchievementCategory(selectedCategoryId) ?? achievementCategories[0];
  const myUnlockedAchievements = useMemo(() => getAllUnlockedAchievements({ catchCount }), [catchCount]);
  const resolvedAchievements = useMemo(
    () => getResolvedAchievementsByValue(catchCount, selectedCategoryId),
    [catchCount, selectedCategoryId]
  );
  const remainingToNext = useMemo(
    () => getRemainingToNextAchievement(catchCount, selectedCategoryId),
    [catchCount, selectedCategoryId]
  );

  return (
    <main className="px-4 pb-8 pt-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-[#324b2f] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(50,75,47,0.18)]">
                Mina achievements
              </div>
              <Link
                href="/achievements/gaddhang"
                className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[#d8d2c7] bg-[#fcfbf8] px-4 text-sm font-semibold text-[#374151] transition hover:bg-[#f8f5ef]"
              >
                Gäddhängs achievements
              </Link>
            </div>

            <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
              Achievements
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-[2rem] font-bold leading-tight text-[#1f2937] sm:text-[2.4rem]">
              Rapporterad Fångst
            </h1>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Nuvarande nivå
              </div>
              <div className="mt-2 text-[1.1rem] font-bold text-[#1f2937]">
                {resolvedAchievements.find((achievement) => achievement.current)?.title ?? "Fiskesugen"}
              </div>
            </div>
            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Rapporterade fångster
              </div>
              <div className="mt-2 text-[2rem] font-bold leading-none text-[#1f2937]">{catchCount}</div>
              <div className="mt-2 text-sm text-[#6b7280]">
                {remainingToNext
                  ? `${remainingToNext.remaining} fångster kvar till ${remainingToNext.title}`
                  : "Du har nått högsta nivån i denna kategori."}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!memberName && !loading ? (
            <div className="mt-4 rounded-[20px] border border-[#e5ddd0] bg-[#fcfbf8] px-4 py-4 text-sm text-[#6b7280]">
              Logga in för att se dina personliga achievements.
            </div>
          ) : null}
        </section>

        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Mina achievements
              </div>
              <h2 className="mt-2 text-[1.5rem] font-bold text-[#1f2937]">Upplåsta märken</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myUnlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-4 rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-4 py-4"
              >
                <img
                  src={achievement.imageSrc}
                  alt={achievement.title}
                  className="h-16 w-16 shrink-0 object-contain"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8b7449]">
                    {getAchievementCategory(achievement.categoryId)?.label ?? "Achievement"}
                  </div>
                  <div className="mt-1 text-lg font-bold leading-tight text-[#1f2937]">
                    {achievement.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                Kategori
              </div>
              <h2 className="mt-2 text-[1.5rem] font-bold text-[#1f2937]">Achievement-katalog</h2>
            </div>

            <div className="w-full sm:max-w-[320px]">
              <label htmlFor="achievement-category" className="sr-only">
                Välj achievement-kategori
              </label>
              <select
                id="achievement-category"
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

          <div className="mt-5 rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
            <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
              Vald kategori
            </div>
            <div className="mt-2 text-[1.2rem] font-bold text-[#1f2937]">{selectedCategory.label}</div>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6b7280]">
              {selectedCategory.description}
            </p>
          </div>

          {selectedCategory.status === "coming_soon" ? (
            <div className="mt-5 rounded-[24px] border border-dashed border-[#d8d2c7] bg-[#fbfaf7] px-5 py-10 text-center">
              <div className="text-[1.1rem] font-bold text-[#1f2937]">Coming soon</div>
              <p className="mt-2 text-sm leading-7 text-[#6b7280]">
                Den här achievement-kategorin kommer i ett senare steg. När den släpps kommer både
                dina upplåsta märken och hela katalogen att visas här.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {resolvedAchievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className={[
                    "overflow-hidden rounded-[26px] border bg-[#fcfbf8] shadow-[0_6px_18px_rgba(18,35,28,0.05)]",
                    achievement.current ? "border-[#cab98f]" : "border-[#e5ddd0]",
                  ].join(" ")}
                >
                  <div className="relative flex items-center justify-center px-4 pt-5">
                    <img
                      src={achievement.imageSrc}
                      alt={achievement.title}
                      className="h-[150px] w-[150px] object-contain"
                      loading="lazy"
                    />
                    {!achievement.unlocked ? (
                      <div className="absolute inset-0 bg-black/90" aria-hidden="true" />
                    ) : null}
                  </div>

                  <div className="px-5 pb-5 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[1.15rem] font-bold leading-tight text-[#1f2937]">
                        {achievement.title}
                      </div>
                      {achievement.current ? (
                        <span className="rounded-full bg-[#324b2f] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white">
                          Du är här
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">
                      {formatAchievementRange(achievement.minValue, achievement.maxValue)}
                    </div>

                    <p className="mt-3 text-sm leading-7 text-[#6b7280]">{achievement.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}