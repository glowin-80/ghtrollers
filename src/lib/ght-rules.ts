import type { Catch, Member } from "@/types/home";
import type { MemberCatch, MemberProfile } from "@/types/member-page";

export type GhtMemberRole = "competition_member" | "guest_angler" | string;

export type LocationVisibilityViewer = {
  memberId?: string | null;
  memberName?: string | null;
  isLoggedIn?: boolean;
  isSuperAdmin?: boolean;
};

export function isGuestAnglerRole(role?: string | null) {
  return role === "guest_angler";
}

export function getMemberRoleLabel(role?: string | null) {
  if (role === "guest_angler") {
    return "Gästfiskare";
  }

  return "Medlem";
}

export function getProfileRoleLabel(member?: Pick<MemberProfile, "member_role" | "is_admin" | "is_super_admin"> | null) {
  if (member?.is_super_admin) {
    return "Super admin";
  }

  if (member?.is_admin) {
    return "Admin";
  }

  return getMemberRoleLabel(member?.member_role);
}

export function getAdminLevelLabel(member?: Pick<MemberProfile, "is_admin" | "is_super_admin"> | null) {
  if (member?.is_super_admin) {
    return "Super admin";
  }

  if (member?.is_admin) {
    return "Admin";
  }

  return "Medlem";
}

export function buildMemberLookupByName(members: Member[]) {
  return members.reduce<Record<string, Member>>((acc, member) => {
    const key = member.name?.trim();
    if (key) acc[key] = member;
    return acc;
  }, {});
}

export function getCompetitionExclusionReason(
  catchItem: Pick<Catch, "caught_for" | "live_scope" | "caught_abroad">,
  memberLookupByName: Record<string, Member>
): string | null {
  const owner = memberLookupByName[catchItem.caught_for?.trim() || ""];

  if (owner && isGuestAnglerRole(owner.member_role)) {
    return "Gästfiskare";
  }
  if (catchItem.live_scope) {
    return "Live-scope";
  }
  if (catchItem.caught_abroad) {
    return "Utomlands";
  }
  return null;
}

export function isCompetitionEligibleCatch(
  catchItem: Pick<Catch, "caught_for" | "live_scope" | "caught_abroad">,
  memberLookupByName: Record<string, Member>
) {
  return getCompetitionExclusionReason(catchItem, memberLookupByName) === null;
}

export function canViewerSeePrivateLocation(
  catchItem: Pick<Catch, "caught_for" | "registered_by" | "is_location_private">,
  viewer: LocationVisibilityViewer
) {
  if (!catchItem.is_location_private) return true;
  if (viewer.isSuperAdmin) return true;
  if (!viewer.isLoggedIn) return false;

  const viewerName = viewer.memberName?.trim();
  return Boolean(
    viewerName &&
      (viewerName === catchItem.caught_for?.trim() ||
        viewerName === catchItem.registered_by?.trim())
  );
}

export function sanitizeCatchLocationForViewer<T extends Catch | MemberCatch>(
  catchItem: T,
  viewer: LocationVisibilityViewer
): T {
  if (canViewerSeePrivateLocation(catchItem, viewer)) {
    return catchItem;
  }

  return {
    ...catchItem,
    location_name: null,
    latitude: null,
    longitude: null,
  } as T;
}
