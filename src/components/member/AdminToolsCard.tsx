"use client";

import PendingMembersSection from "@/components/member/admin/PendingMembersSection";
import PendingCatchesSection from "@/components/member/admin/PendingCatchesSection";
import PendingFishingSpotsSection from "@/components/member/admin/PendingFishingSpotsSection";
import { useAuthMember } from "@/hooks/useAuthMember";
import { useAdminQueues } from "@/hooks/useAdminQueues";

function AdminBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="inline-flex min-h-[26px] min-w-[26px] items-center justify-center rounded-full bg-red-600 px-2 text-xs font-extrabold leading-none text-white shadow-[0_3px_8px_rgba(0,0,0,0.18)]">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function AdminToolsCard() {
  const { member, isSuperAdmin } = useAuthMember();
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
  } = useAdminQueues(member?.id ?? null, isSuperAdmin);

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl font-bold text-[#1f2937]">🛠️ Adminverktyg</h2>
        <AdminBadge count={pendingMembersCount} />
      </div>

      <p className="mt-3 text-[#6b7280]">
        Du är admin och kan hantera inkomna medlemsansökningar, väntande fångster och väntande fiskeplatser.
      </p>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="relative rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
          <div className="flex items-center justify-between gap-3">
            <span>Väntande medlemsansökningar:</span>
            <span className="font-bold">{pendingMembersCount}</span>
          </div>
          {pendingMembersCount > 0 ? (
            <div className="mt-2 text-xs font-semibold text-red-700">
              Visas även som badge på appikonen där webbläsaren stödjer det.
            </div>
          ) : null}
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
        isSuperAdmin={isSuperAdmin}
        onApprove={approveMember}
        onMakeAdmin={makeAdmin}
        onReject={rejectMember}
      />
      <PendingCatchesSection
        pendingCatches={pendingCatches}
        loading={loadingCatches}
        workingKey={workingKey}
        isSuperAdmin={isSuperAdmin}
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
