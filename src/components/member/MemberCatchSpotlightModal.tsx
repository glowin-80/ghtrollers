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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Fångstkort för ${displayFishName}`}
    >
      <div
        className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#d8d2c7] bg-[#fcfbf8] shadow-[0_24px_60px_rgba(0,0,0,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[120px] bg-[radial-gradient(circle_at_top_left,rgba(228,209,165,0.42),transparent_44%),linear-gradient(180deg,rgba(244,236,221,0.78)_0%,rgba(252,251,248,0)_100%)]" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8d2c7] bg-white/90 text-lg font-semibold text-[#4b5563] shadow-sm transition hover:bg-[#f9f7f3]"
          aria-label="Stäng popup"
        >
          ×
        </button>

        <div className="relative px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
          <div className="inline-flex rounded-full border border-[#d8d2c7] bg-[#f2ede5] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#5c4d3f] shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
            Fångstkort
          </div>

          <div className="mt-3 min-w-0">
            <h2 className="text-[1.55rem] font-bold leading-[1.02] text-[#1f2937] sm:text-[1.7rem]">
              {displayFishName}
            </h2>

            <div className="mt-1.5 text-[0.98rem] font-medium leading-tight text-[#74685a]">
              {catchItem.caught_for}
            </div>
          </div>

          {catchItem.image_url ? (
            <div className="mt-5 overflow-hidden rounded-[22px] border border-[#e5ddd0] bg-[#fffdf9] shadow-[0_8px_18px_rgba(18,35,28,0.06)]">
              <img
                src={catchItem.image_url}
                alt={`Fångstbild för ${displayFishName}`}
                className="h-52 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}

          <div className="mt-5 pointer-events-none relative">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d6c08a] to-transparent" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcfbf8] px-3 text-sm text-[#c8a85c]">
              ✦
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-[#e5ddd0] bg-white/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] sm:col-span-2">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Resultat
              </div>
              <div className="mt-1.5 text-[1.25rem] font-bold leading-none text-[#1f2937]">
                {formatWeight(catchItem.weight_g)}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e5ddd0] bg-white/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Datum
              </div>
              <div className="mt-1.5 text-[0.95rem] font-semibold leading-snug text-[#374151]">
                {formatDate(catchItem.catch_date)}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e5ddd0] bg-white/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Plats
              </div>
              <div className="mt-1.5 text-[0.95rem] font-semibold leading-snug text-[#374151]">
                {catchItem.location_name || "Saknas"}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e5ddd0] bg-white/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Fångad av
              </div>
              <div className="mt-1.5 text-[0.95rem] font-semibold leading-snug text-[#374151]">
                {catchItem.caught_for}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#e5ddd0] bg-white/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#8b7460]">
                Registrerad av
              </div>
              <div className="mt-1.5 text-[0.95rem] font-semibold leading-snug text-[#374151]">
                {catchItem.registered_by}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
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