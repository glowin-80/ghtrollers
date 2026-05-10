import { NextResponse } from "next/server";
import webPush from "web-push";
import { getNewlyUnlockedAchievementByValue } from "@/lib/achievements";
import { recordAchievementUnlocks } from "@/lib/achievement-unlocks";
import {
  createPushServiceRoleSupabaseClient,
  getAuthenticatedPushMemberContext,
  getRequiredVapidEnv,
  type PushSubscriptionRow,
} from "@/lib/push-notification-server";

export const runtime = "nodejs";

type SendFishingSpotAchievementRequestBody = {
  spotId?: unknown;
};

type FishingSpotSource = {
  id: string;
  created_by_member_id: string | null;
  created_by_name: string | null;
  status: string | null;
  is_private: boolean | null;
  approved_at: string | null;
  created_at: string | null;
};

type WebPushSendError = Error & {
  statusCode?: number;
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
  if (!trimmedName) return "En medlem";
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

  const body = (await request.json().catch(() => null)) as SendFishingSpotAchievementRequestBody | null;
  const spotId = typeof body?.spotId === "string" ? body.spotId.trim() : "";

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
    .select("id, created_by_member_id, created_by_name, status, is_private, approved_at, created_at")
    .eq("id", spotId)
    .maybeSingle();

  if (spotError) {
    console.error("Could not read approved fishing spot for achievement push notification.", spotError);
    return NextResponse.json({ error: "Could not read fishing spot." }, { status: 500 });
  }

  if (!spotData) {
    return NextResponse.json({ error: "Fishing spot not found." }, { status: 404 });
  }

  const spot = spotData as FishingSpotSource;
  const ownerMemberId = spot.created_by_member_id?.trim() || null;

  if (spot.status !== "approved" || spot.is_private === true || !ownerMemberId) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Only approved public fishing spots with an owner can unlock achievements.",
    });
  }

  const { data: spotsData, error: spotsError } = await serviceSupabase
    .from("fishing_spots")
    .select("id")
    .eq("created_by_member_id", ownerMemberId)
    .eq("status", "approved")
    .or("is_private.is.false,is_private.is.null");

  if (spotsError) {
    console.error("Could not count approved public fishing spots for achievement push notification.", spotsError);
    return NextResponse.json({ error: "Could not count fishing spots." }, { status: 500 });
  }

  const currentCount = spotsData?.length ?? 0;
  const previousCount = Math.max(currentCount - 1, 0);
  const newlyUnlockedAchievement = getNewlyUnlockedAchievementByValue(
    previousCount,
    currentCount,
    "fishing_spots"
  );

  if (!newlyUnlockedAchievement) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "No fishing spot achievement threshold was crossed.",
      beforeCount: previousCount,
      afterCount: currentCount,
    });
  }

  const unlockResults = await recordAchievementUnlocks(serviceSupabase, {
    memberId: ownerMemberId,
    achievements: [newlyUnlockedAchievement],
    unlockedAt: spot.approved_at ?? spot.created_at,
    source: "live",
    sourceTable: "fishing_spots",
    sourceId: spot.id,
  });

  if (!unlockResults[0]?.inserted) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Achievement was already registered.",
      beforeCount: previousCount,
      afterCount: currentCount,
    });
  }

  webPush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { data: subscriptionsData, error: subscriptionsError } = await serviceSupabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh_key, auth_key")
    .eq("is_active", true)
    .eq("notify_new_achievement", true);

  if (subscriptionsError) {
    console.error("Could not read achievement push subscriptions.", subscriptionsError);
    return NextResponse.json({ error: "Could not read push subscriptions." }, { status: 500 });
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
            keys: { p256dh: subscription.p256dh_key, auth: subscription.auth_key },
          },
          payload
        );
        sentCount += 1;
      } catch (error) {
        failedCount += 1;
        console.error("Could not send fishing spot achievement push notification.", error);
        if (isInactiveSubscriptionError(error)) inactiveSubscriptionIds.push(subscription.id);
      }
    })
  );

  if (inactiveSubscriptionIds.length > 0) {
    await serviceSupabase
      .from("push_subscriptions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in("id", Array.from(new Set(inactiveSubscriptionIds)));
  }

  return NextResponse.json({
    ok: true,
    skipped: false,
    achievementTitle: newlyUnlockedAchievement.title,
    beforeCount: previousCount,
    afterCount: currentCount,
    sentCount,
    failedCount,
    inactiveCount: inactiveSubscriptionIds.length,
  });
}
