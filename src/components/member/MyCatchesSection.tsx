import {
  formatDate,
  formatWeight,
  getDisplayFishName,
  getStatusClasses,
  getStatusLabel,
} from "@/lib/member-page";
import type { MemberCatch } from "@/types/member-page";

type MyCatchesSectionProps = {
  catches: MemberCatch[];
};

export default function MyCatchesSection({ catches }: MyCatchesSectionProps) {
  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#1f2937]">🎣 Mina fångster</h2>
        <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-sm font-semibold text-[#5c4d3f]">
          {catches.length} st
        </span>
      </div>

      {catches.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d8d2c7] bg-[#faf8f4] p-6 text-sm text-[#6b7280]">
          Du har inga registrerade fångster ännu.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {catches.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#ddd8cf] bg-[#fffdfb] p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-bold text-[#1f2937]">
                    {getDisplayFishName(item)}
                  </div>
                  <div className="mt-1 text-sm text-[#6b7280]">
                    {formatWeight(item.weight_g)} • {formatDate(item.catch_date)}
                    {item.location_name ? ` • ${item.location_name}` : ""}
                  </div>
                  <div className="mt-1 text-sm text-[#6b7280]">
                    Fångad av: {item.caught_for} • Registrerad av: {item.registered_by}
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                    item.status
                  )}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}