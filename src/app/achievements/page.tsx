"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMemberPageData } from "@/hooks/useMemberPageData";
import {
  catchAchievements,
  getCatchAchievement,
  getNextCatchAchievement,
  getRemainingCatchesToNextAchievement,
  hasUnlockedCatchAchievement,
} from "@/lib/achievements";

function AchievementCard({
  title,
  imageUrl,
  description,
  requirementLabel,
  unlocked,
  isCurrent,
}: {
  title: string;
  imageUrl: string;
  description: string;
  requirementLabel: string;
  unlocked: boolean;
  isCurrent: boolean;
}) {
  return (
    <article
      className={[
        "rounded-[28px] border bg-white/95 p-4 shadow-[0_10px_28px_rgba(18,35,28,0.06)] transition",
        isCurrent ? "border-[#ccb173] ring-2 ring-[#e7d8ac]" : "border-[#d8d2c7]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">
            Rapporterad fångst
          </div>
          <h2 className="mt-1 text-[1.35rem] font-bold leading-tight text-[#1f2937]">
            {title}
          </h2>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.1em]",
            unlocked
              ? "bg-[#eef3eb] text-[#466143]"
              : "bg-[#f2ede5] text-[#6c5b3d]",
          ].join(" ")}
        >
          {unlocked ? "Upplåst" : "Låst"}
        </span>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="relative w-full max-w-[220px]">
          <img
            src={imageUrl}
            alt={title}
            className="mx-auto h-auto w-full object-contain"
            draggable={false}
          />

          {!unlocked ? (
            <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-black/90" />
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-[#ece4d7] bg-[#fffdf9] px-4 py-3">
        <div className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
          Krav
        </div>
        <div className="mt-1 text-sm font-semibold text-[#3f3a33]">{requirementLabel}</div>
        <p className="mt-3 text-sm leading-6 text-[#6b7280]">{description}</p>
      </div>
    </article>
  );
}

export default function AchievementsPage() {
  const { pageLoading, catchesLoading, member, catches, error } = useMemberPageData();

  const catchCount = catches.length;
  const currentAchievement = useMemo(() => getCatchAchievement(catchCount), [catchCount]);
  const nextAchievement = useMemo(() => getNextCatchAchievement(catchCount), [catchCount]);
  const remainingToNext = useMemo(
    () => getRemainingCatchesToNextAchievement(catchCount),
    [catchCount]
  );

  if (pageLoading) {
    return (
      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[26px] border border-[#d8d2c7] bg-white/95 px-5 py-5 text-sm text-[#4b5563] shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            Laddar achievements...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[26px] border border-red-200 bg-white/95 px-5 py-5 text-sm text-red-700 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-4xl rounded-[26px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
          <h1 className="text-2xl font-bold text-[#1f2937]">🏆 Achievements</h1>
          <p className="mt-3 text-sm text-[#6b7280]">
            Logga in för att se dina upplåsta achievements och vad som väntar härnäst.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex rounded-full bg-[#324b2f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
            >
              Till startsidan
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
            >
              Logga in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!member.is_active) {
    return (
      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-5xl rounded-[26px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
          <h1 className="text-2xl font-bold text-[#1f2937]">🏆 Achievements</h1>
          <p className="mt-3 text-sm text-[#6b7280]">
            Din medlemsansökan är inte aktiv ännu. När du fått tillgång kan du se och låsa upp achievements här.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pb-8 pt-4">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_10px_28px_rgba(18,35,28,0.06)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">
                Achievements
              </div>
              <h1 className="mt-1 text-[2rem] font-bold leading-tight text-[#1f2937] sm:text-[2.35rem]">
                Rapporterad Fångst
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                En helt egen kategori för lite humor, progression och viljan att rapportera fler fångster — även när de inte avgör tävlingen. Detta är helt separat från tävlingsresultat, roller och medlemsnivåer.
              </p>
            </div>

            <div className="grid gap-2 sm:min-w-[280px]">
              <div className="rounded-[22px] border border-[#ece4d7] bg-[#fffdf9] px-4 py-3">
                <div className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
                  Nuvarande nivå
                </div>
                <div className="mt-1 text-lg font-bold text-[#1f2937]">{currentAchievement.title}</div>
              </div>
              <div className="rounded-[22px] border border-[#ece4d7] bg-[#fffdf9] px-4 py-3">
                <div className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
                  Rapporterade fångster
                </div>
                <div className="mt-1 text-lg font-bold text-[#1f2937]">{catchesLoading ? "Laddar..." : catchCount}</div>
                <div className="mt-1 text-sm text-[#6b7280]">
                  {nextAchievement
                    ? `${remainingToNext} fångster kvar till ${nextAchievement.title}`
                    : "Du har låst upp högsta nivån."}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {catchAchievements.map((achievement) => {
            const unlocked = hasUnlockedCatchAchievement(catchCount, achievement);
            const requirementLabel = achievement.maxCount
              ? `${achievement.minCount}–${achievement.maxCount} fångster`
              : `${achievement.minCount}+ fångster`;

            return (
              <AchievementCard
                key={achievement.id}
                title={achievement.title}
                imageUrl={achievement.badgeImageUrl}
                description={achievement.description}
                requirementLabel={requirementLabel}
                unlocked={unlocked}
                isCurrent={achievement.id === currentAchievement.id}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}
