import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  isValidCoordinate,
  normalizeWaterKey,
  WATER_ACHIEVEMENT_MAX_DISTANCE_M,
  WATER_DISPLAY_MAX_DISTANCE_M,
} from "@/lib/water-identification";

export const runtime = "nodejs";

type WaterRpcRow = {
  water_name?: string | null;
  water_id?: string | null;
  distance_m?: number | null;
  match_type?: "inside" | "nearby" | null;
  achievement_eligible?: boolean | null;
  source?: string | null;
};

function getCoordinate(request: Request, key: "lat" | "lng") {
  const url = new URL(request.url);
  const value = url.searchParams.get(key);

  if (!value) {
    return Number.NaN;
  }

  return Number(value);
}

function normalizeRpcResult(data: unknown): WaterRpcRow | null {
  if (Array.isArray(data)) {
    return (data[0] as WaterRpcRow | undefined) ?? null;
  }

  if (data && typeof data === "object") {
    return data as WaterRpcRow;
  }

  return null;
}

function getAchievementEligible(row: WaterRpcRow | null) {
  if (!row?.water_name) {
    return false;
  }

  if (typeof row.achievement_eligible === "boolean") {
    return row.achievement_eligible;
  }

  if (typeof row.distance_m === "number") {
    return row.distance_m <= WATER_ACHIEVEMENT_MAX_DISTANCE_M;
  }

  return false;
}

export async function GET(request: Request) {
  const lat = getCoordinate(request, "lat");
  const lng = getCoordinate(request, "lng");

  if (!isValidCoordinate(lat, lng)) {
    return NextResponse.json(
      {
        found: false,
        name: null,
        waterKey: null,
        source: null,
        distanceM: null,
        achievementEligible: false,
        matchType: null,
        message: "Ogiltiga koordinater.",
      },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      found: false,
      name: null,
      waterKey: null,
      source: null,
      distanceM: null,
      achievementEligible: false,
      matchType: null,
      setupRequired: true,
      message: "Vattenidentifiering kräver Supabase service role och databasfunktion.",
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const { data, error } = await supabase.rpc("identify_water_body", {
      lat,
      lng,
    });

    if (error) {
      console.error("identify_water_body rpc error", error);

      return NextResponse.json({
        found: false,
        name: null,
        waterKey: null,
        source: null,
        distanceM: null,
        achievementEligible: false,
        matchType: null,
        setupRequired: true,
        message: "Databasfunktionen identify_water_body saknas eller svarade inte.",
      });
    }

    const row = normalizeRpcResult(data);
    const name = row?.water_name ?? null;
    const distanceM = row?.distance_m ?? null;
    const achievementEligible = getAchievementEligible(row);
    const matchType = row?.match_type ?? (distanceM === 0 ? "inside" : "nearby");

    if (!name) {
      return NextResponse.json({
        found: false,
        name: null,
        waterKey: null,
        source: row?.source ?? "smhi_svar2016",
        distanceM,
        achievementEligible: false,
        matchType: null,
      });
    }

    if (typeof distanceM === "number" && distanceM > WATER_DISPLAY_MAX_DISTANCE_M) {
      return NextResponse.json({
        found: false,
        name: null,
        waterKey: null,
        source: row?.source ?? "smhi_svar2016",
        distanceM,
        achievementEligible: false,
        matchType: null,
      });
    }

    return NextResponse.json({
      found: true,
      name,
      waterKey: normalizeWaterKey(name),
      source: row?.source ?? "smhi_svar2016",
      distanceM,
      achievementEligible,
      matchType,
    });
  } catch (error) {
    console.error("Could not identify water body", error);

    return NextResponse.json({
      found: false,
      name: null,
      waterKey: null,
      source: null,
      distanceM: null,
      achievementEligible: false,
      matchType: null,
      setupRequired: true,
      message: "Vattenidentifiering är inte färdigkopplad ännu.",
    });
  }
}
