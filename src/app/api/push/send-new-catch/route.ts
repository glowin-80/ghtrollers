import { NextResponse } from "next/server";
import webPush from "web-push";
import {
  createPushServiceRoleSupabaseClient,
  getAuthenticatedPushMemberContext,
  getRequiredVapidEnv,
  type PushSubscriptionRow,
} from "@/lib/push-notification-server";
import { formatWeightFromGrams, getFishLabel } from "@/lib/catch-display";

export const runtime = "nodejs";

type SendNewCatchRequestBody = {
  catchId?: unknown;
};

type ApprovedCatchNotificationSource = {
  id: string;
  caught_for: string | null;
  fish_type: string | null;
  fine_fish_type: string | null;
  weight_g: number | null;
  status: string | null;
};

type WebPushSendError = Error & {
  statusCode?: number;
  body?: unknown;
};

function isInactiveSubscriptionError(error: unknown) {
  const statusCode =
    typeof (error as WebPushSendError | null)?.statusCode === "number"
      ? (error as WebPushSendError).statusCode
      : null;

  return statusCode === 404 || statusCode === 410;
}

function buildNotificationPayload(catchItem: ApprovedCatchNotificationSource) {
  const caughtFor = catchItem.caught_for?.trim() || "En medlem";
  const fishLabel = getFishLabel({
    fish_type: catchItem.fish_type || "Fångst",
    fine_fish_type: catchItem.fine_fish_type,
    weight_g: catchItem.weight_g || 0,
  });
  const weightLabel = formatWeightFromGrams(catchItem.weight_g);

  return {
    title: "Ny godkänd fångst 🎣",
    body: `${caughtFor} har fått ${fishLabel} på ${weightLabel}.`,
    url: `/fangst/${catchItem.id}`,
    icon: "/header.png",
    badge: "/header.png",
  };
}

export async function POST(request: Request) {
  const context = await getAuthenticatedPushMemberContext(request);

  if (!context) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (
    !context.member?.is_active ||
    (!context.member.is_admin && !context.member.is_super_admin)
  ) {
    return NextResponse.json(
      { error: "Only active admins can send push notifications." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as SendNewCatchRequestBody | null;
  const catchId = typeof body?.catchId === "string" ? body.catchId.trim() : "";

  if (!catchId) {
    return NextResponse.json({ error: "Missing catch id." }, { status: 400 });
  }

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

  const { data: catchData, error: catchError } = await serviceSupabase
    .from("catches")
    .select("id, caught_for, fish_type, fine_fish_type, weight_g, status")
    .eq("id", catchId)
    .maybeSingle();

  if (catchError) {
    console.error("Could not read approved catch for push notification.", catchError);

    return NextResponse.json(
      { error: "Could not read approved catch." },
      { status: 500 }
    );
  }

  if (!catchData) {
    return NextResponse.json({ error: "Catch not found." }, { status: 404 });
  }

  const catchItem = catchData as ApprovedCatchNotificationSource;

  if (catchItem.status !== "approved") {
    return NextResponse.json(
      { error: "Push notification can only be sent for approved catches." },
      { status: 400 }
    );
  }

  const { data: subscriptionsData, error: subscriptionsError } =
    await serviceSupabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh_key, auth_key")
      .eq("is_active", true)
      .eq("notify_new_catch", true);

  if (subscriptionsError) {
    console.error("Could not read push subscriptions.", subscriptionsError);

    return NextResponse.json(
      { error: "Could not read push subscriptions." },
      { status: 500 }
    );
  }

  const subscriptions = (subscriptionsData ?? []) as PushSubscriptionRow[];
  const payload = JSON.stringify(buildNotificationPayload(catchItem));
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
        console.error("Could not send push notification.", error);

        if (isInactiveSubscriptionError(error)) {
          inactiveSubscriptionIds.push(subscription.id);
        }
      }
    })
  );

  if (inactiveSubscriptionIds.length > 0) {
    const { error: deactivateError } = await serviceSupabase
      .from("push_subscriptions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in("id", inactiveSubscriptionIds);

    if (deactivateError) {
      console.error(
        "Could not deactivate stale push subscriptions.",
        deactivateError
      );
    }
  }

  return NextResponse.json({
    ok: true,
    sentCount,
    failedCount,
    inactiveCount: inactiveSubscriptionIds.length,
  });
}