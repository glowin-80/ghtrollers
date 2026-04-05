"use client";

import PendingMembersSection from "@/components/member/admin/PendingMembersSection";
import PendingCatchesSection from "@/components/member/admin/PendingCatchesSection";
import PendingFishingSpotsSection from "@/components/member/admin/PendingFishingSpotsSection";
import { useAuthMember } from "@/hooks/useAuthMember";
import { useAdminQueues } from "@/hooks/useAdminQueues";

export default function AdminToolsCard() {
  const { member } = useAuthMember();
  const {
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
  } = useAdminQueues(member?.id ?? null);

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h2 className="text-3xl font-bold text-[#1f2937]">🛠️ Adminverktyg</h2>

      <p className="mt-3 text-[#6b7280]">
        Du är admin och kan hantera inkomna medlemsansökningar, väntande fångster och väntande fiskeplatser.
      </p>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
          Väntande medlemsansökningar: <span className="font-bold">{pendingMembersCount}</span>
        </div>

        <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
          Väntande fångster: <span className="font-bold">{pendingCatchesCount}</span>
        </div>

        <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
          Väntande fiskeplatser: <span className="font-bold">{pendingFishingSpotsCount}</span>
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

      <PendingFishingSpotsSection
        pendingFishingSpots={pendingFishingSpots}
        loading={loadingFishingSpots}
        workingKey={workingKey}
        onApprove={approveFishingSpot}
        onReject={rejectFishingSpot}
      />
    </section>
  );
}
