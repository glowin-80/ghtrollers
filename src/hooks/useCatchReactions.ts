import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addCatchReaction,
  CATCH_REACTIONS_ENABLED,
  CATCH_REACTION_EMOJIS,
  createEmptyCatchReactionState,
  fetchCatchReactions,
  removeCatchReaction,
  type CatchReactionEmoji,
  type CatchReactionState,
} from "@/lib/catch-reactions";

type UseCatchReactionsOptions = {
  catchIds: string[];
  currentMemberId: string | null;
  currentMemberName?: string | null;
  canReact: boolean;
};

function createEmptySummaries() {
  return CATCH_REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: 0,
    reactedByMe: false,
    memberNames: [],
  }));
}

function toggleReactionInState(params: {
  state: CatchReactionState;
  catchId: string;
  emoji: CatchReactionEmoji;
  currentMemberName: string;
}) {
  const currentSummaries = params.state[params.catchId] ?? createEmptySummaries();

  return {
    ...params.state,
    [params.catchId]: currentSummaries.map((summary) => {
      if (summary.emoji !== params.emoji) {
        return summary;
      }

      const nextReactedByMe = !summary.reactedByMe;
      const currentNames = summary.memberNames ?? [];
      const nextNames = nextReactedByMe
        ? [...new Set([...currentNames, params.currentMemberName])]
        : currentNames.filter((name) => name !== params.currentMemberName);

      return {
        ...summary,
        reactedByMe: nextReactedByMe,
        count: Math.max(0, summary.count + (nextReactedByMe ? 1 : -1)),
        memberNames: nextNames,
      };
    }),
  };
}

export function useCatchReactions({
  catchIds,
  currentMemberId,
  currentMemberName,
  canReact,
}: UseCatchReactionsOptions) {
  const stableCatchIds = useMemo(() => [...new Set(catchIds.filter(Boolean))], [catchIds]);
  const stableCatchIdKey = stableCatchIds.join("|");
  const [reactionState, setReactionState] = useState<CatchReactionState>(() =>
    createEmptyCatchReactionState(stableCatchIds)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const catchIdsForLoad = stableCatchIdKey ? stableCatchIdKey.split("|") : [];

    if (!CATCH_REACTIONS_ENABLED) {
      setReactionState(createEmptyCatchReactionState(catchIdsForLoad));
      setIsLoading(false);
      setErrorMessage(null);
      return () => {
        isMounted = false;
      };
    }

    const timeoutId = window.setTimeout(() => {
      if (!isMounted) {
        return;
      }

      setReactionState(createEmptyCatchReactionState(catchIdsForLoad));

      if (catchIdsForLoad.length === 0) {
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      void fetchCatchReactions({ catchIds: catchIdsForLoad, currentMemberId })
        .then((nextState) => {
          if (isMounted) {
            setReactionState(nextState);
          }
        })
        .catch((error) => {
          console.error("Could not load catch reactions", error);
          if (isMounted) {
            setErrorMessage("Kunde inte ladda reaktioner.");
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [currentMemberId, stableCatchIdKey]);

  const toggleReaction = useCallback(
    async (catchId: string, emoji: CatchReactionEmoji) => {
      if (!CATCH_REACTIONS_ENABLED) {
        return;
      }

      if (!canReact || !currentMemberId) {
        setErrorMessage("Logga in som aktiv medlem för att reagera.");
        return;
      }

      const currentSummary = reactionState[catchId]?.find((summary) => summary.emoji === emoji);
      const shouldRemove = Boolean(currentSummary?.reactedByMe);
      const previousState = reactionState;
      const optimisticMemberName = currentMemberName?.trim() || "Du";

      setReactionState((currentState) =>
        toggleReactionInState({ state: currentState, catchId, emoji, currentMemberName: optimisticMemberName })
      );
      setErrorMessage(null);

      try {
        if (shouldRemove) {
          await removeCatchReaction({ catchId, memberId: currentMemberId, emoji });
        } else {
          await addCatchReaction({ catchId, memberId: currentMemberId, emoji });
        }
      } catch (error) {
        console.error("Could not update catch reaction", error);
        setReactionState(previousState);
        setErrorMessage("Kunde inte spara reaktionen.");
      }
    },
    [canReact, currentMemberId, currentMemberName, reactionState]
  );

  return {
    reactionState,
    isLoading,
    errorMessage,
    toggleReaction,
  };
}
