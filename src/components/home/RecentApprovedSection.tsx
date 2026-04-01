"use client";

import { memo } from "react";
import type { Catch } from "@/types/home";

type RecentApprovedSectionProps = {
  catches: Catch[];
  onImageClick: (imageUrl: string) => void;
};

function getCatchLabel(item: Catch) {
  if (item.fish_type === "Fina fisken" && item.fine_fish_type) {
    return `Fina fisken (${item.fine_fish_type})`;
  }

  return item.fish_type;
}

function RecentApprovedSectionComponent({
  catches,
  onImageClick,
}: RecentApprovedSectionProps) {
  return (
    <section className="mb-5 rounded-[28px] border border-[#d6ddd7] bg-[#f6f5ef] p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h2 className="mb-3 text-xl font-bold text-[#152532]">
        🔥 Nya godkända fångster
      </h2>

      {catches.length === 0 ? (
        <p className="text-[#475862]">Inga godkända fångster ännu.</p>
      ) : (
        <ul className="space-y-4">
          {catches.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-[#cfd6cf] bg-white shadow-sm"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={`${item.caught_for} fångst`}
                  onClick={() => onImageClick(item.image_url!)}
                  className="h-52 w-full cursor-pointer object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}

              <div className="p-4">
                <div className="text-[18px] text-[#1d2934]">
                  <strong>{item.caught_for}</strong> – {getCatchLabel(item)}{" "}
                  {item.weight_g} g
                </div>

                <div className="mt-1 text-sm text-[#51616b]">
                  {item.location_name || "Plats ej angiven"} • {item.catch_date}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const RecentApprovedSection = memo(RecentApprovedSectionComponent);

export default RecentApprovedSection;
