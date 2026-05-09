import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_PENDING_MEMBER_BADGE_UPDATED_EVENT,
  type AdminPendingMemberBadgeUpdatedDetail,
} from "@/lib/admin-pending-member-badge-events";
import { clearPwaAppBadge, setPwaAppBadge } from "@/lib/app-badge";
import { fetchPendingMembersCount } from "@/lib/admin-tools";

type UseAdminPendingMemberBadgeOptions = {
  enabled: boolean;
};

export function useAdminPendingMemberBadge({
  enabled,
}: UseAdminPendingMemberBadgeOptions) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyCount = useCallback(async (nextCount: number) => {
    const safeCount = Number.isFinite(nextCount)
      ? Math.max(0, Math.floor(nextCount))
      : 0;

    setCount(safeCount);
    await setPwaAppBadge(safeCount);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCount(0);
      await clearPwaAppBadge();
      return;
    }

    try {
      setLoading(true);
      const nextCount = await fetchPendingMembersCount();
      await applyCount(nextCount);
    } catch (error) {
      console.warn("Could not load pending member badge count.", error);
      await clearPwaAppBadge();
    } finally {
      setLoading(false);
    }
  }, [applyCount, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleBadgeUpdated(event: Event) {
      const customEvent = event as CustomEvent<AdminPendingMemberBadgeUpdatedDetail>;
      void applyCount(customEvent.detail?.count ?? 0);
    }

    window.addEventListener(
      ADMIN_PENDING_MEMBER_BADGE_UPDATED_EVENT,
      handleBadgeUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        ADMIN_PENDING_MEMBER_BADGE_UPDATED_EVENT,
        handleBadgeUpdated as EventListener
      );
    };
  }, [applyCount, enabled]);

  return { count, loading, refresh };
}
