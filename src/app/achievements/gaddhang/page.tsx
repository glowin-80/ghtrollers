"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchActiveAchievementMembers, type AchievementMemberSummary } from "@/lib/member-service";
import { getCurrentAchievementByValue } from "@/lib/achievements";

type RankedAchievementMember = AchievementMemberSummary & {
  achievementTitle: string;
  achievementDescription: string;
  achievementImageSrc: string;
  achievementSortOrder: number;
};

export default function GaddhangAchievementsPage() {
  const [members, setMembers] = useState<RankedAchievementMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const resolvedMembers = await fetchActiveAchievementMembers();

        if (!mounted) return;

        const rankedMembers = resolvedMembers
          .map((member) => {
            const achievement = getCurrentAchievementByValue(member.catchCount, "reported_catches");

            return {
              ...member,
              achievementTitle: achievement?.title ?? "Fiskesugen",
              achievementDescription: achievement?.description ?? "",
              achievementImageSrc: achievement?.imageSrc ?? "/Achievments/catch/catchBadge_1.png",
              achievementSortOrder: achievement?.sortOrder ?? 1,
            };
          })
          .sort((a, b) => {
            if (b.achievementSortOrder !== a.achievementSortOrder) return b.achievementSortOrder - a.achievementSortOrder;
            if (b.catchCount !== a.catchCount) return b.catchCount - a.catchCount;
            return (a.name || "").localeCompare(b.name || "", "sv");
          });

        setMembers(rankedMembers);
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
  }, []);

  const totalCatchCount = useMemo(() => members.reduce((sum, member) => sum + member.catchCount, 0), [members]);

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
            <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">Rapporterad Fångst</div>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight text-[#1f2937] sm:text-[2.4rem]">
              Gäddhängs achievements
            </h1>
            <p className="mt-3 max-w-3xl text-[1rem] leading-8 text-[#667085]">
              Här ser du aktiva Gäddhäng-medlemmar, deras antal rapporterade fångster och vilken achievement-nivå de ligger på just nu. Klicka på en medlem för att läsa mer om nivån.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">Aktiva medlemmar</div>
              <div className="mt-2 text-[2rem] font-bold leading-none text-[#1f2937]">{members.length}</div>
            </div>
            <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-4">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">Rapporterade fångster</div>
              <div className="mt-2 text-[2rem] font-bold leading-none text-[#1f2937]">{totalCatchCount}</div>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        <section className="rounded-[30px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
          <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8b7449]">Medlemsöversikt</div>
          <h2 className="mt-2 text-[1.5rem] font-bold text-[#1f2937]">Nivåer och fångster</h2>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8] px-5 py-5 text-sm text-[#4b5563]">
                Laddar Gäddhängs achievements...
              </div>
            ) : null}

            {!loading ? members.map((member) => (
              <details
                key={member.id}
                className="group overflow-hidden rounded-[24px] border border-[#e5ddd0] bg-[#fcfbf8]"
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-4">
                  <img
                    src={member.profile_image_url || member.achievementImageSrc}
                    alt={member.name || "Medlem"}
                    className="h-14 w-14 rounded-full border border-[#d8d2c7] object-cover bg-[#efe7d7]"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8b7449]">Namn: {member.name}</div>
                    <div className="mt-1 text-[1.08rem] font-bold leading-tight text-[#1f2937]">{member.achievementTitle}</div>
                    <div className="mt-1 text-sm text-[#6b7280]">{member.catchCount} rapporterade fångster</div>
                  </div>

                  <img
                    src={member.achievementImageSrc}
                    alt={member.achievementTitle}
                    className="h-14 w-14 shrink-0 object-contain"
                    loading="lazy"
                  />
                </summary>

                <div className="border-t border-[#efe7d7] px-5 py-4 text-sm leading-7 text-[#6b7280]">
                  <div className="font-semibold text-[#1f2937]">{member.achievementTitle}</div>
                  <p className="mt-2">{member.achievementDescription}</p>
                </div>
              </details>
            )) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
