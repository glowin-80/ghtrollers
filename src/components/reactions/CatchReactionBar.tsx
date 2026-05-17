"use client";

import { useMemo, useState } from "react";
import {
  CATCH_REACTION_EMOJIS,
  type CatchReactionEmoji,
  type CatchReactionSummary,
} from "@/lib/catch-reactions";

type CatchReactionBarProps = {
  catchId: string;
  reactions?: CatchReactionSummary[];
  canReact: boolean;
  onToggleReaction: (catchId: string, emoji: CatchReactionEmoji) => void;
  compact?: boolean;
};

function getReactionLabel(emoji: CatchReactionEmoji) {
  if (emoji === "🔥") return "Hype";
  if (emoji === "😂") return "Skratt";
  if (emoji === "🎣") return "Fiskeglädje";
  if (emoji === "👍") return "Ja";
  return "Nej";
}

function formatReactedBy(names: string[]) {
  if (names.length === 0) return "Ingen har reagerat ännu.";
  return names.join(", ");
}

export default function CatchReactionBar({
  catchId,
  reactions,
  canReact,
  onToggleReaction,
}: CatchReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [openNamesEmoji, setOpenNamesEmoji] =
    useState<CatchReactionEmoji | null>(null);

  const summaries = useMemo(
    () =>
      CATCH_REACTION_EMOJIS.map((emoji) => {
        const existing = reactions?.find(
          (reaction) => reaction.emoji === emoji,
        );

        return {
          emoji,
          count: existing?.count ?? 0,
          reactedByMe: existing?.reactedByMe ?? false,
          memberNames: existing?.memberNames ?? [],
        };
      }),
    [reactions],
  );

  const visibleSummaries = summaries.filter((summary) => summary.count > 0);

  function handlePickReaction(emoji: CatchReactionEmoji) {
    if (!canReact) {
      return;
    }

    onToggleReaction(catchId, emoji);
    setPickerOpen(false);
    setOpenNamesEmoji(null);
  }

  return (
    <>
      {visibleSummaries.length > 0 ? (
        <div className="absolute right-3 top-3 z-[70] flex max-w-[min(70vw,16rem)] flex-row-reverse flex-wrap items-center gap-1.5">
          {visibleSummaries.map((summary) => {
            const names = summary.memberNames ?? [];
            const reactedByText = formatReactedBy(names);
            const namesOpen = openNamesEmoji === summary.emoji;

            return (
              <div key={summary.emoji} className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenNamesEmoji((current) =>
                      current === summary.emoji ? null : summary.emoji,
                    )
                  }
                  title={reactedByText}
                  aria-label={`${getReactionLabel(summary.emoji)}: ${summary.count}. ${reactedByText}`}
                  className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    summary.reactedByMe
                      ? "border-[#8b7b3d] bg-[#efe5b8] text-[#2f3320] shadow-sm"
                      : "border-[#d8d2c7] bg-white text-[#31414b] shadow-sm hover:bg-[#f7f4ee]"
                  }`}
                >
                  <span className="text-sm leading-none">{summary.emoji}</span>
                  <span>{summary.count}</span>
                </button>

                {namesOpen ? (
                  <div className="absolute right-0 top-9 z-[90] min-w-40 max-w-56 rounded-2xl border border-[#d8d2c7] bg-white px-3 py-2 text-xs font-semibold text-[#31414b] shadow-[0_8px_24px_rgba(18,35,28,0.16)]">
                    {reactedByText}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="relative z-20 inline-flex items-center">
        <button
          type="button"
          onClick={() => setPickerOpen((current) => !current)}
          disabled={!canReact}
          title={
            canReact
              ? "Reagera på fångsten"
              : "Logga in som aktiv medlem för att reagera"
          }
          aria-expanded={pickerOpen}
          aria-label="Välj reaktion"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8d2c7] bg-white text-lg shadow-sm transition hover:bg-[#f7f4ee] ${
            !canReact ? "cursor-not-allowed opacity-70 hover:bg-white" : ""
          }`}
        >
          🔥
        </button>

        {pickerOpen ? (
          <div className="absolute bottom-11 right-0 z-[80] flex items-center gap-1 rounded-full border border-[#d8d2c7] bg-white p-1.5 shadow-[0_8px_24px_rgba(18,35,28,0.16)]">
            {summaries.map((summary) => {
              const isActive = summary.reactedByMe;
              const label = getReactionLabel(summary.emoji);

              return (
                <button
                  key={summary.emoji}
                  type="button"
                  onClick={() => handlePickReaction(summary.emoji)}
                  title={label}
                  aria-pressed={isActive}
                  aria-label={label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg transition ${
                    isActive
                      ? "border-[#8b7b3d] bg-[#efe5b8] shadow-sm"
                      : "border-transparent bg-white hover:bg-[#f7f4ee]"
                  }`}
                >
                  {summary.emoji}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
