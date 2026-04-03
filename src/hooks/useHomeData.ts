import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  HOME_ACTIVE_MEMBERS_SELECT,
  HOME_APPROVED_CATCHES_SELECT,
} from "@/lib/home";
import type { Catch, Member } from "@/types/home";

export type MembershipStatus = "guest" | "pending" | "active";

export function useHomeData() {
  const mountedRef = useRef(true);

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

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadAuthState, loadHomeData, loadMembershipStatus]);

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