"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  formatDate,
  formatWeight,
  getCatchReportAnchorId,
  getDisplayFishName,
} from "@/lib/member-page";
import type { MemberCatch } from "@/types/member-page";

type MemberCatchSpotlightModalProps = {
  catchItem: MemberCatch | null;
  onClose: () => void;
};

export default function MemberCatchSpotlightModal({
  catchItem,
  onClose,
}: MemberCatchSpotlightModalProps) {
  useEffect(() => {
    if (!catchItem) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [catchItem, onClose]);

  if (!catchItem) {
    return null;
  }

  const displayFishName = getDisplayFishName(catchItem);
  const anchorId = getCatchReportAnchorId(catchItem.id);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Fångstkort för ${displayFishName}`}
    >
      <div
        className="relative w-full max-w-[360px] overflow-hidden rounded-[24px] border border-[#d8d2c7] bg-[#fcfbf8] shadow-[0_24px_60px_rgba(0,0,0,0.26)] sm:max-w-[390px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[90px] bg-[radial-gradient(circle_at_top_left,rgba(228,209,165,0.38),transparent_44%),linear-gradient(180deg,rgba(244,236,221,0.72)_0%,rgba(252,251,248,0)_100%)]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#cfc6b8] bg-white text-[1.2rem] font-bold leading-none text-[#2f3a33] shadow-[0_6px_16px_rgba(0,0,0,0.16)] transition hover:bg-[#f7f4ee]"
          aria-label="Stäng popup"
        >
          ×
        </button>

        <div className="relative px-4 pb-4 pt-4 sm:px-4.5 sm:pb-4.5">
          <div className="inline-flex rounded-full border border-[#d8d2c7] bg-[#f2ede5] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#5c4d3f] shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
            Fångstkort
          </div>

          <div className="mt-2.5 min-w-0 pr-10">
            <h2 className="text-[1.28rem] font-bold leading-[1.04] text-[#1f2937] sm:text-[1.42rem]">
              {displayFishName}
            </h2>

            <div className="mt-1 text-[0.9rem] font-medium leading-tight text-[#74685a]">
              {catchItem.caught_for}
            </div>
          </div>

          {catchItem.image_url ? (
            <div className="mt-3.5 overflow-hidden rounded-[18px] border border-[#e5ddd0] bg-[#fffdf9] shadow-[0_8px_18px_rgba(18,35,28,0.06)]">
              <img
                src={catchItem.image_url}
                alt={`Fångstbild för ${displayFishName}`}
                className="h-40 w-full object-cover sm:h-44"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}

          <div className="mt-4 pointer-events-none relative">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d6c08a] to-transparent" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcfbf8] px-2.5 text-xs text-[#c8a85c]">
              ✦
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="rounded-[16px] border border-[#e5ddd0] bg-white/82 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:col-span-2">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Resultat
              </div>
              <div className="mt-1 text-[1.1rem] font-bold leading-none text-[#1f2937]">
                {formatWeight(catchItem.weight_g)}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#e5ddd0] bg-white/82 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Datum
              </div>
              <div className="mt-1 text-[0.88rem] font-semibold leading-snug text-[#374151]">
                {formatDate(catchItem.catch_date)}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#e5ddd0] bg-white/82 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Plats
              </div>
              <div className="mt-1 text-[0.88rem] font-semibold leading-snug text-[#374151]">
                {catchItem.location_name || "Saknas"}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#e5ddd0] bg-white/82 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Fångad av
              </div>
              <div className="mt-1 text-[0.88rem] font-semibold leading-snug text-[#374151]">
                {catchItem.caught_for}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#e5ddd0] bg-white/82 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Registrerad av
              </div>
              <div className="mt-1 text-[0.88rem] font-semibold leading-snug text-[#374151]">
                {catchItem.registered_by}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href={`#${anchorId}`}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-[#d8d2c7] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
            >
              Till fångstrapporten
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
            >
              Stäng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}