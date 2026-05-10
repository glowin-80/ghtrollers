import { NextResponse } from "next/server";
import webPush from "web-push";
import {
  createPushServiceRoleSupabaseClient,
  getAuthenticatedPushMemberContext,
  getRequiredVapidEnv,
  type PushSubscriptionRow,
} from "@/lib/push-notification-server";

export const runtime = "nodejs";

type SendBroadcastRequestBody = {
  title?: unknown;
  body?: unknown;
  url?: unknown;
};

type WebPushSendError = Error & {
  statusCode?: number;
  body?: unknown;
};

const DEFAULT_BROADCAST_TITLE = "Gäddhäng Trollers";
const DEFAULT_BROADCAST_BODY =
  "🎉 Nytt achievement upplåst! Nu är kategorin Fiskade vatten aktiv i Gäddhäng.";
const DEFAULT_BROADCAST_URL = "/achievements";
const MAX_TITLE_LENGTH = 80;
const MAX_BODY_LENGTH = 240;

function isInactiveSubscriptionError(error: unknown) {
  const statusCode =
    typeof (error as WebPushSendError | null)?.statusCode === "number"
      ? (error as WebPushSendError).statusCode
      : null;

  return statusCode === 404 || statusCode === 410;
}

function normalizeText(value: unknown, fallback: string, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return fallback;
  }

  return text.slice(0, maxLength);
}

function normalizeUrl(value: unknown) {
  const url = typeof value === "string" ? value.trim() : "";

  if (!url) {
    return DEFAULT_BROADCAST_URL;
  }

  if (!url.startsWith("/")) {
    return DEFAULT_BROADCAST_URL;
  }

  if (url.startsWith("//")) {
    return DEFAULT_BROADCAST_URL;
  }

  return url.slice(0, 120);
}

function buildNotificationPayload(params: {
  title: string;
  body: string;
  url: string;
}) {
  return {
    title: params.title,
    body: params.body,
    url: params.url,
    icon: "/header.png",
    badge: "/header.png",
    appBadgeAction: "increment",
  };
}

export async function POST(request: Request) {
  const context = await getAuthenticatedPushMemberContext(request);

  if (!context) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!context.member?.is_active || !context.member.is_super_admin) {
    return NextResponse.json(
      { error: "Only Super admin can send broadcast push notifications." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as SendBroadcastRequestBody | null;
  const title = normalizeText(
    body?.title,
    DEFAULT_BROADCAST_TITLE,
    MAX_TITLE_LENGTH
  );
  const notificationBody = normalizeText(
    body?.body,
    DEFAULT_BROADCAST_BODY,
    MAX_BODY_LENGTH
  );
  const url = normalizeUrl(body?.url);

  const vapid = getRequiredVapidEnv();

  if (!vapid) {
    return NextResponse.json(
      { error: "Push notifications are not configured with VAPID keys." },
      { status: 500 }
    );
  }

  const serviceSupabase = createPushServiceRoleSupabaseClient();

  if (!serviceSupabase) {
    return NextResponse.json(
      { error: "Push notifications are not configured with service role key." },
      { status: 500 }
    );
  }

  webPush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { data: subscriptionsData, error: subscriptionsError } =
    await serviceSupabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh_key, auth_key")
      .eq("is_active", true);

  if (subscriptionsError) {
    console.error("Could not read broadcast push subscriptions.", subscriptionsError);

    return NextResponse.json(
      { error: "Could not read push subscriptions." },
      { status: 500 }
    );
  }

  const subscriptions = (subscriptionsData ?? []) as PushSubscriptionRow[];
  const payload = JSON.stringify(
    buildNotificationPayload({ title, body: notificationBody, url })
  );
  let sentCount = 0;
  let failedCount = 0;
  const inactiveSubscriptionIds: string[] = [];

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh_key,
              auth: subscription.auth_key,
            },
          },
          payload
        );

        sentCount += 1;
      } catch (error) {
        failedCount += 1;
        console.error("Could not send broadcast push notification.", error);

        if (isInactiveSubscriptionError(error)) {
          inactiveSubscriptionIds.push(subscription.id);
        }
      }
    })
  );

  if (inactiveSubscriptionIds.length > 0) {
    const uniqueInactiveSubscriptionIds = Array.from(new Set(inactiveSubscriptionIds));
    const { error: deactivateError } = await serviceSupabase
      .from("push_subscriptions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in("id", uniqueInactiveSubscriptionIds);

    if (deactivateError) {
      console.error(
        "Could not deactivate stale broadcast push subscriptions.",
        deactivateError
      );
    }
  }

  return NextResponse.json({
    ok: true,
    sentCount,
    failedCount,
    inactiveCount: inactiveSubscriptionIds.length,
    totalActiveSubscriptions: subscriptions.length,
  });
}
