import webPush from "web-push";
import {
  createPushServiceRoleSupabaseClient,
  getRequiredVapidEnv,
  type PushSubscriptionRow,
} from "@/lib/push-notification-server";

type WebPushSendError = Error & {
  statusCode?: number;
  body?: unknown;
};

type AdminMemberRow = {
  id: string;
};

function isInactiveSubscriptionError(error: unknown) {
  const statusCode =
    typeof (error as WebPushSendError | null)?.statusCode === "number"
      ? (error as WebPushSendError).statusCode
      : null;

  return statusCode === 404 || statusCode === 410;
}

export async function sendAdminPendingMemberBadgePush() {
  const vapid = getRequiredVapidEnv();

  if (!vapid) {
    return {
      ok: false,
      error: "Push notifications are not configured with VAPID keys.",
    };
  }

  const serviceSupabase = createPushServiceRoleSupabaseClient();

  if (!serviceSupabase) {
    return {
      ok: false,
      error: "Push notifications are not configured with service role key.",
    };
  }

  const { count: pendingMemberCount, error: countError } = await serviceSupabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("is_active", false)
    .eq("is_admin", false);

  if (countError) {
    console.error("Could not read pending member count for admin badge push.", countError);
    return { ok: false, error: "Could not read pending member count." };
  }

  const safePendingMemberCount = pendingMemberCount ?? 0;

  if (safePendingMemberCount <= 0) {
    return {
      ok: true,
      skipped: true,
      reason: "No pending members.",
      pendingMemberCount: safePendingMemberCount,
      sentCount: 0,
      failedCount: 0,
    };
  }

  const { data: adminMembersData, error: adminMembersError } =
    await serviceSupabase
      .from("members")
      .select("id")
      .eq("is_active", true)
      .or("is_admin.eq.true,is_super_admin.eq.true");

  if (adminMembersError) {
    console.error("Could not read admins for pending member badge push.", adminMembersError);
    return { ok: false, error: "Could not read admins." };
  }

  const adminMemberIds = ((adminMembersData ?? []) as AdminMemberRow[])
    .map((member) => member.id)
    .filter(Boolean);

  if (adminMemberIds.length === 0) {
    return {
      ok: true,
      skipped: true,
      reason: "No admins with active membership.",
      pendingMemberCount: safePendingMemberCount,
      sentCount: 0,
      failedCount: 0,
    };
  }

  const { data: subscriptionsData, error: subscriptionsError } =
    await serviceSupabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh_key, auth_key")
      .eq("is_active", true)
      .in("member_id", adminMemberIds);

  if (subscriptionsError) {
    console.error("Could not read admin push subscriptions.", subscriptionsError);
    return { ok: false, error: "Could not read push subscriptions." };
  }

  const subscriptions = (subscriptionsData ?? []) as PushSubscriptionRow[];

  if (subscriptions.length === 0) {
    return {
      ok: true,
      skipped: true,
      reason: "No active admin push subscriptions.",
      pendingMemberCount: safePendingMemberCount,
      sentCount: 0,
      failedCount: 0,
    };
  }

  webPush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const payload = JSON.stringify({
    title: "Ny medlemsansökan",
    body: "Det finns en medlemsansökan att hantera.",
    url: "/min-sida",
    icon: "/header.png",
    badge: "/header.png",
    suppressNotification: true,
    appBadgeCount: safePendingMemberCount,
    badgeKind: "admin_pending_members",
  });

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
        console.error("Could not send admin pending member badge push.", error);

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
      console.error("Could not deactivate stale admin push subscriptions.", deactivateError);
    }
  }

  return {
    ok: true,
    pendingMemberCount: safePendingMemberCount,
    sentCount,
    failedCount,
  };
}
