import { NextResponse } from "next/server";
import webPush from "web-push";
import { detectAllTimeHighPushEvent } from "@/lib/all-time-high-push";
import {
  createPushServiceRoleSupabaseClient,
  getAuthenticatedPushMemberContext,
  getRequiredVapidEnv,
  type PushSubscriptionRow,
} from "@/lib/push-notification-server";
import type { Catch, Member } from "@/types/home";

export const runtime = "nodejs";

type SendAllTimeHighRequestBody = {
  catchId?: unknown;
};

type WebPushSendError = Error & {
  statusCode?: number;
  body?: unknown;
};

type CatchRow = {
  id: string;
  caught_for: string | null;
  caught_for_member_id: string | null;
  registered_by: string | null;
  registered_by_member_id: string | null;
  fish_type: string | null;
  fine_fish_type: string | null;
  weight_g: number | null;
  catch_date: string | null;
  location_name: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  fishing_method: string | null;
  live_scope: boolean | null;
  caught_abroad: boolean | null;
  is_location_private: boolean | null;
  original_image_size_bytes: number | null;
  compressed_image_size_bytes: number | null;
  status: string | null;
  created_at: string | null;
};

type MemberRow = {
  id: string;
  name: string | null;
  category: string | null;
  email: string | null;
  is_admin: boolean | null;
  is_super_admin: boolean | null;
  is_active: boolean | null;
  member_role: string | null;
  created_at: string | null;
  profile_image_url: string | null;
};

const CATCH_SELECT =
  "id, caught_for, caught_for_member_id, registered_by, registered_by_member_id, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, latitude, longitude, fishing_method, live_scope, caught_abroad, is_location_private, original_image_size_bytes, compressed_image_size_bytes, status, created_at";

const MEMBER_SELECT =
  "id, name, category, email, is_admin, is_super_admin, is_active, member_role, created_at, profile_image_url";

function isInactiveSubscriptionError(error: unknown) {
  const statusCode =
    typeof (error as WebPushSendError | null)?.statusCode === "number"
      ? (error as WebPushSendError).statusCode
      : null;

  return statusCode === 404 || statusCode === 410;
}

function mapCatchRow(row: CatchRow): Catch {
  return {
    id: row.id,
    caught_for: row.caught_for || "Okänd medlem",
    caught_for_member_id: row.caught_for_member_id,
    registered_by: row.registered_by || row.caught_for || "Okänd medlem",
    registered_by_member_id: row.registered_by_member_id,
    fish_type: row.fish_type || "Fångst",
    fine_fish_type: row.fine_fish_type,
    weight_g: row.weight_g ?? 0,
    catch_date: row.catch_date || "",
    location_name: row.location_name,
    image_url: row.image_url,
    latitude: row.latitude,
    longitude: row.longitude,
    fishing_method: row.fishing_method,
    live_scope: row.live_scope,
    caught_abroad: row.caught_abroad,
    is_location_private: row.is_location_private,
    original_image_size_bytes: row.original_image_size_bytes,
    compressed_image_size_bytes: row.compressed_image_size_bytes,
    status: row.status || "approved",
    created_at: row.created_at || undefined,
  };
}

function mapMemberRow(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name || "Okänd medlem",
    category: row.category || "senior",
    email: row.email,
    is_admin: Boolean(row.is_admin),
    is_super_admin: Boolean(row.is_super_admin),
    is_active: Boolean(row.is_active),
    member_role: row.member_role || "competition_member",
    created_at: row.created_at || undefined,
    profile_image_url: row.profile_image_url,
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

  const body = (await request.json().catch(() => null)) as SendAllTimeHighRequestBody | null;
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

  const [catchResult, catchesResult, membersResult] = await Promise.all([
    serviceSupabase.from("catches").select(CATCH_SELECT).eq("id", catchId).maybeSingle(),
    serviceSupabase.from("catches").select(CATCH_SELECT).eq("status", "approved"),
    serviceSupabase.from("members").select(MEMBER_SELECT).eq("is_active", true),
  ]);

  if (catchResult.error) {
    console.error("Could not read approved catch for all-time-high push notification.", catchResult.error);

    return NextResponse.json(
      { error: "Could not read approved catch." },
      { status: 500 }
    );
  }

  if (!catchResult.data) {
    return NextResponse.json({ error: "Catch not found." }, { status: 404 });
  }

  if (catchesResult.error) {
    console.error("Could not read approved catches for all-time-high push notification.", catchesResult.error);

    return NextResponse.json(
      { error: "Could not read approved catches." },
      { status: 500 }
    );
  }

  if (membersResult.error) {
    console.error("Could not read members for all-time-high push notification.", membersResult.error);

    return NextResponse.json(
      { error: "Could not read members." },
      { status: 500 }
    );
  }

  const approvedCatch = mapCatchRow(catchResult.data as CatchRow);

  if (approvedCatch.status !== "approved") {
    return NextResponse.json(
      { error: "All-time-high push can only be evaluated for approved catches." },
      { status: 400 }
    );
  }

  const approvedCatches = ((catchesResult.data ?? []) as CatchRow[]).map(mapCatchRow);
  const members = ((membersResult.data ?? []) as MemberRow[]).map(mapMemberRow);
  const beforeCatches = approvedCatches.filter((catchItem) => catchItem.id !== catchId);
  const afterCatches = approvedCatches.some((catchItem) => catchItem.id === catchId)
    ? approvedCatches
    : [...approvedCatches, approvedCatch];
  const allTimeHighEvent = detectAllTimeHighPushEvent({
    beforeCatches,
    afterCatches,
    members,
    approvedCatch,
  });

  if (!allTimeHighEvent) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      allTimeHighDetected: false,
      reason: "No all-time-high was created by this catch.",
    });
  }

  webPush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { data: subscriptionsData, error: subscriptionsError } =
    await serviceSupabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh_key, auth_key")
      .eq("is_active", true)
      .eq("notify_new_all_time_high", true);

  if (subscriptionsError) {
    console.error("Could not read all-time-high push subscriptions.", subscriptionsError);

    return NextResponse.json(
      { error: "Could not read push subscriptions." },
      { status: 500 }
    );
  }

  const subscriptions = (subscriptionsData ?? []) as PushSubscriptionRow[];
  const payload = JSON.stringify({
    title: allTimeHighEvent.title,
    body: allTimeHighEvent.body,
    url: allTimeHighEvent.url,
    icon: "/header.png",
    badge: "/header.png",
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
        console.error("Could not send all-time-high push notification.", error);

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
        "Could not deactivate stale all-time-high push subscriptions.",
        deactivateError
      );
    }
  }

  return NextResponse.json({
    ok: true,
    skipped: false,
    allTimeHighDetected: true,
    filter: allTimeHighEvent.filter,
    sentCount,
    failedCount,
    inactiveCount: inactiveSubscriptionIds.length,
  });
}
