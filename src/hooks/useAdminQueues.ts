import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approvePendingCatch,
  approvePendingMember,
  deletePendingCatch,
  deletePendingMember,
  fetchPendingCatches,
  fetchPendingMembers,
  makePendingMemberAdmin,
  type PendingCatch,
  type PendingMember,
} from "@/lib/admin-tools";
import {
  approvePendingFishingSpot,
  approvePendingFishingSpotEdit,
  deletePendingFishingSpot,
  fetchPendingFishingSpots,
  rejectPendingFishingSpotEdit,
  type PendingFishingSpot,
} from "@/lib/fishing-spots";

export function useAdminQueues(adminMemberId: string | null) {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [pendingCatches, setPendingCatches] = useState<PendingCatch[]>([]);
  const [pendingFishingSpots, setPendingFishingSpots] = useState<PendingFishingSpot[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingCatches, setLoadingCatches] = useState(true);
  const [loadingFishingSpots, setLoadingFishingSpots] = useState(true);
  const [workingKey, setWorkingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingMembersCount = useMemo(() => pendingMembers.length, [pendingMembers]);
  const pendingCatchesCount = useMemo(() => pendingCatches.length, [pendingCatches]);
  const pendingFishingSpotsCount = useMemo(
    () => pendingFishingSpots.length,
    [pendingFishingSpots]
  );

  const loadPendingMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      setError(null);
      const data = await fetchPendingMembers();
      setPendingMembers(data);
    } catch (err) {
      console.error(err);
      setError("Kunde inte ladda väntande medlemsansökningar.");
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const loadPendingCatches = useCallback(async () => {
    try {
      setLoadingCatches(true);
      setError(null);
      const data = await fetchPendingCatches();
      setPendingCatches(data);
    } catch (err) {
      console.error(err);
      setError("Kunde inte ladda väntande fångster.");
    } finally {
      setLoadingCatches(false);
    }
  }, []);

  const loadPendingFishingSpots = useCallback(async () => {
    try {
      setLoadingFishingSpots(true);
      setError(null);
      const data = await fetchPendingFishingSpots();
      setPendingFishingSpots(data);
    } catch (err) {
      console.error(err);
      setError("Kunde inte ladda väntande fiskeplatser.");
    } finally {
      setLoadingFishingSpots(false);
    }
  }, []);

  useEffect(() => {
    void loadPendingMembers();
    void loadPendingCatches();
    void loadPendingFishingSpots();
  }, [loadPendingMembers, loadPendingCatches, loadPendingFishingSpots]);

  const approveMember = useCallback(async (memberId: string) => {
    try {
      setWorkingKey(`member-approve-${memberId}`);
      setError(null);
      await approvePendingMember(memberId);
      setPendingMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      console.error(err);
      setError("Kunde inte godkänna medlemmen.");
    } finally {
      setWorkingKey(null);
    }
  }, []);

  const makeAdmin = useCallback(async (memberId: string) => {
    try {
      setWorkingKey(`member-admin-${memberId}`);
      setError(null);
      await makePendingMemberAdmin(memberId);
      setPendingMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      console.error(err);
      setError("Kunde inte göra medlemmen till admin.");
    } finally {
      setWorkingKey(null);
    }
  }, []);

  const rejectMember = useCallback(async (memberId: string) => {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort denna ansökan?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingKey(`member-reject-${memberId}`);
      setError(null);
      await deletePendingMember(memberId);
      setPendingMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      console.error(err);
      setError(
        "Kunde inte ta bort ansökan. Om användaren redan finns i auth kan vi bygga ett snyggare nekaflöde sen."
      );
    } finally {
      setWorkingKey(null);
    }
  }, []);

  const approveCatch = useCallback(async (catchId: string) => {
    try {
      setWorkingKey(`catch-approve-${catchId}`);
      setError(null);
      await approvePendingCatch(catchId);
      setPendingCatches((prev) => prev.filter((item) => item.id !== catchId));
    } catch (err) {
      console.error(err);
      setError("Kunde inte godkänna fångsten.");
    } finally {
      setWorkingKey(null);
    }
  }, []);

  const rejectCatch = useCallback(async (catchId: string) => {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort denna fångst?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingKey(`catch-reject-${catchId}`);
      setError(null);
      await deletePendingCatch(catchId);
      setPendingCatches((prev) => prev.filter((item) => item.id !== catchId));
    } catch (err) {
      console.error(err);
      setError("Kunde inte ta bort fångsten.");
    } finally {
      setWorkingKey(null);
    }
  }, []);

  const approveFishingSpot = useCallback(
    async (spotId: string, reviewType: PendingFishingSpot["review_type"]) => {
      if (!adminMemberId) {
        setError("Admin-id saknas för att kunna godkänna fiskeplatsen.");
        return;
      }

      try {
        setWorkingKey(`spot-approve-${spotId}`);
        setError(null);
        if (reviewType === "edit") {
          await approvePendingFishingSpotEdit(spotId, adminMemberId);
        } else {
          await approvePendingFishingSpot(spotId, adminMemberId);
        }
        setPendingFishingSpots((prev) => prev.filter((item) => item.id !== spotId));
      } catch (err) {
        console.error(err);
        setError("Kunde inte godkänna fiskeplatsen.");
      } finally {
        setWorkingKey(null);
      }
    },
    [adminMemberId]
  );

  const rejectFishingSpot = useCallback(async (spotId: string, reviewType: PendingFishingSpot["review_type"]) => {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort denna fiskeplats?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingKey(`spot-reject-${spotId}`);
      setError(null);
      if (reviewType === "edit") {
        await rejectPendingFishingSpotEdit(spotId);
      } else {
        await deletePendingFishingSpot(spotId);
      }
      setPendingFishingSpots((prev) => prev.filter((item) => item.id !== spotId));
    } catch (err) {
      console.error(err);
      setError(reviewType === "edit" ? "Kunde inte avslå ändringen." : "Kunde inte ta bort fiskeplatsen.");
    } finally {
      setWorkingKey(null);
    }
  }, []);

  return {
    pendingMembers,
    pendingCatches,
    pendingFishingSpots,
    loadingMembers,
    loadingCatches,
    loadingFishingSpots,
    workingKey,
    error,
    pendingMembersCount,
    pendingCatchesCount,
    pendingFishingSpotsCount,
    approveMember,
    makeAdmin,
    rejectMember,
    approveCatch,
    rejectCatch,
    approveFishingSpot,
    rejectFishingSpot,
  };
}
