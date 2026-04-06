import type { Catch } from "@/types/home";
import type { MemberCatch } from "@/types/member-page";

type CatchLike = Pick<Catch, "fish_type" | "fine_fish_type" | "weight_g">;
type CatchWithDate = Pick<Catch, "catch_date">;

export function formatWeightFromGrams(weight: number | null | undefined): string {
  if (!weight || weight <= 0) {
    return "-";
  }

  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(2)} kg`;
  }

  return `${weight} g`;
}

export function formatDateSv(dateString?: string | null): string {
  if (!dateString) {
    return "Saknas";
  }

  return new Intl.DateTimeFormat("sv-SE").format(new Date(dateString));
}

export function normalizeFineFishSpeciesName(
  value: string | null | undefined
): string {
  const raw = (value || "Okänd").trim();

  if (!raw) {
    return "Okänd";
  }

  const normalized = raw.toLowerCase();

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getFishLabel(catchItem: CatchLike): string {
  if (catchItem.fish_type === "Fina fisken" && catchItem.fine_fish_type) {
    return normalizeFineFishSpeciesName(catchItem.fine_fish_type);
  }

  return catchItem.fish_type;
}

export function getDisplayFishName(catchItem: MemberCatch): string {
  if (catchItem.fish_type === "Fina fisken" && catchItem.fine_fish_type) {
    return `Fina fisken (${catchItem.fine_fish_type})`;
  }

  return catchItem.fish_type;
}

export function getCatchYear(catchItem: CatchWithDate): string | null {
  return catchItem.catch_date?.slice(0, 4) || null;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
