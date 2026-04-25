"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchCurrentMemberProfile, fetchMemberCatchesForMember } from "@/lib/member-service";
import {
  achievementCategories,
  formatAchievementRange,
  getAchievementCategory,
  getAllUnlockedAchievements,
  getRemainingToNextAchievement,
  getResolvedAchievementsByValue,
} from "@/lib/achievements";

function LockedAchievementBadge() {
  return (
    <div
      aria-label="Låst achievement"
      className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#c7b584] bg-[radial-gradient(circle_at_35%_28%,#f8f2df_0%,#d8c38a_24%,#786b52_48%,#202833_100%)] shadow-[0_6px_14px_rgba(18,35,28,0.14),inset_0_1px_0_rgba(255,255,255,0.42)]"
    >
      <div className="absolute inset-[6px] rounded-full border border-white/25 bg-black/35" />
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#d8c38a]/75 bg-[#202833]/90 text-[18px] font-black text-[#f5e6b8] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
        ?
      </div>
      <div className="absolute bottom-[5px] rounded-full bg-black/45 px-2 py-[1px] text-[8px] font-black uppercase tracking-[0.12em] text-[#f5e6b8]">
        Låst
      </div>
    </div>
  );
}

function AchievementBadgeImage({
  imageSrc,
  title,
  unlocked,
}: {
  imageSrc: string;
  title: string;
  unlocked: boolean;
}) {
  if (!unlocked) {
    return <LockedAchievementBadge />;
  }

  return (
    <img
      src={imageSrc}
      alt={title}
      className="h-16 w-16 shrink-0 object-contain"
      loading="lazy"
    />
  );
}

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

        if (!member) {
          setCatchCount(0);
          setLoading(false);
          return;
        }

        const catches = await fetchMemberCatchesForMember(member);

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

  const selectedCategory =
    getAchievementCategory(selectedCategoryId) ?? achievementCategories[0];

  const myUnlockedAchievements = useMemo(
    () => getAllUnlockedAchievements({ catchCount }),
    [catchCount]
  );

  const resolvedAchievements = useMemo(
    () => getResolvedAchievementsByValue(catchCount, selectedCategoryId),
    [catchCount, selectedCategoryId]
  );

  const remainingToNext = useMemo(
    () => getRemainingToNextAchievement(catchCount, selectedCategoryId),
    [catchCount, selectedCategoryId]
  );

  const currentAchievement =
    resolvedAchievements.find((achievement) => achievement.current) ??
    resolvedAchievements[0];

  return (
    <main className="px-4 pb-8 pt-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
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
              <h2 className="mt-2 text-[1.5rem] font-bold text-[#1f2937]">
                Upplåsta märken
              </h2>
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
                    {getAchievementCategory(achievement.categoryId)?.label ??
                      "Achievement"}
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
              <h2 className="mt-2 text-[1.5rem] font-bold text-[#1f2937]">
                Achievement-katalog
              </h2>
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

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr_0.9fr]">
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
                Din nivå
              </div>
              <div className="mt-2 text-[1.2rem] font-bold text-[#1f2937]">
                {loading ? "Laddar..." : currentAchievement?.title ?? "Ingen nivå ännu"}
              </div>
              <p className="mt-2 text-sm leading-7 text-[#6b7280]">
                {loading
                  ? "Vi hämtar dina senaste achievement-data."
                  : currentAchievement?.description ?? "När du börjar samla framsteg visas din nivå här."}
              </p>
              <div className="mt-4 text-sm font-semibold text-[#374151]">
                {selectedCategory.label}: {catchCount}
              </div>
              {remainingToNext ? (
                <div className="mt-2 text-sm text-[#6b7280]">
                  {remainingToNext.remaining} kvar till nästa nivå
                </div>
              ) : (
                <div className="mt-2 text-sm text-[#6b7280]">Du har nått högsta nivån.</div>
              )}
            </div>
          </div>

          {selectedCategory.status === "coming_soon" ? (
            <div className="mt-4 rounded-[24px] border border-dashed border-[#d8d2c7] bg-[#fcfbf8] px-5 py-5 text-sm leading-7 text-[#6b7280]">
              Den här achievement-kategorin kommer i ett senare steg. När den
              blir live kommer dina framsteg att visas här.
            </div>
          ) : null}

          {selectedCategory.status === "active" ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {resolvedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={[
                    "rounded-[24px] border bg-[#fcfbf8] px-4 py-4 transition",
                    achievement.current ? "border-[#cab98f]" : "border-[#e5ddd0]",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-4">
                    <AchievementBadgeImage
                      imageSrc={achievement.imageSrc}
                      title={achievement.title}
                      unlocked={achievement.unlocked}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8b7449]">
                        {achievement.current ? "Nuvarande nivå" : "Achievement"}
                      </div>
                      <div className="mt-1 text-lg font-bold leading-tight text-[#1f2937]">
                        {achievement.title}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#6b7280]">
                    {achievement.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="rounded-full bg-white px-3 py-1 font-semibold text-[#374151]">
                      {formatAchievementRange(
                        achievement.minValue,
                        achievement.maxValue
                      )}
                    </span>

                    <span
                      className={[
                        "rounded-full px-3 py-1 font-semibold",
                        achievement.unlocked
                          ? "bg-[#324b2f] text-white"
                          : "bg-white text-[#6b7280]",
                      ].join(" ")}
                    >
                      {achievement.unlocked ? "Upplåst" : "Ej upplåst"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}