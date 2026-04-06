import type { MemberCatch } from "@/types/member-page";
import {
  formatDateSv,
  formatWeightFromGrams,
  getDisplayFishName as getDisplayFishNameBase,
  normalizeFineFishSpeciesName as normalizeFineFishSpeciesNameBase,
} from "@/lib/catch-display";

export function formatWeight(weightG: number | null | undefined): string {
  return formatWeightFromGrams(weightG);
}

export function formatDate(dateString: string): string {
  return formatDateSv(dateString);
}

export function getDisplayFishName(catchItem: MemberCatch): string {
  return getDisplayFishNameBase(catchItem);
}

export function getCatchReportAnchorId(catchId: string): string {
  return `catch-report-${catchId}`;
}

export function getStatusLabel(status: string): string {
  if (status === "approved") return "Godkänd";
  if (status === "pending") return "Väntar";
  if (status === "rejected") return "Nekad";
  return status;
}

export function getStatusClasses(status: string): string {
  if (status === "approved") {
    return "bg-[#e8f6ea] text-[#2f6b3b]";
  }

  if (status === "pending") {
    return "bg-[#fff7e6] text-[#8a5a00]";
  }

  if (status === "rejected") {
    return "bg-[#fdecec] text-[#9f2d2d]";
  }

  return "bg-[#eef2f3] text-[#4b5563]";
}

export function normalizeFineFishSpeciesName(
  value: string | null | undefined
): string {
  return normalizeFineFishSpeciesNameBase(value);
}
