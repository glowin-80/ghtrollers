export const ADMIN_PENDING_MEMBER_BADGE_UPDATED_EVENT =
  "ght-admin-pending-member-badge-updated";

export type AdminPendingMemberBadgeUpdatedDetail = {
  count: number;
};

export function dispatchAdminPendingMemberBadgeUpdated(count: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AdminPendingMemberBadgeUpdatedDetail>(
      ADMIN_PENDING_MEMBER_BADGE_UPDATED_EVENT,
      { detail: { count } }
    )
  );
}
