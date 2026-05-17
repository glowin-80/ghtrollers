export function getApprovedPublicFishingSpotCount(
  spots: { status?: string | null; is_private?: boolean | null }[]
) {
  return spots.filter(
    (spot) => spot.status === "approved" && spot.is_private !== true
  ).length;
}
