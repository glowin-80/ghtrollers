"use client";

import type { PendingCatch } from "@/lib/admin-tools";
import PendingCatchCard from "@/components/member/admin/PendingCatchCard";

type PendingCatchesSectionProps = { pendingCatches: PendingCatch[]; loading: boolean; workingKey: string | null; isSuperAdmin: boolean; onApprove: (catchId: string) => void; onReject: (catchId: string) => void; };

export default function PendingCatchesSection({ pendingCatches, loading, workingKey, isSuperAdmin, onApprove, onReject }: PendingCatchesSectionProps) {
  return <div className="mt-8"><h3 className="text-xl font-bold text-[#1f2937]">Godkänn fångster</h3><div className="mt-4 space-y-4">{loading ? <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">Laddar väntande fångster...</div> : null}{!loading && pendingCatches.length === 0 ? <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">Inga väntande fångster just nu.</div> : null}{!loading ? pendingCatches.map((item) => <PendingCatchCard key={item.id} item={item} workingKey={workingKey} isSuperAdmin={isSuperAdmin} onApprove={onApprove} onReject={onReject} />) : null}</div></div>;
}
