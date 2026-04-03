"use client";

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
import PendingMembersSection from "@/components/member/admin/PendingMembersSection";
import PendingCatchesSection from "@/components/member/admin/PendingCatchesSection";
import InlineMessage from "@/components/shared/InlineMessage";

export default function AdminToolsCard() {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [pendingCatches, setPendingCatches] = useState<PendingCatch[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingCatches, setLoadingCatches] = useState(true);
  const [workingKey, setWorkingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const pendingMembersCount = useMemo(() => pendingMembers.length, [pendingMembers]);
  const pendingCatchesCount = useMemo(() => pendingCatches.length, [pendingCatches]);

  useEffect(() => {
    if (!successToast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessToast(null);
    }, 3200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [successToast]);

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
    loadPendingMembers();
    loadPendingCatches();
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
      setSuccessToast("Fisken är Godkänd, på med ny mask och kör hårt!");
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

  return (
    <>
      {successToast ? (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-[70] flex justify-center sm:inset-x-6">
          <div className="pointer-events-auto w-full max-w-md shadow-[0_14px_36px_rgba(18,35,28,0.18)]">
            <InlineMessage
              variant="success"
              message={successToast}
              onDismiss={() => setSuccessToast(null)}
            />
          </div>
        </div>
      ) : null}

      <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
        <h2 className="text-3xl font-bold text-[#1f2937]">🛠️ Adminverktyg</h2>

        <p className="mt-3 text-[#6b7280]">
          Du är admin och kan hantera inkomna medlemsansökningar och väntande
          fångster.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
            Väntande medlemsansökningar: <span className="font-bold">{pendingMembersCount}</span>
          </div>

          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
            Väntande fångster: <span className="font-bold">{pendingCatchesCount}</span>
          </div>
        </div>

        <PendingMembersSection
          pendingMembers={pendingMembers}
          loading={loadingMembers}
          workingKey={workingKey}
          onApprove={approveMember}
          onMakeAdmin={makeAdmin}
          onReject={rejectMember}
        />

        <PendingCatchesSection
          pendingCatches={pendingCatches}
          loading={loadingCatches}
          workingKey={workingKey}
          onApprove={approveCatch}
          onReject={rejectCatch}
        />
      </section>
    </>
  );
}