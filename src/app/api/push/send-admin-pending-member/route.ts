import { NextResponse } from "next/server";
import { sendAdminPendingMemberBadgePush } from "@/lib/admin-pending-member-push-server";

export const runtime = "nodejs";

export async function POST() {
  const result = await sendAdminPendingMemberBadgePush();

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not send admin pending member badge push." },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
