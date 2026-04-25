import { getCatchOwnerIdentityKey } from "@/lib/catch-identity";
import { buildAllTimeHighlights } from "@/lib/home-all-time";
import type { AllTimeHighlight, Catch, LeaderboardFilter, Member } from "@/types/home";

export type AllTimeHighPushEvent = {
  filter: LeaderboardFilter;
  title: string;
  body: string;
  url: string;
};

type DetectAllTimeHighPushEventParams = {
  beforeCatches: Catch[];
  afterCatches: Catch[];
  members: Member[];
  approvedCatch: Catch;
};

const ALL_TIME_HIGH_TITLE = "Nytt All-time-high 🔥";
const ALL_TIME_HIGH_URL = "/all-time-high";

function getFirstName(name?: string | null) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return "En medlem";
  }

  return trimmedName.split(/\s+/)[0] || "En medlem";
}

function getHighlightByFilter(highlights: AllTimeHighlight[], filter: LeaderboardFilter) {
  return highlights.find((highlight) => highlight.filter === filter) ?? null;
}

function beatsPreviousHighlight(
  beforeHighlight: AllTimeHighlight | null,
  afterHighlight: AllTimeHighlight | null
) {
  if (!afterHighlight) {
    return false;
  }

  if (!beforeHighlight) {
    return afterHighlight.total > 0;
  }

  return afterHighlight.total > beforeHighlight.total;
}

function isCurrentCatchSpecificRecord(
  filter: LeaderboardFilter,
  beforeHighlights: AllTimeHighlight[],
  afterHighlights: AllTimeHighlight[],
  approvedCatch: Catch,
  members: Member[]
) {
  const afterHighlight = getHighlightByFilter(afterHighlights, filter);
  const beforeHighlight = getHighlightByFilter(beforeHighlights, filter);

  if (!beatsPreviousHighlight(beforeHighlight, afterHighlight)) {
    return false;
  }

  if (afterHighlight?.identityKey !== getCatchOwnerIdentityKey(approvedCatch, members)) {
    return false;
  }

  if (afterHighlight.total !== approvedCatch.weight_g) {
    return false;
  }

  if (filter === "fina") {
    return (
      approvedCatch.fish_type === "Fina fisken" &&
      (afterHighlight.detail ?? "") === (approvedCatch.fine_fish_type ?? "")
    );
  }

  if (filter === "gädda") {
    return approvedCatch.fish_type === "Gädda";
  }

  if (filter === "abborre") {
    return approvedCatch.fish_type === "Abborre";
  }

  return false;
}

function isCurrentCatchBigFiveRecord(
  beforeHighlights: AllTimeHighlight[],
  afterHighlights: AllTimeHighlight[],
  approvedCatch: Catch,
  members: Member[]
) {
  const afterHighlight = getHighlightByFilter(afterHighlights, "bigfive");
  const beforeHighlight = getHighlightByFilter(beforeHighlights, "bigfive");

  if (!beatsPreviousHighlight(beforeHighlight, afterHighlight)) {
    return false;
  }

  return afterHighlight?.identityKey === getCatchOwnerIdentityKey(approvedCatch, members);
}

function getSpecificRecordFilter(approvedCatch: Catch): LeaderboardFilter | null {
  if (approvedCatch.fish_type === "Fina fisken") {
    return "fina";
  }

  if (approvedCatch.fish_type === "Gädda") {
    return "gädda";
  }

  if (approvedCatch.fish_type === "Abborre") {
    return "abborre";
  }

  return null;
}

function getSpecificRecordFishLabel(approvedCatch: Catch) {
  if (approvedCatch.fish_type === "Fina fisken") {
    return approvedCatch.fine_fish_type?.trim() || "fisk";
  }

  return approvedCatch.fish_type?.trim() || "fisk";
}

function buildSpecificRecordEvent(filter: LeaderboardFilter, approvedCatch: Catch): AllTimeHighPushEvent {
  const firstName = getFirstName(approvedCatch.caught_for);
  const fishLabel = getSpecificRecordFishLabel(approvedCatch);
  const body =
    filter === "fina"
      ? `${firstName} slår all-time-high för Fina fisken med en fet ${fishLabel}!!!`
      : `${firstName} slår all-time-high med en fet ${fishLabel}!!!`;

  return {
    filter,
    title: ALL_TIME_HIGH_TITLE,
    body,
    url: ALL_TIME_HIGH_URL,
  };
}

function buildBigFiveRecordEvent(approvedCatch: Catch): AllTimeHighPushEvent {
  return {
    filter: "bigfive",
    title: ALL_TIME_HIGH_TITLE,
    body: `${getFirstName(approvedCatch.caught_for)} slår all-time-high för Big Five!!!`,
    url: ALL_TIME_HIGH_URL,
  };
}

export function detectAllTimeHighPushEvent({
  beforeCatches,
  afterCatches,
  members,
  approvedCatch,
}: DetectAllTimeHighPushEventParams): AllTimeHighPushEvent | null {
  const beforeHighlights = buildAllTimeHighlights(beforeCatches, members);
  const afterHighlights = buildAllTimeHighlights(afterCatches, members);
  const specificRecordFilter = getSpecificRecordFilter(approvedCatch);

  if (
    specificRecordFilter &&
    isCurrentCatchSpecificRecord(
      specificRecordFilter,
      beforeHighlights,
      afterHighlights,
      approvedCatch,
      members
    )
  ) {
    return buildSpecificRecordEvent(specificRecordFilter, approvedCatch);
  }

  if (isCurrentCatchBigFiveRecord(beforeHighlights, afterHighlights, approvedCatch, members)) {
    return buildBigFiveRecordEvent(approvedCatch);
  }

  return null;
}
