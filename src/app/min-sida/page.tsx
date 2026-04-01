"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateMemberStats } from "@/lib/member-page";
import type { MemberCatch, MemberProfile } from "@/types/member-page";
import ProfileCard from "@/components/member/ProfileCard";
import StatsGrid from "@/components/member/StatsGrid";
import MyCatchesSection from "@/components/member/MyCatchesSection";
import AdminToolsCard from "@/components/member/AdminToolsCard";
import PendingApprovalCard from "@/components/member/PendingApprovalCard";

export default function MinSidaPage() {
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [catches, setCatches] = useState<MemberCatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => calculateMemberStats(catches), [catches]);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        setMember(null);
        setCatches([]);
        setLoading(false);
        return;
      }

      const user = session.user;

      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .select("id, name, email, is_admin, is_active, profile_image_url")
        .eq("id", user.id)
        .maybeSingle();

      if (memberError) {
        throw memberError;
      }

      const resolvedMember: MemberProfile = memberData
        ? memberData
        : {
            id: user.id,
            name:
              (user.user_metadata?.name as string | undefined) ||
              user.email ||
              "Medlem",
            email: user.email,
            is_admin: false,
            is_active: false,
            profile_image_url: null,
          };

      setMember(resolvedMember);

      if (!resolvedMember.is_active) {
        setCatches([]);
        setLoading(false);
        return;
      }

      const memberName = resolvedMember.name || "";

      const { data: catchesData, error: catchesError } = await supabase
        .from("catches")
        .select(
          "id, caught_for, registered_by, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, status, created_at"
        )
        .or(`caught_for.eq.${memberName},registered_by.eq.${memberName}`)
        .order("catch_date", { ascending: false });

      if (catchesError) {
        throw catchesError;
      }

      setCatches(catchesData || []);
    } catch (err) {
      console.error(err);
      setError("Kunde inte ladda medlemssidan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function handleProfileImageUploaded(imageUrl: string) {
    setMember((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profile_image_url: imageUrl,
      };
    });
  }

  if (loading) {
    return (
      <main className="px-4 pb-10 pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            Laddar medlemssidan...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-4 pb-10 pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[28px] border border-red-200 bg-white/95 p-6 text-red-700 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="px-4 pb-10 pt-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            <h1 className="text-3xl font-bold text-[#1f2937]">🔐 Min sida</h1>
            <p className="mt-3 text-[#6b7280]">
              Du är inte inloggad ännu. Logga in för att komma till medlemssidan.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="/"
                className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
              >
                Till startsidan
              </a>

              <a
                href="/login"
                className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
              >
                Logga in
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!member.is_active) {
    return (
      <main className="px-4 pb-10 pt-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <ProfileCard
            member={member}
            catchCount={0}
            onLogout={handleLogout}
          />
          <PendingApprovalCard />
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pb-10 pt-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <ProfileCard
          member={member}
          catchCount={catches.length}
          onLogout={handleLogout}
          onProfileImageUploaded={handleProfileImageUploaded}
        />

        {member.is_admin ? <AdminToolsCard /> : null}

        <StatsGrid stats={stats} />

        <MyCatchesSection catches={catches} />
      </div>
    </main>
  );
}
