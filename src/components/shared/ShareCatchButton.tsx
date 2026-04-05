"use client";

import { useMemo, useState } from "react";

type ShareCatchButtonProps = {
  catchId: string;
  shareTitle: string;
  shareText: string;
  compact?: boolean;
};

export default function ShareCatchButton({
  catchId,
  shareTitle,
  shareText,
  compact = false,
}: ShareCatchButtonProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return `/fangst/${catchId}`;
    }

    return `${window.location.origin}/fangst/${catchId}`;
  }, [catchId]);

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      const clipboardText = `${shareText}\n${shareUrl}`;

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(clipboardText);
        setStatusMessage("Länk kopierad.");
        window.setTimeout(() => {
          setStatusMessage(null);
        }, 2500);
        return;
      }

      window.prompt("Kopiera länken nedan:", clipboardText);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error(error);
      setStatusMessage("Det gick inte att dela just nu.");
      window.setTimeout(() => {
        setStatusMessage(null);
      }, 2500);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className={[
          "rounded-full border border-[#d7d0c3] bg-white font-semibold text-[#31414b] transition hover:bg-[#f2efe8]",
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        ].join(" ")}
      >
        Dela
      </button>

      {statusMessage ? (
        <span className="text-xs font-medium text-[#5b6871]">{statusMessage}</span>
      ) : null}
    </div>
  );
}