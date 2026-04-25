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

type SendAchievementRequestBody = {
  catchId?: unknown;
};

type AchievementCatchSource = {
  id: string;
  caught_for: string | null;
  caught_for_member_id: string | null;
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

  const body = (await request.json().catch(() => null)) as SendAchievementRequestBody | null;
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

  const { data: catchData, error: catchError } = await serviceSupabase
    .from("catches")
    .select("id, caught_for, caught_for_member_id, status")
    .eq("id", catchId)
    .maybeSingle();

  if (catchError) {
    console.error("Could not read approved catch for achievement push notification.", catchError);

    return NextResponse.json(
      { error: "Could not read approved catch." },
      { status: 500 }
    );
  }

  if (!catchData) {
    return NextResponse.json({ error: "Catch not found." }, { status: 404 });
  }

  const catchItem = catchData as AchievementCatchSource;

  if (catchItem.status !== "approved") {
    return NextResponse.json(
      { error: "Achievement push can only be evaluated for approved catches." },
      { status: 400 }
    );
  }

  const ownerMemberId = catchItem.caught_for_member_id?.trim() || null;

  let approvedCatchCountQuery = serviceSupabase
    .from("catches")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");

  if (ownerMemberId) {
    approvedCatchCountQuery = approvedCatchCountQuery.eq("caught_for_member_id", ownerMemberId);
  } else {
    approvedCatchCountQuery = approvedCatchCountQuery.eq("caught_for", catchItem.caught_for ?? "");
  }

  const { count: afterCount, error: countError } = await approvedCatchCountQuery;

  if (countError) {
    console.error("Could not count approved catches for achievement push notification.", countError);

    return NextResponse.json(
      { error: "Could not count approved catches." },
      { status: 500 }
    );
  }

  const currentApprovedCatchCount = afterCount ?? 0;
  const previousApprovedCatchCount = Math.max(currentApprovedCatchCount - 1, 0);
  const newlyUnlockedAchievement = getNewlyUnlockedAchievementByValue(
    previousApprovedCatchCount,
    currentApprovedCatchCount,
    "reported_catches"
  );

  if (!newlyUnlockedAchievement) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "No achievement threshold was crossed.",
      beforeCount: previousApprovedCatchCount,
      afterCount: currentApprovedCatchCount,
    });
  }

  webPush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { data: subscriptionsData, error: subscriptionsError } =
    await serviceSupabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh_key, auth_key")
      .eq("is_active", true)
      .eq("notify_new_achievement", true);

  if (subscriptionsError) {
    console.error("Could not read achievement push subscriptions.", subscriptionsError);

    return NextResponse.json(
      { error: "Could not read push subscriptions." },
      { status: 500 }
    );
  }

  const subscriptions = (subscriptionsData ?? []) as PushSubscriptionRow[];
  const payload = JSON.stringify(
    buildNotificationPayload({
      memberName: catchItem.caught_for,
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
        console.error("Could not send achievement push notification.", error);

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
        "Could not deactivate stale achievement push subscriptions.",
        deactivateError
      );
    }
  }

  return NextResponse.json({
    ok: true,
    skipped: false,
    achievementTitle: newlyUnlockedAchievement.title,
    beforeCount: previousApprovedCatchCount,
    afterCount: currentApprovedCatchCount,
    sentCount,
    failedCount,
    inactiveCount: inactiveSubscriptionIds.length,
  });
}
