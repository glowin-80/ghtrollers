import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const FISHING_SPOT_SELECT =
  "id, created_at, updated_at, created_by_member_id, created_by_name, latitude, longitude, title, notes, is_private, status, pending_latitude, pending_longitude, pending_title, pending_notes, pending_is_private, has_pending_edit, approved_at, approved_by_member_id";

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

function getRequiredSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    serviceRoleKey,
  };
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isValidCoordinate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

export async function POST(request: Request) {
  const env = getRequiredSupabaseEnv();

  if (!env) {
    return NextResponse.json(
      { error: "Supabase servermiljö saknas." },
      { status: 500 }
    );
  }

  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(
      { error: "Du behöver vara inloggad." },
      { status: 401 }
    );
  }

  const userSupabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userSupabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { error: "Du behöver vara inloggad." },
      { status: 401 }
    );
  }

  const { data: member, error: memberError } = await userSupabase
    .from("members")
    .select("id, name, email, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (memberError) {
    return NextResponse.json(
      { error: "Kunde inte kontrollera medlemskap." },
      { status: 500 }
    );
  }

  if (!member || member.is_active !== true) {
    return NextResponse.json(
      { error: "Du behöver vara aktiv medlem för att markera en fiskeplats." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        latitude?: unknown;
        longitude?: unknown;
        title?: unknown;
        notes?: unknown;
      }
    | null;

  if (!body || !isValidCoordinate(body.latitude) || !isValidCoordinate(body.longitude)) {
    return NextResponse.json(
      { error: "Välj en giltig position via GPS eller kartan." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const serviceSupabase = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const createdByName =
    normalizeText(member.name) || normalizeText(member.email) || "Medlem";

  const { data: spot, error: insertError } = await serviceSupabase
    .from("fishing_spots")
    .insert({
      created_by_member_id: member.id,
      created_by_name: createdByName,
      latitude: body.latitude,
      longitude: body.longitude,
      title: normalizeText(body.title),
      notes: normalizeText(body.notes),
      is_private: true,
      status: "approved",
      approved_at: now,
      approved_by_member_id: member.id,
    })
    .select(FISHING_SPOT_SELECT)
    .single();

  if (insertError) {
    console.error(insertError);
    return NextResponse.json(
      { error: "Kunde inte spara privat fiskeplats." },
      { status: 500 }
    );
  }

  return NextResponse.json({ spot });
}