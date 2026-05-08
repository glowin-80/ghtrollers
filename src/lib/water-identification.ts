export type WaterIdentificationResult = {
  found: boolean;
  name: string | null;
  waterKey: string | null;
  source: string | null;
  distanceM: number | null;
  achievementEligible: boolean;
  matchType: "inside" | "nearby" | null;
  setupRequired?: boolean;
  message?: string;
};

export const WATER_ACHIEVEMENT_MAX_DISTANCE_M = 250;
export const WATER_DISPLAY_MAX_DISTANCE_M = 1000;

export function normalizeWaterKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/^norra\s+/, "")
    .replace(/^sodra\s+/, "")
    .replace(/^ostra\s+/, "")
    .replace(/^vastra\s+/, "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export async function identifyWaterBody(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<WaterIdentificationResult> {
  if (!isValidCoordinate(lat, lng)) {
    return {
      found: false,
      name: null,
      waterKey: null,
      source: null,
      distanceM: null,
      achievementEligible: false,
      matchType: null,
      message: "Ogiltiga koordinater.",
    };
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
  });

  const response = await fetch(`/api/waters/identify?${params.toString()}`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    return {
      found: false,
      name: null,
      waterKey: null,
      source: null,
      distanceM: null,
      achievementEligible: false,
      matchType: null,
      message: "Kunde inte identifiera vatten just nu.",
    };
  }

  const data = (await response.json()) as Partial<WaterIdentificationResult>;

  return {
    found: Boolean(data.found),
    name: data.name ?? null,
    waterKey: data.waterKey ?? null,
    source: data.source ?? null,
    distanceM: typeof data.distanceM === "number" ? data.distanceM : null,
    achievementEligible: Boolean(data.achievementEligible),
    matchType: data.matchType ?? null,
    setupRequired: data.setupRequired,
    message: data.message,
  };
}
