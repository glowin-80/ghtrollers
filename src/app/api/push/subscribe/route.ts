import { NextResponse } from "next/server";
import {
  getAuthenticatedPushMemberContext,
  normalizePushPreferences,
} from "@/lib/push-notification-server";

type PushSubscriptionJson = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function isValidPushSubscription(value: unknown): value is PushSubscriptionJson {
  if (!value || typeof value !== "object") {
    return false;
  }

  const subscription = value as PushSubscriptionJson;

  return (
    typeof subscription.endpoint === "string" &&
    subscription.endpoint.length > 0 &&
    typeof subscription.keys?.p256dh === "string" &&
    subscription.keys.p256dh.length > 0 &&
    typeof subscription.keys?.auth === "string" &&
    subscription.keys.auth.length > 0
  );
}

export async function POST(request: Request) {
  const context = await getAuthenticatedPushMemberContext(request);

  if (!context) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!context.member?.is_active) {
    return NextResponse.json(
      { error: "Only active members can enable push notifications." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const subscription = (body as { subscription?: unknown }).subscription;

  if (!isValidPushSubscription(subscription)) {
    return NextResponse.json(
      { error: "Invalid push subscription." },
      { status: 400 }
    );
  }

  const preferences = normalizePushPreferences(
    (body as { preferences?: Record<string, unknown> }).preferences ?? null
  );
  const now = new Date().toISOString();

  const { error } = await context.supabase.from("push_subscriptions").upsert(
    {
      member_id: context.userId,
      endpoint: subscription.endpoint,
      p256dh_key: subscription.keys.p256dh,
      auth_key: subscription.keys.auth,
      user_agent: request.headers.get("user-agent"),
      is_active: true,
      last_seen_at: now,
      updated_at: now,
      ...preferences,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json(
      { error: "Could not save push subscription." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
