"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  HOME_ACTIVE_MEMBERS_SELECT,
  HOME_APPROVED_CATCHES_SELECT,
} from "@/lib/home";
import type { Catch, Member } from "@/types/home";

export type MembershipStatus = "guest" | "pending" | "active";

const MIN_RESUME_REFRESH_INTERVAL_MS = 4000;
const HIDDEN_DURATION_BEFORE_RESUME_REFRESH_MS = 1500;

export function useHomeData() {
  const mountedRef = useRef(true);
  const lastResumeRefreshAtRef = useRef(0);
  const hiddenSinceRef = useRef<number | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [approvedCatches, setApprovedCatches] = useState<Catch[]>([]);
  const [isHomeDataLoading, setIsHomeDataLoading] = useState(true);
  const [homeDataError, setHomeDataError] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] =
    useState<MembershipStatus>("guest");

  const loadMembershipStatus = useCallback(async (userId: string) => {
    const { data: memberData, error } = await supabase
      .from("members")
      .select("is_active")
      .eq("id", userId)
      .maybeSingle();

    if (!mountedRef.current) return;

    if (error) {
      console.error(error);
      setMembershipStatus("pending");
      return;
    }

    setMembershipStatus(memberData?.is_active ? "active" : "pending");
  }, []);

  const loadHomeData = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setIsHomeDataLoading(true);
        setHomeDataError(null);
      }

      const [membersResponse, catchesResponse] = await Promise.all([
        supabase
          .from("members")
          .select(HOME_ACTIVE_MEMBERS_SELECT)
          .eq("is_active", true)
          .order("name", { ascending: true }),
        supabase
          .from("catches")
          .select(HOME_APPROVED_CATCHES_SELECT)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),
      ]);

      if (!mountedRef.current) return;

      if (membersResponse.error) {
        throw membersResponse.error;
      }

      if (catchesResponse.error) {
        throw catchesResponse.error;
      }

      setMembers(membersResponse.data || []);
      setApprovedCatches(catchesResponse.data || []);
    } catch (error) {
      console.error(error);

      if (!mountedRef.current) return;

      setMembers([]);
      setApprovedCatches([]);
      setHomeDataError("Kunde inte ladda startsidan just nu.");
    } finally {
      if (mountedRef.current) {
        setIsHomeDataLoading(false);
      }
    }
  }, []);

  const loadAuthState = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setIsAuthLoading(true);
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (!mountedRef.current) return;

      if (!session?.user) {
        setIsLoggedIn(false);
        setMembershipStatus("guest");
        return;
      }

      setIsLoggedIn(true);
      await loadMembershipStatus(session.user.id);
    } catch (error) {
      console.error(error);

      if (!mountedRef.current) return;

      setIsLoggedIn(false);
      setMembershipStatus("guest");
    } finally {
      if (mountedRef.current) {
        setIsAuthLoading(false);
      }
    }
  }, [loadMembershipStatus]);

  const reloadHomeData = useCallback(() => {
    void loadHomeData();
    void loadAuthState();
  }, [loadAuthState, loadHomeData]);

  const refreshAfterResume = useCallback(() => {
    if (!mountedRef.current) return;

    const now = Date.now();

    if (now - lastResumeRefreshAtRef.current < MIN_RESUME_REFRESH_INTERVAL_MS) {
      return;
    }

    lastResumeRefreshAtRef.current = now;
    void loadAuthState();
    void loadHomeData();
  }, [loadAuthState, loadHomeData]);

  useEffect(() => {
    mountedRef.current = true;

    void loadHomeData();
    void loadAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mountedRef.current) return;

      if (!session?.user) {
        setIsLoggedIn(false);
        setMembershipStatus("guest");
        setIsAuthLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setIsAuthLoading(true);

      try {
        await loadMembershipStatus(session.user.id);
      } finally {
        if (mountedRef.current) {
          setIsAuthLoading(false);
        }
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenSinceRef.current = Date.now();
        return;
      }

      const hiddenFor =
        hiddenSinceRef.current === null
          ? HIDDEN_DURATION_BEFORE_RESUME_REFRESH_MS
          : Date.now() - hiddenSinceRef.current;

      hiddenSinceRef.current = null;

      if (hiddenFor >= HIDDEN_DURATION_BEFORE_RESUME_REFRESH_MS) {
        refreshAfterResume();
      }
    };

    const handleWindowFocus = () => {
      refreshAfterResume();
    };

    const handlePageShow = () => {
      refreshAfterResume();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [
    loadAuthState,
    loadHomeData,
    loadMembershipStatus,
    refreshAfterResume,
  ]);

  return {
    members,
    approvedCatches,
    isHomeDataLoading,
    homeDataError,
    reloadHomeData,
    isLoggedIn,
    isAuthLoading,
    membershipStatus,
    hasActiveMembership: membershipStatus === "active",
  };
}