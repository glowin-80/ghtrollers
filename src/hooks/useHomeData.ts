import { useCallback, useEffect, useState } from "react";
import { useAuthMember } from "@/hooks/useAuthMember";
import { fetchHomePageData } from "@/lib/home-service";
import type { Catch, Member } from "@/types/home";

export { type MembershipStatus } from "@/lib/auth-member";

export function useHomeData() {
  const [members, setMembers] = useState<Member[]>([]);
  const [approvedCatches, setApprovedCatches] = useState<Catch[]>([]);
  const { isLoggedIn, membershipStatus, hasActiveMembership } = useAuthMember();

  const loadInitialData = useCallback(async () => {
    try {
      const data = await fetchHomePageData();
      setMembers(data.members);
      setApprovedCatches(data.approvedCatches);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  return {
    members,
    approvedCatches,
    isLoggedIn,
    membershipStatus,
    hasActiveMembership,
  };
}
