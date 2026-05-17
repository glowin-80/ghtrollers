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

export default function CatchReactionBar({
  catchId,
  reactions,
  canReact,
  onToggleReaction,
  compact = false,
}: CatchReactionBarProps) {
  const summaries = CATCH_REACTION_EMOJIS.map((emoji) => {
    return (
      reactions?.find((reaction) => reaction.emoji === emoji) ?? {
        emoji,
        count: 0,
        reactedByMe: false,
      }
    );
  });

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "pt-2" : "pt-3"}`}>
      {summaries.map((summary) => {
        const isActive = summary.reactedByMe;
        const label = getReactionLabel(summary.emoji);

        return (
          <button
            key={summary.emoji}
            type="button"
            onClick={() => onToggleReaction(catchId, summary.emoji)}
            disabled={!canReact}
            title={canReact ? label : "Logga in som aktiv medlem för att reagera"}
            aria-pressed={isActive}
            aria-label={`${label}: ${summary.count}`}
            className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold transition ${
              isActive
                ? "border-[#8b7b3d] bg-[#efe5b8] text-[#2f3320] shadow-sm"
                : "border-[#d8d2c7] bg-white text-[#31414b] hover:bg-[#f7f4ee]"
            } ${!canReact ? "cursor-not-allowed opacity-70 hover:bg-white" : ""}`}
          >
            <span className="text-sm leading-none">{summary.emoji}</span>
            <span>{summary.count}</span>
          </button>
        );
      })}
    </div>
  );
}
