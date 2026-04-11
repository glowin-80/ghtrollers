"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProfileCard from "@/components/member/ProfileCard";
import StatsGrid from "@/components/member/StatsGrid";
import MyCatchesSection from "@/components/member/MyCatchesSection";
import AdminToolsCard from "@/components/member/AdminToolsCard";
import PendingApprovalCard from "@/components/member/PendingApprovalCard";
import MemberCatchSpotlightModal from "@/components/member/MemberCatchSpotlightModal";
import { useMemberPageData } from "@/hooks/useMemberPageData";
import { signOutMember } from "@/lib/member-service";

export default function MinSidaPage() {
  const [selectedCatchId, setSelectedCatchId] = useState<string | null>(null);
  const [reportTargetCatchId, setReportTargetCatchId] = useState<string | null>(null);
  const [hideLiveScope, setHideLiveScope] = useState(false);
  const [hideAbroad, setHideAbroad] = useState(false);
  const { pageLoading, catchesLoading, member, catches, error, catchesError, loadMemberCatches, handleProfileImageUploaded } = useMemberPageData();

  const visibleCatches = useMemo(() => catches.filter((item) => !(hideLiveScope && item.fishing_method === "Live-scope") && !(hideAbroad && item.caught_abroad)), [catches, hideAbroad, hideLiveScope]);
  const selectedCatch = useMemo(() => visibleCatches.find((item) => item.id === selectedCatchId) || null, [visibleCatches, selectedCatchId]);

  async function handleLogout() { await signOutMember(); window.location.href = "/"; }

  if (pageLoading) return <main className="px-4 pb-8 pt-4"><div className="mx-auto max-w-5xl"><div className="rounded-[26px] border border-[#d8d2c7] bg-white/95 px-5 py-5 text-sm text-[#4b5563] shadow-[0_8px_24px_rgba(18,35,28,0.06)]">Laddar medlemssidan...</div></div></main>;
  if (error) return <main className="px-4 pb-8 pt-4"><div className="mx-auto max-w-5xl"><div className="rounded-[26px] border border-red-200 bg-white/95 px-5 py-5 text-sm text-red-700 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">{error}</div></div></main>;
  if (!member) return <main className="px-4 pb-8 pt-4"><div className="mx-auto max-w-4xl"><div className="rounded-[26px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]"><h1 className="text-2xl font-bold text-[#1f2937]">🔐 Min sida</h1><p className="mt-3 text-sm text-[#6b7280]">Du är inte inloggad ännu. Logga in för att komma till medlemssidan.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/" className="inline-flex rounded-full bg-[#324b2f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]">Till startsidan</Link><Link href="/login" className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]">Logga in</Link></div></div></div></main>;
  if (!member.is_active) return <main className="px-4 pb-8 pt-4"><div className="mx-auto max-w-5xl space-y-4"><ProfileCard member={member} catchCount={0} onLogout={handleLogout} /><PendingApprovalCard /></div></main>;

  return <><main className="px-4 pb-8 pt-4"><div className="mx-auto max-w-5xl space-y-4"><ProfileCard member={member} catchCount={catches.length} onLogout={handleLogout} onProfileImageUploaded={handleProfileImageUploaded} />{member.is_admin || member.is_super_admin ? <AdminToolsCard /> : null}{catchesLoading ? <section className="rounded-[26px] border border-[#d8d2c7] bg-white/95 px-5 py-5 text-sm text-[#4b5563] shadow-[0_8px_24px_rgba(18,35,28,0.06)]">Laddar dina fångster...</section> : null}{catchesError ? <section className="rounded-[26px] border border-amber-200 bg-white/95 p-5 text-[#7a4b00] shadow-[0_8px_24px_rgba(18,35,28,0.06)]"><div className="text-sm font-semibold">{catchesError}</div><p className="mt-2 text-sm text-[#8a5a00]">Resten av sidan fungerar, men fångstdelen kunde inte hämtas just nu.</p><button type="button" onClick={() => loadMemberCatches(member.name || "")} className="mt-4 rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]">Försök igen</button></section> : null}{!catchesLoading && !catchesError ? <><section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]"><div className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">Filter på mina sidor</div><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><label className="flex items-start gap-3 rounded-2xl border border-[#e5ddd0] bg-[#fffdf9] px-4 py-3 text-sm text-[#374151]"><input type="checkbox" checked={hideLiveScope} onChange={(e) => setHideLiveScope(e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#cfc6b8] text-[#324b2f] focus:ring-[#d9cfbf]" /><span>Visa inte fångster med Live-scope</span></label><label className="flex items-start gap-3 rounded-2xl border border-[#e5ddd0] bg-[#fffdf9] px-4 py-3 text-sm text-[#374151]"><input type="checkbox" checked={hideAbroad} onChange={(e) => setHideAbroad(e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#cfc6b8] text-[#324b2f] focus:ring-[#d9cfbf]" /><span>Visa inte fångster utomlands</span></label></div></section><StatsGrid catches={visibleCatches} memberRole={member.member_role} onSelectCatch={setSelectedCatchId} /><MyCatchesSection catches={visibleCatches} targetCatchId={reportTargetCatchId} onTargetHandled={() => setReportTargetCatchId(null)} /></> : null}</div></main><MemberCatchSpotlightModal catchItem={selectedCatch} onClose={() => setSelectedCatchId(null)} onNavigateToCatchReport={(catchId) => { setSelectedCatchId(null); setReportTargetCatchId(catchId); }} /></>;
}
