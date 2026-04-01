"use client";

import type { LeaderboardEntry, LeaderboardFilter, Member } from "@/types/home";

type LeaderboardSectionProps = {
  leaderboard: LeaderboardEntry[];
  members: Member[];
  filter: LeaderboardFilter;
  onFilterChange: (value: LeaderboardFilter) => void;
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
  if (filter === "bigfive") return "Big Five - Topp 3";
  if (filter === "abborre") return "Abborre - Topp 3";
  if (filter === "gädda") return "Gädda - Topp 3";
  return "Fina fisken - Topp 3";
}

function getMemberImage(members: Member[], name: string) {
  const match = members.find((member) => member.name === name);
  return match?.profile_image_url || null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRunnerUpStyles(index: number) {
  if (index === 1) {
    return {
      avatarRing: "ring-[#dbe2ea]",
      medal: "🥈",
    };
  }

  return {
    avatarRing: "ring-[#d8b08d]",
    medal: "🥉",
  };
}

export default function LeaderboardSection({
  leaderboard,
  members,
  filter,
  onFilterChange,
}: LeaderboardSectionProps) {
  const topThree = leaderboard.slice(0, 3);
  const winner = topThree[0];
  const runnersUp = topThree.slice(1, 3);

  const winnerImage = winner ? getMemberImage(members, winner.name) : null;

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[22px]">🏆</span>
        <h2 className="text-2xl font-bold text-[#1f2937]">Leaderboard</h2>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
  {filters.map((item) => {
    const isActive = filter === item.value;

    return (
      <button
        key={item.value}
        type="button"
        onClick={() => onFilterChange(item.value)}
        className={[
          "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition sm:px-5 sm:py-3 sm:text-sm",
          isActive
            ? "bg-[#1d2f7a] text-white shadow-[0_8px_18px_rgba(29,47,122,0.25)]"
            : "bg-[#eef2f3] text-[#374151] hover:bg-[#e3e8ea]",
        ].join(" ")}
      >
        {item.label}
      </button>
    );
  })}
</div>

      <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-4 shadow-inner">
        <h3 className="mb-5 text-[22px] font-bold text-[#1f2937]">
          {getHeadline(filter)}
        </h3>

        {topThree.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[#d8d2c7] bg-[#fbfaf7] px-4 py-6 text-sm text-[#6b7280]">
            Inga godkända fångster ännu.
          </div>
        ) : (
          <div className="space-y-4">
            {winner ? (
              <div className="relative overflow-hidden rounded-[24px] border border-[#d7b75a] bg-gradient-to-br from-[#fff8dc] via-[#f7e3a1] to-[#d7b75a] p-[1px] shadow-[0_14px_28px_rgba(183,141,40,0.22)]">
                <div className="rounded-[23px] bg-gradient-to-r from-[#fffef8] via-[#fff8e4] to-[#f7edd0] px-4 py-4">
                  <div className="relative min-h-[110px]">
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#4c3b17] px-2 py-1.5 text-sm font-semibold text-[#f8e7a3] shadow-sm">
                        <span>👑</span>
                        <span>1:a plats</span>
                      </div>
                    </div>

                    <div className="absolute right-0 top-0">
                      <div className="rounded-[18px] border border-[#ecd78b] bg-white/85 px-4 py-3 text-right shadow-sm">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6a1f]">
                          Resultat
                        </div>
                        <div className="mt-1 text-[clamp(1.1rem,2.5vw,1.3rem)] font-extrabold leading-none tracking-tight text-[#1f2937]">
                          {formatWeight(filter, winner.total)}
                        </div>
                      </div>
                    </div>

                    <div className="pr-[70px]">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative shrink-0">
                          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-[#f0d889] bg-white ring-4 ring-[#f6e8b5]/70 shadow-[0_10px_22px_rgba(183,141,40,0.22)]">
                            {winnerImage ? (
                              <img
                                src={winnerImage}
                                alt={winner.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-[#5b6470]">
                                {getInitials(winner.name)}
                              </span>
                            )}
                          </div>

                          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#d7b75a] text-sm shadow-md">
                            👑
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[clamp(1.6rem,2.5vw,2.2rem)] font-extrabold leading-none text-[#1f2937]">
                            {winner.name}
                          </div>

                          {filter === "fina" && winner.detail ? (
                            <div className="mt-2 text-sm font-medium text-[#7a6640]">
                              {winner.detail}
                            </div>
                          ) : (
                            <div className="mt-1 text-sm text-[#7a6640]">
                              Leder just nu leaderboarden
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {runnersUp.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {runnersUp.map((entry, index) => {
                  const actualIndex = index + 1;
                  const imageUrl = getMemberImage(members, entry.name);
                  const styles = getRunnerUpStyles(actualIndex);

                  return (
                    <div
                      key={`${entry.name}-${actualIndex}`}
                      className="flex items-center gap-4 rounded-[22px] border border-[#e5e7eb] bg-white px-4 py-4 shadow-[0_6px_14px_rgba(15,23,42,0.04)] transition hover:scale-[1.01] hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
                    >
                      <div className="relative shrink-0">
                        <div
                          className={[
                            "flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 bg-[#f3f4f6] ring-2",
                            styles.avatarRing,
                          ].join(" ")}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={entry.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-[#5b6470]">
                              {getInitials(entry.name)}
                            </span>
                          )}
                        </div>

                        <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white text-sm shadow-md">
                          {styles.medal}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-lg font-semibold text-[#1f2937]">
                          {entry.name}
                        </div>

                        {filter === "fina" && entry.detail ? (
                          <div className="mt-0.5 text-sm text-[#6b7280]">
                            {entry.detail}
                          </div>
                        ) : null}
                      </div>

                      <div className="shrink-0 pl-2 text-right">
                        <div className="text-lg font-bold tracking-tight text-[#111827]">
                          {formatWeight(filter, entry.total)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}