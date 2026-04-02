import { supabase } from "@/lib/supabase";

export type PendingMember = {
  id: string;
  name: string | null;
  email: string | null;
  category: string | null;
  created_at: string | null;
  is_admin: boolean | null;
  is_active: boolean | null;
};

export type PendingCatch = {
  id: string;
  caught_for: string;
  registered_by: string;
  fish_type: string;
  fine_fish_type: string | null;
  weight_g: number;
  catch_date: string;
  location_name: string | null;
  image_url: string | null;
  status: string;
  created_at: string | null;
  original_image_size_bytes: number | null;
  compressed_image_size_bytes: number | null;
};

export async function fetchPendingMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("id, name, email, category, created_at, is_admin, is_active")
    .eq("is_active", false)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchPendingCatches() {
  const { data, error } = await supabase
    .from("catches")
    .select(
      "id, caught_for, registered_by, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, status, created_at, original_image_size_bytes, compressed_image_size_bytes"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function approvePendingMember(memberId: string) {
  const { error } = await supabase
    .from("members")
    .update({ is_active: true })
    .eq("id", memberId);

  if (error) {
    throw error;
  }
}

export async function makePendingMemberAdmin(memberId: string) {
  const { error } = await supabase
    .from("members")
    .update({ is_admin: true, is_active: true })
    .eq("id", memberId);

  if (error) {
    throw error;
  }
}

export async function deletePendingMember(memberId: string) {
  const { error } = await supabase.from("members").delete().eq("id", memberId);

  if (error) {
    throw error;
  }
}

export async function approvePendingCatch(catchId: string) {
  const { error } = await supabase
    .from("catches")
    .update({ status: "approved" })
    .eq("id", catchId);

  if (error) {
    throw error;
  }
}

export async function deletePendingCatch(catchId: string) {
  const { error } = await supabase.from("catches").delete().eq("id", catchId);

  if (error) {
    throw error;
  }
}

export function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) {
    return "Saknas";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(0)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function getCompressionReduction(
  originalBytes: number | null,
  compressedBytes: number | null
) {
  if (!originalBytes || !compressedBytes || originalBytes <= 0) {
    return null;
  }

  const reduction = ((originalBytes - compressedBytes) / originalBytes) * 100;

  if (reduction < 0) {
    return 0;
  }

  return Math.round(reduction);
}

export function getPendingCatchFishLabel(item: PendingCatch) {
  if (item.fish_type === "Fina fisken" && item.fine_fish_type) {
    return `${item.fish_type} • ${item.fine_fish_type}`;
  }

  return item.fish_type;
}

export function getPendingMemberDisplayName(member: PendingMember) {
  return member.name?.trim() || member.email || "Namnlös medlem";
}
