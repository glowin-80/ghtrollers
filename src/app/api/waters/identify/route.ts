import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isValidCoordinate, normalizeWaterKey } from "@/lib/water-identification";

export const runtime = "nodejs";

type WaterRpcRow = {
  name?: string | null;
  water_name?: string | null;
  water_key?: string | null;
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
      p_lat: lat,
      p_lng: lng,
    });

    if (error) {
      return NextResponse.json({
        found: false,
        name: null,
        waterKey: null,
        source: null,
        setupRequired: true,
        message: "Databasfunktionen identify_water_body saknas eller svarade inte.",
      });
    }

    const row = normalizeRpcResult(data);
    const name = row?.name ?? row?.water_name ?? null;

    if (!name) {
      return NextResponse.json({
        found: false,
        name: null,
        waterKey: null,
        source: row?.source ?? "smhi_svar2016",
      });
    }

    return NextResponse.json({
      found: true,
      name,
      waterKey: row?.water_key ?? normalizeWaterKey(name),
      source: row?.source ?? "smhi_svar2016",
    });
  } catch {
    return NextResponse.json({
      found: false,
      name: null,
      waterKey: null,
      source: null,
      setupRequired: true,
      message: "Vattenidentifiering är inte färdigkopplad ännu.",
    });
  }
}
