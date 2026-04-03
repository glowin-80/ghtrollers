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

export function useAdminQueues() {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [pendingCatches, setPendingCatches] = useState<PendingCatch[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingCatches, setLoadingCatches] = useState(true);
  const [workingKey, setWorkingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingMembersCount = useMemo(() => pendingMembers.length, [pendingMembers]);
  const pendingCatchesCount = useMemo(() => pendingCatches.length, [pendingCatches]);

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

  useEffect(() => {
    void loadPendingMembers();
    void loadPendingCatches();
  }, [loadPendingMembers, loadPendingCatches]);

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

  return {
    pendingMembers,
    pendingCatches,
    loadingMembers,
    loadingCatches,
    workingKey,
    error,
    pendingMembersCount,
    pendingCatchesCount,
    approveMember,
    makeAdmin,
    rejectMember,
    approveCatch,
    rejectCatch,
  };
}
