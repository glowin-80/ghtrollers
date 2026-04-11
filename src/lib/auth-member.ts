import { supabase } from "@/lib/supabase";
import type { Member } from "@/types/home";
import type { MemberProfile } from "@/types/member-page";

export type MembershipStatus = "guest" | "pending" | "active";

export type AuthMemberState = {
  isLoggedIn: boolean;
  membershipStatus: MembershipStatus;
  member: MemberProfile | null;
  profileImageUrl: string | null;
};

const AUTH_MEMBER_SELECT =
  "id, name, email, is_admin, is_super_admin, is_active, member_role, profile_image_url";

export function createGuestAuthMemberState(): AuthMemberState {
  return {
    isLoggedIn: false,
    membershipStatus: "guest",
    member: null,
    profileImageUrl: null,
  };
}

export function mapMemberProfileToHomeMember(member: MemberProfile): Member {
  return {
    id: member.id,
    name: member.name,
    email: member.email ?? null,
    is_admin: member.is_admin ?? false,
    is_super_admin: member.is_super_admin ?? false,
    is_active: member.is_active ?? false,
    member_role: member.member_role ?? "competition_member",
    profile_image_url: member.profile_image_url ?? null,
    category: "senior",
  };
}

export async function fetchMemberProfileByUserId(
  userId: string
): Promise<MemberProfile | null> {
  const { data, error } = await supabase
    .from("members")
    .select(AUTH_MEMBER_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export function buildFallbackMemberProfile(params: {
  userId: string;
  email: string | null;
  name?: string | null;
}): MemberProfile {
  return {
    id: params.userId,
    name: params.name?.trim() || params.email || "Medlem",
    email: params.email,
    is_admin: false,
    is_super_admin: false,
    is_active: false,
    member_role: "competition_member",
    profile_image_url: null,
  };
}

export async function resolveAuthMemberStateByUser(params: {
  userId: string;
  email: string | null;
  fallbackName?: string | null;
}): Promise<AuthMemberState> {
  const member =
    (await fetchMemberProfileByUserId(params.userId)) ??
    buildFallbackMemberProfile({
      userId: params.userId,
      email: params.email,
      name: params.fallbackName,
    });

  return {
    isLoggedIn: true,
    membershipStatus: member.is_active ? "active" : "pending",
    member,
    profileImageUrl: member.profile_image_url ?? null,
  };
}

export async function getCurrentAuthMemberState(): Promise<AuthMemberState> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const user = session?.user;

  if (!user) {
    return createGuestAuthMemberState();
  }

  return resolveAuthMemberStateByUser({
    userId: user.id,
    email: user.email ?? null,
    fallbackName:
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null,
  });
}
