import { NextResponse } from "next/server";
import webPush from "web-push";
import { getNewlyUnlockedAchievementByValue, type AchievementDefinition } from "@/lib/achievements";
import { recordAchievementUnlocks } from "@/lib/achievement-unlocks";
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
  water_name: string | null;
  water_key: string | null;
  created_at: string | null;
};

type AchievementCatchWaterSource = {
  id: string;
  water_name: string | null;
  water_key: string | null;
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

function normalizeWaterName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("sv-SE");
}

function getUniqueWaterCount(catches: AchievementCatchWaterSource[]) {
  const uniqueWaters = new Set<string>();

  catches.forEach((catchItem) => {
    const waterKey = catchItem.water_key?.trim();

    if (waterKey) {
      uniqueWaters.add(`key:${waterKey}`);
      return;
    }

    const waterName = catchItem.water_name
      ? normalizeWaterName(catchItem.water_name)
      : "";

    if (waterName) {
      uniqueWaters.add(`name:${waterName}`);
    }
  });

  return uniqueWaters.size;
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
    .select("id, caught_for, caught_for_member_id, status, water_name, water_key, created_at")
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

  let ownerMemberId = catchItem.caught_for_member_id?.trim() || null;

  if (!ownerMemberId && catchItem.caught_for?.trim()) {
    const { data: ownerMemberData, error: ownerMemberError } = await serviceSupabase
      .from("members")
      .select("id")
      .eq("name", catchItem.caught_for.trim())
      .maybeSingle();

    if (ownerMemberError) {
      console.error("Could not resolve achievement owner member.", ownerMemberError);
    } else {
      ownerMemberId = typeof ownerMemberData?.id === "string" ? ownerMemberData.id : null;
    }
  }

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
  const newlyUnlockedAchievements: AchievementDefinition[] = [];

  const newlyUnlockedCatchAchievement = getNewlyUnlockedAchievementByValue(
    previousApprovedCatchCount,
    currentApprovedCatchCount,
    "reported_catches"
  );

  if (newlyUnlockedCatchAchievement) {
    newlyUnlockedAchievements.push(newlyUnlockedCatchAchievement);
  }

  if (catchItem.water_key || catchItem.water_name) {
    let approvedWaterCatchesQuery = serviceSupabase
      .from("catches")
      .select("id, water_name, water_key")
      .eq("status", "approved")
      .or("water_name.not.is.null,water_key.not.is.null");

    if (ownerMemberId) {
      approvedWaterCatchesQuery = approvedWaterCatchesQuery.eq(
        "caught_for_member_id",
        ownerMemberId
      );
    } else {
      approvedWaterCatchesQuery = approvedWaterCatchesQuery.eq(
        "caught_for",
        catchItem.caught_for ?? ""
      );
    }

    const { data: waterCatchesData, error: waterCountError } = await approvedWaterCatchesQuery;

    if (waterCountError) {
      console.error(
        "Could not count unique waters for achievement push notification.",
        waterCountError
      );

      return NextResponse.json(
        { error: "Could not count unique waters." },
        { status: 500 }
      );
    }

    const currentWaterCatches = (waterCatchesData ?? []) as AchievementCatchWaterSource[];
    const previousWaterCatches = currentWaterCatches.filter(
      (waterCatch) => waterCatch.id !== catchItem.id
    );
    const currentUniqueWaterCount = getUniqueWaterCount(currentWaterCatches);
    const previousUniqueWaterCount = getUniqueWaterCount(previousWaterCatches);
    const newlyUnlockedWaterAchievement = getNewlyUnlockedAchievementByValue(
      previousUniqueWaterCount,
      currentUniqueWaterCount,
      "waters"
    );

    if (newlyUnlockedWaterAchievement) {
      newlyUnlockedAchievements.push(newlyUnlockedWaterAchievement);
    }
  }

  if (!newlyUnlockedAchievements.length) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "No achievement threshold was crossed.",
      beforeCount: previousApprovedCatchCount,
      afterCount: currentApprovedCatchCount,
    });
  }

  if (!ownerMemberId) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Achievement owner member could not be resolved.",
      beforeCount: previousApprovedCatchCount,
      afterCount: currentApprovedCatchCount,
    });
  }

  const unlockResults = await recordAchievementUnlocks(serviceSupabase, {
    memberId: ownerMemberId,
    achievements: newlyUnlockedAchievements,
    unlockedAt: catchItem.created_at,
    source: "live",
    sourceTable: "catches",
    sourceId: catchItem.id,
  });

  const achievementsToNotify = newlyUnlockedAchievements.filter((_, index) =>
    unlockResults[index]?.inserted
  );

  if (!achievementsToNotify.length) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Achievement was already registered.",
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
  let sentCount = 0;
  let failedCount = 0;
  const inactiveSubscriptionIds: string[] = [];

  await Promise.all(
    achievementsToNotify.flatMap((achievement) => {
      const payload = JSON.stringify(
        buildNotificationPayload({
          memberName: catchItem.caught_for,
          achievementTitle: achievement.title,
        })
      );

      return subscriptions.map(async (subscription) => {
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
      });
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
        "Could not deactivate stale achievement push subscriptions.",
        deactivateError
      );
    }
  }

  return NextResponse.json({
    ok: true,
    skipped: false,
    achievementTitle: achievementsToNotify.at(-1)?.title ?? null,
    achievementTitles: achievementsToNotify.map((achievement) => achievement.title),
    beforeCount: previousApprovedCatchCount,
    afterCount: currentApprovedCatchCount,
    sentCount,
    failedCount,
    inactiveCount: inactiveSubscriptionIds.length,
  });
}
