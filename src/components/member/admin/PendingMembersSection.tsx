"use client";

import type { PendingMember } from "@/lib/admin-tools";
import PendingMemberCard from "@/components/member/admin/PendingMemberCard";

type PendingMembersSectionProps = {
  pendingMembers: PendingMember[];
  loading: boolean;
  workingKey: string | null;
  onApprove: (memberId: string) => void;
  onMakeAdmin: (memberId: string) => void;
  onReject: (memberId: string) => void;
};

export default function PendingMembersSection({
  pendingMembers,
  loading,
  workingKey,
  onApprove,
  onMakeAdmin,
  onReject,
}: PendingMembersSectionProps) {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-[#1f2937]">Medlemsansökningar</h3>

      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
            Laddar väntande medlemsansökningar...
          </div>
        ) : null}

        {!loading && pendingMembers.length === 0 ? (
          <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
            Inga väntande medlemsansökningar just nu.
          </div>
        ) : null}

        {!loading
          ? pendingMembers.map((member) => (
              <PendingMemberCard
                key={member.id}
                member={member}
                workingKey={workingKey}
                onApprove={onApprove}
                onMakeAdmin={onMakeAdmin}
                onReject={onReject}
              />
            ))
          : null}
      </div>
    </div>
  );
}
