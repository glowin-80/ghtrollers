import { NextResponse } from "next/server";
import {
  defaultPushNotificationPreferences,
  getAuthenticatedPushMemberContext,
  normalizePushPreferences,
} from "@/lib/push-notification-server";

type SubscriptionStatusRow = {
  endpoint: string | null;
  is_active: boolean | null;
  notify_new_catch: boolean | null;
  notify_new_achievement: boolean | null;
  notify_new_all_time_high: boolean | null;
};

type AdminSubscriptionRow = {
  member_id: string | null;
  endpoint: string | null;
};

export async function GET(request: Request) {
  const context = await getAuthenticatedPushMemberContext(request);

  if (!context) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: ownSubscriptions, error: ownError } = await context.supabase
    .from("push_subscriptions")
    .select(
      "endpoint, is_active, notify_new_catch, notify_new_achievement, notify_new_all_time_high"
    )
    .eq("member_id", context.userId)
    .order("updated_at", { ascending: false });

  if (ownError) {
    return NextResponse.json(
      { error: "Could not read push notification status." },
      { status: 500 }
    );
  }

  const typedOwnSubscriptions =
    (ownSubscriptions ?? []) as SubscriptionStatusRow[];
  const activeSubscriptions = typedOwnSubscriptions.filter(
    (subscription) => subscription.is_active
  );
  const primarySubscription = activeSubscriptions[0] ?? typedOwnSubscriptions[0];

  const response: {
    isSupported: true;
    isActive: boolean;
    activeDeviceCount: number;
    preferences: typeof defaultPushNotificationPreferences;
    adminStats: null | {
      activeMemberCount: number;
      activeDeviceCount: number;
    };
  } = {
    isSupported: true,
    isActive: activeSubscriptions.length > 0,
    activeDeviceCount: activeSubscriptions.length,
    preferences: normalizePushPreferences(primarySubscription),
    adminStats: null,
  };

  if (context.member?.is_super_admin) {
    const { data: allActiveSubscriptions, error: adminError } =
      await context.supabase
        .from("push_subscriptions")
        .select("member_id, endpoint")
        .eq("is_active", true);

    if (!adminError) {
      const typedAllActiveSubscriptions =
        (allActiveSubscriptions ?? []) as AdminSubscriptionRow[];
      const activeMemberIds = new Set(
        typedAllActiveSubscriptions
          .map((subscription) => subscription.member_id)
          .filter((memberId): memberId is string => Boolean(memberId))
      );

      response.adminStats = {
        activeMemberCount: activeMemberIds.size,
        activeDeviceCount: typedAllActiveSubscriptions.length,
      };
    }
  }

  return NextResponse.json(response);
}
