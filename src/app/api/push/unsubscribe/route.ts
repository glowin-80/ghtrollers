import { NextResponse } from "next/server";
import { getAuthenticatedPushMemberContext } from "@/lib/push-notification-server";

export async function POST(request: Request) {
  const context = await getAuthenticatedPushMemberContext(request);

  if (!context) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const endpoint =
    body &&
    typeof body === "object" &&
    typeof (body as { endpoint?: unknown }).endpoint === "string"
      ? (body as { endpoint: string }).endpoint
      : null;

  let query = context.supabase
    .from("push_subscriptions")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("member_id", context.userId);

  if (endpoint) {
    query = query.eq("endpoint", endpoint);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Could not disable push subscription." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
