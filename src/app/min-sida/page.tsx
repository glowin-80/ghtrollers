"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calculateMemberStats } from "@/lib/member-page";
import type { MemberCatch, MemberProfile } from "@/types/member-page";
import ProfileCard from "@/components/member/ProfileCard";
import StatsGrid from "@/components/member/StatsGrid";
import MyCatchesSection from "@/components/member/MyCatchesSection";
import AdminToolsCard from "@/components/member/AdminToolsCard";
import PendingApprovalCard from "@/components/member/PendingApprovalCard";

export default function MinSidaPage() {
  const mountedRef = useRef(true);

  const [pageLoading, setPageLoading] = useState(true);
  const [catchesLoading, setCatchesLoading] = useState(false);

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [catches, setCatches] = useState<MemberCatch[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [catchesError, setCatchesError] = useState<string | null>(null);

  const stats = useMemo(() => calculateMemberStats(catches), [catches]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMemberCatches = useCallback(async (memberName: string) => {
    try {
      if (mountedRef.current) {
        setCatchesLoading(true);
        setCatchesError(null);
      }

      const { data: catchesData, error: catchesLoadError } = await supabase
        .from("catches")
        .select(
          "id, caught_for, registered_by, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, status, created_at"
        )
        .or(`caught_for.eq.${memberName},registered_by.eq.${memberName}`)
        .order("catch_date", { ascending: false });

      if (catchesLoadError) {
        throw catchesLoadError;
      }

      if (!mountedRef.current) return;

      setCatches(catchesData || []);
    } catch (err) {
      console.error(err);

      if (!mountedRef.current) return;

      setCatches([]);
      setCatchesError("Kunde inte ladda dina fångster just nu.");
    } finally {
      if (mountedRef.current) {
        setCatchesLoading(false);
      }
    }
  }, []);

  const loadPage = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setPageLoading(true);
        setError(null);
        setCatchesError(null);
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        if (!mountedRef.current) return;

        setMember(null);
        setCatches([]);
        setPageLoading(false);
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

      if (!mountedRef.current) return;

      setMember(resolvedMember);
      setPageLoading(false);

      if (!resolvedMember.is_active) {
        setCatches([]);
        return;
      }

      await loadMemberCatches(resolvedMember.name || "");
    } catch (err) {
      console.error(err);

      if (!mountedRef.current) return;

      setError("Kunde inte ladda medlemssidan.");
      setPageLoading(false);
    }
  }, [loadMemberCatches]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

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

  if (pageLoading) {
    return (
      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[26px] border border-[#d8d2c7] bg-white/95 px-5 py-5 text-sm text-[#4b5563] shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            Laddar medlemssidan...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[26px] border border-red-200 bg-white/95 px-5 py-5 text-sm text-red-700 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[26px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            <h1 className="text-2xl font-bold text-[#1f2937]">🔐 Min sida</h1>
            <p className="mt-3 text-sm text-[#6b7280]">
              Du är inte inloggad ännu. Logga in för att komma till medlemssidan.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex rounded-full bg-[#324b2f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
              >
                Till startsidan
              </Link>

              <Link
                href="/login"
                className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
              >
                Logga in
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!member.is_active) {
    return (
      <main className="px-4 pb-8 pt-4">
        <div className="mx-auto max-w-5xl space-y-4">
          <ProfileCard member={member} catchCount={0} onLogout={handleLogout} />
          <PendingApprovalCard />
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pb-8 pt-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <ProfileCard
          member={member}
          catchCount={catches.length}
          onLogout={handleLogout}
          onProfileImageUploaded={handleProfileImageUploaded}
        />

        {member.is_admin ? <AdminToolsCard /> : null}

        {catchesLoading ? (
          <section className="rounded-[26px] border border-[#d8d2c7] bg-white/95 px-5 py-5 text-sm text-[#4b5563] shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            Laddar dina fångster...
          </section>
        ) : null}

        {catchesError ? (
          <section className="rounded-[26px] border border-amber-200 bg-white/95 p-5 text-[#7a4b00] shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            <div className="text-sm font-semibold">{catchesError}</div>
            <p className="mt-2 text-sm text-[#8a5a00]">
              Resten av sidan fungerar, men fångstdelen kunde inte hämtas just nu.
            </p>

            <button
              type="button"
              onClick={() => loadMemberCatches(member.name || "")}
              className="mt-4 rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
            >
              Försök igen
            </button>
          </section>
        ) : null}

        {!catchesLoading && !catchesError ? (
          <>
            <StatsGrid stats={stats} />
            <MyCatchesSection catches={catches} />
          </>
        ) : null}
      </div>
    </main>
  );
}