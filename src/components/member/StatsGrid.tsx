"use client";

import type { MemberStats } from "@/types/member-page";

type Props = {
  stats: MemberStats;
};

function StatCard({
  title,
  value,
  compact = false,
}: {
  title: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[22px] border border-[#ddd8cf] bg-white px-4 py-4 shadow-sm",
        compact ? "min-h-[108px]" : "min-h-[122px]",
      ].join(" ")}
    >
      <div className="text-[0.95rem] text-[#6b7280]">{title}</div>
      <div
        className={[
          "mt-3 break-words font-bold leading-tight text-[#1f2937]",
          compact ? "text-[1.75rem]" : "text-[1.9rem]",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

export default function StatsGrid({ stats }: Props) {
  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-[#d8d2c7] bg-white p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
        <h2 className="mb-4 text-[2rem] font-bold leading-none text-[#1f2937]">
          Mina stats
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Totalt antal fångster" value={stats.totalCatches} compact />
          <StatCard title="Godkända fångster" value={stats.approvedCatches} compact />
          <StatCard title="Väntar på godkännande" value={stats.pendingCatches} compact />
          <StatCard title="Bästa Big Five" value={stats.bestBigFive} compact />
          <StatCard title="Största gädda" value={stats.biggestPike} />
          <StatCard title="Största abborre" value={stats.biggestPerch} />
          <StatCard title="Bästa fina fisken" value={stats.bestFineFish} />
        </div>
      </section>

      <section className="rounded-[28px] border border-[#d8d2c7] bg-white p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[1.65rem] font-bold leading-none text-[#1f2937]">
            Fångstfördelning
          </h2>
          <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5c4d3f]">
            All tid
          </span>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
              Antal
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <StatCard title="Abborrar" value={stats.totalPerchCount} compact />
              <StatCard title="Gäddor" value={stats.totalPikeCount} compact />
              <StatCard title="Fina fisken" value={stats.totalFineFishCount} compact />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7468]">
              Vikt
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <StatCard title="Abborrar" value={stats.totalPerchWeight} compact />
              <StatCard title="Gäddor" value={stats.totalPikeWeight} compact />
              <StatCard title="Fina fisken" value={stats.totalFineFishWeight} compact />
            </div>
          </div>
        </div>

        {stats.fineFishSpeciesStats.length > 0 ? (
          <div className="mt-5 rounded-[22px] border border-[#ddd8cf] bg-[#fffdfb] px-4 py-4">
            <h3 className="text-sm font-semibold text-[#1f2937]">
              Fina fisken per art
            </h3>

            <div className="mt-3 space-y-2">
              {stats.fineFishSpeciesStats.map((item) => (
                <div
                  key={item.species}
                  className="flex items-center justify-between gap-3 border-b border-[#eee8de] pb-2 text-sm last:border-b-0 last:pb-0"
                >
                  <span className="font-medium text-[#374151]">{item.species}</span>
                  <span className="text-[#6b7280]">
                    {item.count} st · {item.totalWeight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
