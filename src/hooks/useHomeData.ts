import { useEffect, useState } from "react";
import { useAuthMember } from "@/hooks/useAuthMember";
import { fetchHomePageData } from "@/lib/home-service";
import type { Catch, FishingSpot, Member } from "@/types/home";

export { type MembershipStatus } from "@/lib/auth-member";

export function useHomeData() {
  const [members, setMembers] = useState<Member[]>([]);
  const [approvedCatches, setApprovedCatches] = useState<Catch[]>([]);
  const [approvedFishingSpots, setApprovedFishingSpots] = useState<FishingSpot[]>([]);
  const { isLoggedIn, membershipStatus, hasActiveMembership, member, isSuperAdmin } = useAuthMember();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const data = await fetchHomePageData({
            includeFishingSpots: hasActiveMembership,
            viewer: {
              isLoggedIn,
              memberId: member?.id ?? null,
              memberName: member?.name ?? null,
              isSuperAdmin,
            },
          });
          setMembers(data.members);
          setApprovedCatches(data.approvedCatches);
          setApprovedFishingSpots(data.approvedFishingSpots);
        } catch (error) {
          console.error(error);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hasActiveMembership, isLoggedIn, isSuperAdmin, member?.id, member?.name]);

  return {
    members,
    approvedCatches,
    approvedFishingSpots,
    isLoggedIn,
    membershipStatus,
    hasActiveMembership,
    member,
  };
}
