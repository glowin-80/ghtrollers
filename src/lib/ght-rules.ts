import { getCurrentAchievementByValue } from "@/lib/achievements";
import {
  buildMemberLookupById,
  buildMemberLookupByName,
  normalizeIdentityValue,
  resolveCatchOwnerMember,
} from "@/lib/catch-identity";
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

export function getProfileRoleLabel(
  member?: Pick<MemberProfile, "member_role" | "is_admin" | "is_super_admin"> | null
) {
  if (member?.is_super_admin) {
    return "Super admin";
  }

  if (member?.is_admin) {
    return "Admin";
  }

  return getMemberRoleLabel(member?.member_role);
}

export function getAdminLevelLabel(
  member?: Pick<MemberProfile, "is_admin" | "is_super_admin"> | null
) {
  if (member?.is_super_admin) {
    return "Super admin";
  }

  if (member?.is_admin) {
    return "Admin";
  }

  return "Medlem";
}

export function getAchievementTitle(catchCount: number) {
  return getCurrentAchievementByValue(catchCount, "reported_catches")?.title ?? "Fiskesugen";
}

export { buildMemberLookupById, buildMemberLookupByName };

export function getCompetitionExclusionReason(
  catchItem: Pick<Catch, "caught_for" | "caught_for_member_id" | "live_scope" | "caught_abroad">,
  members: Member[]
): string | null {
  const owner = resolveCatchOwnerMember(catchItem, {
    memberById: buildMemberLookupById(members),
    memberByName: buildMemberLookupByName(members),
  });

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
  catchItem: Pick<Catch, "caught_for" | "caught_for_member_id" | "live_scope" | "caught_abroad">,
  members: Member[]
) {
  return getCompetitionExclusionReason(catchItem, members) === null;
}

export function canViewerSeePrivateLocation(
  catchItem: Pick<
    Catch,
    "caught_for" | "caught_for_member_id" | "registered_by" | "registered_by_member_id" | "is_location_private"
  >,
  viewer: LocationVisibilityViewer
) {
  if (!catchItem.is_location_private) return true;
  if (viewer.isSuperAdmin) return true;
  if (!viewer.isLoggedIn) return false;

  const viewerId = normalizeIdentityValue(viewer.memberId);
  const ownerId = normalizeIdentityValue(catchItem.caught_for_member_id);
  const registrarId = normalizeIdentityValue(catchItem.registered_by_member_id);

  if (viewerId && (viewerId === ownerId || viewerId === registrarId)) {
    return true;
  }

  const viewerName = normalizeIdentityValue(viewer.memberName);
  return Boolean(
    viewerName &&
      (viewerName === normalizeIdentityValue(catchItem.caught_for) ||
        viewerName === normalizeIdentityValue(catchItem.registered_by))
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
