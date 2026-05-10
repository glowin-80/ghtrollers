import { NextResponse } from "next/server";
import webPush from "web-push";
import { getNewlyUnlockedAchievementByValue } from "@/lib/achievements";
import {
  createPushServiceRoleSupabaseClient,
  getAuthenticatedPushMemberContext,
  getRequiredVapidEnv,
  type PushSubscriptionRow,
} from "@/lib/push-notification-server";

export const runtime = "nodejs";

type SendFishingSpotAchievementRequestBody = {
  spotId?: unknown;
  beforeEligible?: unknown;
};

type FishingSpotAchievementSource = {
  id: string;
  created_by_member_id: string | null;
  created_by_name: string | null;
  status: string | null;
  is_private: boolean | null;
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

function getFirstName(name: string | null) {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    return "En medlem";
  }

  return trimmedName.split(/\s+/)[0] || "En medlem";
}

function buildNotificationPayload(params: {
  memberName: string | null;
  achievementTitle: string;
}) {
  return {
    title: "Nytt achievement upplåst 🏆",
    body: `${getFirstName(params.memberName)} har låst upp ${params.achievementTitle}.`,
    url: "/achievements",
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

  if (
    !context.member?.is_active ||
    (!context.member.is_admin && !context.member.is_super_admin)
  ) {
    return NextResponse.json(
      { error: "Only active admins can send push notifications." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | SendFishingSpotAchievementRequestBody
    | null;
  const spotId = typeof body?.spotId === "string" ? body.spotId.trim() : "";
  const beforeEligible = body?.beforeEligible === true;

  if (!spotId) {
    return NextResponse.json({ error: "Missing fishing spot id." }, { status: 400 });
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

  const { data: spotData, error: spotError } = await serviceSupabase
    .from("fishing_spots")
    .select("id, created_by_member_id, created_by_name, status, is_private")
    .eq("id", spotId)
    .maybeSingle();

  if (spotError) {
    console.error("Could not read fishing spot for achievement push notification.", spotError);

    return NextResponse.json(
      { error: "Could not read fishing spot." },
      { status: 500 }
    );
  }

  if (!spotData) {
    return NextResponse.json({ error: "Fishing spot not found." }, { status: 404 });
  }

  const spot = spotData as FishingSpotAchievementSource;

  if (spot.status !== "approved" || spot.is_private === true) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Fishing spot is not an approved public spot.",
    });
  }

  const ownerMemberId = spot.created_by_member_id?.trim() || null;

  if (!ownerMemberId) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Fishing spot has no member owner.",
    });
  }

  const { count: afterCount, error: countError } = await serviceSupabase
    .from("fishing_spots")
    .select("id", { count: "exact", head: true })
    .eq("created_by_member_id", ownerMemberId)
    .eq("status", "approved")
    .or("is_private.is.false,is_private.is.null");

  if (countError) {
    console.error("Could not count approved public fishing spots.", countError);

    return NextResponse.json(
      { error: "Could not count approved public fishing spots." },
      { status: 500 }
    );
  }

  const currentApprovedPublicSpotCount = afterCount ?? 0;
  const previousApprovedPublicSpotCount = beforeEligible
    ? currentApprovedPublicSpotCount
    : Math.max(currentApprovedPublicSpotCount - 1, 0);

  const newlyUnlockedAchievement = getNewlyUnlockedAchievementByValue(
    previousApprovedPublicSpotCount,
    currentApprovedPublicSpotCount,
    "fishing_spots"
  );

  if (!newlyUnlockedAchievement) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "No fishing spot achievement threshold was crossed.",
      beforeCount: previousApprovedPublicSpotCount,
      afterCount: currentApprovedPublicSpotCount,
    });
  }

  webPush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { data: subscriptionsData, error: subscriptionsError } = await serviceSupabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh_key, auth_key")
    .eq("is_active", true)
    .eq("notify_new_achievement", true);

  if (subscriptionsError) {
    console.error("Could not read fishing spot achievement push subscriptions.", subscriptionsError);

    return NextResponse.json(
      { error: "Could not read push subscriptions." },
      { status: 500 }
    );
  }

  const subscriptions = (subscriptionsData ?? []) as PushSubscriptionRow[];
  const payload = JSON.stringify(
    buildNotificationPayload({
      memberName: spot.created_by_name,
      achievementTitle: newlyUnlockedAchievement.title,
    })
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
        console.error("Could not send fishing spot achievement push notification.", error);

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
      console.error("Could not deactivate stale fishing spot achievement push subscriptions.", deactivateError);
    }
  }

  return NextResponse.json({
    ok: true,
    skipped: false,
    achievementTitle: newlyUnlockedAchievement.title,
    beforeCount: previousApprovedPublicSpotCount,
    afterCount: currentApprovedPublicSpotCount,
    sentCount,
    failedCount,
  });
}
