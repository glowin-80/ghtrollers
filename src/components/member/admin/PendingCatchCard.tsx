"use client";

import { isGuestAnglerRole } from "@/lib/ght-rules";
import type { PendingCatch } from "@/lib/admin-tools";

type PendingCatchCardProps = {
  item: PendingCatch & { member_role?: string | null };
  workingKey: string | null;
  isSuperAdmin: boolean;
  onApprove: (catchId: string) => void;
  onReject: (catchId: string) => void;
};

function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) return "Saknas";
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;

  return `${(kb / 1024).toFixed(2)} MB`;
}

function getCompressionReduction(
  originalBytes: number | null,
  compressedBytes: number | null
) {
  if (!originalBytes || !compressedBytes || originalBytes <= 0) return null;

  const reduction = ((originalBytes - compressedBytes) / originalBytes) * 100;
  return reduction < 0 ? 0 : Math.round(reduction);
}

export default function PendingCatchCard({
  item,
  workingKey,
  isSuperAdmin,
  onApprove,
  onReject,
}: PendingCatchCardProps) {
  const fishLabel =
    item.fish_type === "Fina fisken" && item.fine_fish_type
      ? `Fina fisken • ${item.fine_fish_type}`
      : item.fish_type;

  const isGuestCatch = isGuestAnglerRole(item.member_role);
  const competitionReason = isGuestCatch
    ? "Gäst fiskare"
    : item.live_scope
      ? "Live-scope"
      : item.caught_abroad
        ? "Utomlands"
        : null;

  const isCompetitionEligible = !competitionReason;

  const reduction =
    item.original_image_size_bytes && item.compressed_image_size_bytes
      ? getCompressionReduction(
          item.original_image_size_bytes,
          item.compressed_image_size_bytes
        )
      : null;

  return (
    <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={fishLabel}
          className="mb-4 h-48 w-full rounded-2xl object-cover"
        />
      ) : null}

      <div className="space-y-3">
        <div>
          <h3 className="text-2xl font-bold text-[#102033]">{item.caught_for}</h3>
          <p className="text-lg text-[#5b6575]">
            Registrerad av {item.registered_by}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.fishing_method ? (
            <span className="rounded-full bg-[#eaf6e5] px-3 py-1 text-sm font-medium text-[#3e6b35]">
              {item.fishing_method}
            </span>
          ) : null}

          {item.is_location_private ? (
            <span className="rounded-full bg-[#f1f3f5] px-3 py-1 text-sm font-medium text-[#5b6575]">
              Privat plats
            </span>
          ) : null}

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              isCompetitionEligible
                ? "bg-[#eaf6e5] text-[#3e6b35]"
                : "bg-[#fdf0d5] text-[#8a5a00]"
            }`}
          >
            {isCompetitionEligible
              ? "Tävlingsgrundande"
              : `Ej tävlingsgrundande · ${competitionReason}`}
          </span>
        </div>

        <div className="space-y-2 text-lg text-[#102033]">
          <p>
            <span className="font-semibold">Art:</span> {fishLabel}
          </p>
          <p>
            <span className="font-semibold">Vikt:</span> {item.weight_g} g
          </p>
          <p>
            <span className="font-semibold">Datum:</span> {item.catch_date}
          </p>
          <p>
            <span className="font-semibold">Plats:</span>{" "}
            {item.is_location_private && !isSuperAdmin
              ? "Privat plats"
              : item.location_name || "Saknas"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e4ddd2] bg-[#faf7f2] p-3 text-base text-[#5b6575]">
          <p>Före: {formatBytes(item.original_image_size_bytes)}</p>
          <p>Efter: {formatBytes(item.compressed_image_size_bytes)}</p>
          <p>
            Minskning:{" "}
            {reduction !== null ? `${reduction}% mindre` : "Saknas"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            disabled={workingKey === item.id}
            className="rounded-full bg-[#235b2f] px-6 py-3 text-lg font-semibold text-white transition hover:bg-[#1d4a26] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Godkänn fångst
          </button>

          <button
            type="button"
            onClick={() => onReject(item.id)}
            disabled={workingKey === item.id}
            className="rounded-full border border-[#f1b5b5] px-6 py-3 text-lg font-semibold text-[#cc3b3b] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ta bort
          </button>
        </div>
      </div>
    </div>
  );
}