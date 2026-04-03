import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  HOME_ACTIVE_MEMBERS_SELECT,
  HOME_APPROVED_CATCHES_SELECT,
} from "@/lib/home";
import type { Catch, Member } from "@/types/home";

export type MembershipStatus = "guest" | "pending" | "active";

export function useHomeData() {
  const [members, setMembers] = useState<Member[]>([]);
  const [approvedCatches, setApprovedCatches] = useState<Catch[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [membershipStatus, setMembershipStatus] =
    useState<MembershipStatus>("guest");

  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
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

        if (!mounted) return;

        if (membersResponse.error) {
          console.error(membersResponse.error);
        } else {
          setMembers(membersResponse.data || []);
        }

        if (catchesResponse.error) {
          console.error(catchesResponse.error);
        } else {
          setApprovedCatches(catchesResponse.data || []);
        }
      } catch (error) {
        if (!mounted) return;
        console.error(error);
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadMembershipStatus(userId: string) {
      const { data: memberData, error } = await supabase
        .from("members")
        .select("is_active")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error(error);
        setMembershipStatus("pending");
        return;
      }

      setMembershipStatus(memberData?.is_active ? "active" : "pending");
    }

    async function loadAuthState() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setIsLoggedIn(false);
        setMembershipStatus("guest");
        return;
      }

      setIsLoggedIn(true);
      await loadMembershipStatus(session.user.id);
    }

    loadAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setIsLoggedIn(false);
        setMembershipStatus("guest");
        return;
      }

      setIsLoggedIn(true);
      await loadMembershipStatus(session.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    members,
    approvedCatches,
    isLoggedIn,
    membershipStatus,
    hasActiveMembership: membershipStatus === "active",
  };
}
