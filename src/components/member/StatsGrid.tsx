"use client";

import type { MemberStats } from "@/types/member-page";

type Props = {
  stats: MemberStats;
};

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-[22px] border border-[#d8d2c7] bg-white px-5 py-4 shadow">
      <div className="text-sm text-[#6b7280]">{title}</div>
      <div className="mt-2 text-2xl font-bold text-[#1f2937]">{value}</div>
    </div>
  );
}

export default function StatsGrid({ stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Mina stats */}
      <section className="rounded-[28px] border border-[#d8d2c7] bg-white p-5">
        <h2 className="mb-4 text-xl font-bold">Mina stats</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Totalt antal fångster" value={stats.totalCatches} />
          <Card title="Godkända fångster" value={stats.approvedCatches} />
          <Card title="Väntar på godkännande" value={stats.pendingCatches} />
          <Card title="Största gädda" value={stats.biggestPike} />
          <Card title="Största abborre" value={stats.biggestPerch} />
          <Card title="Bästa fina fisken" value={stats.bestFineFish} />
          <Card title="Bästa Big Five" value={stats.bestBigFive} />
        </div>
      </section>

      {/* Alla stats */}
      <section className="rounded-[28px] border border-[#d8d2c7] bg-white p-5">
        <h2 className="mb-4 text-xl font-bold">Alla stats</h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">
              Antal
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Card title="Abborrar" value={stats.totalPerchCount} />
              <Card title="Gäddor" value={stats.totalPikeCount} />
              <Card title="Fina fisken" value={stats.totalFineFishCount} />
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6b7280]">
              Vikt (kg)
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Card title="Abborrar" value={stats.totalPerchWeight} />
              <Card title="Gäddor" value={stats.totalPikeWeight} />
              <Card title="Fina fisken" value={stats.totalFineFishWeight} />
            </div>
          </div>
        </div>

        {stats.fineFishSpeciesStats.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-md font-semibold">
              Fina fisken per art
            </h3>

            <div className="space-y-2">
              {stats.fineFishSpeciesStats.map((item) => (
                <div
                  key={item.species}
                  className="flex justify-between border-b pb-1 text-sm"
                >
                  <span>{item.species}</span>
                  <span>
                    {item.count} st · {item.totalWeight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}