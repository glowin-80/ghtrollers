"use client";

import Link from "next/link";
import { memo } from "react";
import ShareCatchButton from "@/components/shared/ShareCatchButton";
import {
  buildCatchShareDetails,
  formatCatchDateForDisplay,
  formatCatchWeightForDisplay,
  getCatchCategoryLabel,
} from "@/lib/catch-sharing";
import type { Catch } from "@/types/home";

type RecentApprovedSectionProps = {
  catches: Catch[];
  allApprovedCatches: Catch[];
  isLoggedIn: boolean;
  onImageClick: (imageUrl: string) => void;
};

function getLocationLine(item: Catch, isLoggedIn: boolean) {
  if (!isLoggedIn) {
    return `Logga in för att se plats · ${formatCatchDateForDisplay(item.catch_date)}`;
  }

  return `${item.location_name || "Plats ej angiven"} · ${formatCatchDateForDisplay(item.catch_date)}`;
}

function RecentApprovedSectionComponent({
  catches,
  allApprovedCatches,
  isLoggedIn,
  onImageClick,
}: RecentApprovedSectionProps) {
  return (
    <section className="rounded-[28px] border border-[#d6ddd7] bg-[#f6f5ef] p-4 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.75rem] font-bold leading-none text-[#152532]">
            🔥 Nya godkända fångster
          </h2>
          <p className="mt-1 text-sm text-[#5b6871]">
            Senaste 6 godkända fångsterna.
          </p>
        </div>

        <Link
          href="/galleri"
          className="shrink-0 self-start rounded-full border border-[#d7d0c3] bg-white px-3 py-2 text-sm font-semibold text-[#31414b] transition hover:bg-[#f2efe8]"
        >
          Öppna galleri
        </Link>
      </div>

      {catches.length === 0 ? (
        <p className="text-sm text-[#475862]">Inga godkända fångster ännu.</p>
      ) : (
        <ul className="space-y-3">
          {catches.map((item) => {
            const shareDetails = buildCatchShareDetails(item, allApprovedCatches);

            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-[22px] border border-[#cfd6cf] bg-white shadow-sm"
              >
                <div className="flex min-h-[104px]">
                  <button
                    type="button"
                    onClick={() => item.image_url && onImageClick(item.image_url)}
                    className="h-[104px] w-[104px] shrink-0 overflow-hidden bg-[#ebe7de] disabled:cursor-default"
                    disabled={!item.image_url}
                    aria-label={`Öppna bild för ${item.caught_for}`}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={`${item.caught_for} fångst`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#6b7280]">
                        Ingen bild
                      </div>
                    )}
                  </button>

                  <div className="flex min-w-0 flex-1 flex-col justify-between px-3.5 py-3">
                    <div>
                      <div className="truncate text-[0.98rem] font-bold leading-tight text-[#1d2934]">
                        {item.caught_for}
                      </div>

                      <div className="mt-1 line-clamp-2 text-[0.9rem] leading-snug text-[#2f3f49]">
                        {getCatchCategoryLabel(item)} · {formatCatchWeightForDisplay(item.weight_g)}
                      </div>

                      <div className="mt-1.5 text-[0.78rem] leading-snug text-[#687780]">
                        {getLocationLine(item, isLoggedIn)}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Link
                        href={`/fangst/${item.id}`}
                        className="rounded-full border border-[#d7d0c3] bg-white px-3 py-1.5 text-xs font-semibold text-[#31414b] transition hover:bg-[#f2efe8]"
                      >
                        Se fångst
                      </Link>

                      <ShareCatchButton
                        catchId={item.id}
                        shareTitle={shareDetails.shareTitle}
                        shareText={shareDetails.shareText}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const RecentApprovedSection = memo(RecentApprovedSectionComponent);

export default RecentApprovedSection;