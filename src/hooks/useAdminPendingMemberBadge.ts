// src/hooks/useAdminPendingMemberBadge.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { setAppBadgeCount } from "@/lib/app-badge";
import {
  ADMIN_PENDING_MEMBER_BADGE_UPDATED_EVENT,
  type AdminPendingMemberBadgeUpdatedDetail,
} from "@/lib/admin-pending-member-badge-events";
import type { MemberProfile } from "@/types/member-page";

export function useAdminPendingMemberBadge(member: MemberProfile | null) {
  const [pendingMemberCount, setPendingMemberCount] = useState(0);
  const lastAppliedAppBadgeCountRef = useRef<number | null>(null);
  const isAdmin = Boolean(
    member?.is_active && (member.is_admin || member.is_super_admin)
  );

  const applyBadgeCount = useCallback(
    (count: number) => {
      const safeCount = Math.max(0, count);
      setPendingMemberCount(safeCount);

      if (!isAdmin || lastAppliedAppBadgeCountRef.current === safeCount) {
        return;
      }

      lastAppliedAppBadgeCountRef.current = safeCount;
      void setAppBadgeCount(safeCount);
    },
    [isAdmin]
  );

  const refreshPendingMemberCount = useCallback(async () => {
    if (!isAdmin) {
      applyBadgeCount(0);
      lastAppliedAppBadgeCountRef.current = null;
      return;
    }

    const { count, error } = await supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("is_active", false)
      .eq("is_admin", false);

    if (error) {
      console.warn("Could not read pending member count for admin badge.", error);
      return;
    }

    applyBadgeCount(count ?? 0);
  }, [applyBadgeCount, isAdmin]);

  useEffect(() => {
    void refreshPendingMemberCount();
  }, [refreshPendingMemberCount]);

  useEffect(() => {
    function handleBadgeUpdated(event: Event) {
      const customEvent = event as CustomEvent<AdminPendingMemberBadgeUpdatedDetail>;
      applyBadgeCount(customEvent.detail?.count ?? 0);
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
  }, [applyBadgeCount]);

  return {
    pendingMemberCount,
    refreshPendingMemberCount,
  };
}