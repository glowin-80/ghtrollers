import { resolveCatchOwnerMember, buildMemberLookupById, buildMemberLookupByName } from "@/lib/catch-identity";
import { supabase } from "@/lib/supabase";
import { getMemberRoleLabel } from "@/lib/ght-rules";

export type PendingMember = {
  id: string;
  name: string | null;
  email: string | null;
  category: string | null;
  created_at: string | null;
  is_admin: boolean | null;
  is_super_admin: boolean | null;
  is_active: boolean | null;
  member_role: string | null;
};

export type PendingCatch = {
  id: string;
  caught_for: string;
  caught_for_member_id?: string | null;
  registered_by: string;
  registered_by_member_id?: string | null;
  fish_type: string;
  fine_fish_type: string | null;
  weight_g: number;
  catch_date: string;
  location_name: string | null;
  image_url: string | null;
  fishing_method: string | null;
  live_scope: boolean | null;
  caught_abroad: boolean | null;
  is_location_private: boolean | null;
  owner_member_role?: string | null;
  status: string;
  created_at: string | null;
  original_image_size_bytes: number | null;
  compressed_image_size_bytes: number | null;
};

export async function fetchPendingMembers() {
  const { data, error } = await supabase
    .from("members")
    .select(
      "id, name, email, category, created_at, is_admin, is_super_admin, is_active, member_role"
    )
    .eq("is_active", false)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PendingMember[];
}

export async function fetchPendingCatches() {
  const [{ data, error }, { data: members, error: membersError }] = await Promise.all([
    supabase
      .from("catches")
      .select(
        "id, caught_for, caught_for_member_id, registered_by, registered_by_member_id, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, fishing_method, live_scope, caught_abroad, is_location_private, status, created_at, original_image_size_bytes, compressed_image_size_bytes"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("members").select("id, name, member_role"),
  ]);

  if (error) throw error;
  if (membersError) throw membersError;

const typedMembers = (members ?? []) as Array<{
  id: string;
  name: string | null;
  member_role: string | null;
}>;

const membersWithName = typedMembers.filter(
  (member): member is { id: string; name: string; member_role: string | null } =>
    typeof member.name === "string" && member.name.trim().length > 0
);

const memberById = buildMemberLookupById(membersWithName);
const memberByName = buildMemberLookupByName(membersWithName);

  return ((data ?? []) as PendingCatch[]).map((item) => ({
    ...item,
    owner_member_role:
      resolveCatchOwnerMember(item, { memberById, memberByName })?.member_role ?? null,
  }));
}

export async function approvePendingMember(
  memberId: string,
  memberRole: "competition_member" | "guest_angler"
) {
  const { error } = await supabase
    .from("members")
    .update({ is_active: true, member_role: memberRole })
    .eq("id", memberId);

  if (error) throw error;
}

export async function makePendingMemberAdmin(memberId: string) {
  const { error } = await supabase
    .from("members")
    .update({
      is_admin: true,
      is_active: true,
      member_role: "competition_member",
    })
    .eq("id", memberId);

  if (error) throw error;
}

export async function deletePendingMember(memberId: string) {
  const { error } = await supabase.from("members").delete().eq("id", memberId);
  if (error) throw error;
}

async function sendPushNotificationRequest(
  path: string,
  catchId: string,
  warningMessage: string
) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    console.warn(`${warningMessage} Auth session is missing.`);
    return;
  }

  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ catchId }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    console.warn(warningMessage, details);
  }
}

async function sendNewApprovedCatchPushNotification(catchId: string) {
  await sendPushNotificationRequest(
    "/api/push/send-new-catch",
    catchId,
    "Could not send new catch push notification."
  );
}

async function sendAchievementPushNotification(catchId: string) {
  await sendPushNotificationRequest(
    "/api/push/send-achievement",
    catchId,
    "Could not send achievement push notification."
  );
}

export async function approvePendingCatch(catchId: string) {
  const { error } = await supabase
    .from("catches")
    .update({ status: "approved" })
    .eq("id", catchId);

  if (error) throw error;

  try {
    await sendNewApprovedCatchPushNotification(catchId);
  } catch (pushError) {
    console.warn("The catch was approved, but the new catch push notification could not be sent.", pushError);
  }

  try {
    await sendAchievementPushNotification(catchId);
  } catch (pushError) {
    console.warn("The catch was approved, but the achievement push notification could not be sent.", pushError);
  }
}

export async function deletePendingCatch(catchId: string) {
  const { error } = await supabase.from("catches").delete().eq("id", catchId);
  if (error) throw error;
}

export function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) return "Saknas";
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;

  return `${(kb / 1024).toFixed(2)} MB`;
}

export function getCompressionReduction(
  originalBytes: number | null,
  compressedBytes: number | null
) {
  if (!originalBytes || !compressedBytes || originalBytes <= 0) return null;

  const reduction = ((originalBytes - compressedBytes) / originalBytes) * 100;
  return reduction < 0 ? 0 : Math.round(reduction);
}

export function getPendingCatchFishLabel(item: PendingCatch) {
  return item.fish_type === "Fina fisken" && item.fine_fish_type
    ? `${item.fish_type} • ${item.fine_fish_type}`
    : item.fish_type;
}

export function getPendingMemberDisplayName(member: PendingMember) {
  return member.name?.trim() || member.email || "Namnlös medlem";
}

export function getPendingMemberRoleLabel(member: PendingMember) {
  return getMemberRoleLabel(member.member_role);
}