"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveSfvofMeasurement,
  approveSfvofMember,
  getSfvofMemberPageData,
  rejectSfvofMeasurement,
  rejectSfvofMember,
  uploadSfvofProfileImage,
} from "@sfvof/lib/member-page";
import { sfvofSupabase } from "@sfvof/lib/supabase";
import SfvofProfileImageUploader from "@sfvof/components/SfvofProfileImageUploader";
import type { SfvofMeasurement, SfvofMemberPageData, SfvofPendingMember } from "@sfvof/types";

const initialState: SfvofMemberPageData = {
  isLoggedIn: false,
  member: null,
  measurements: [],
  stats: { totalCount: 0, bySpecies: [] },
  pendingMembers: [],
  pendingMeasurements: [],
  errorMessage: null,
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("sv-SE");
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("sv-SE");
}

function formatLength(value: number) {
  return `${Number(value).toFixed(1)} cm`;
}

function getMeasurementLabel(item: SfvofMeasurement) {
  return item.fish_species?.trim() || item.length_interval_label?.trim() || "Mätning";
}

function InlineMessage({ tone, children }: { tone: "error" | "success" | "muted"; children: React.ReactNode }) {
  const classes =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : tone === "success"
        ? "border-[#cfe0ce] bg-[#f5fbf5] text-[#20402a]"
        : "border-[#d8d2c7] bg-[#fffdfb] text-[#6b7280]";

  return <div className={`rounded-2xl border px-4 py-4 text-sm ${classes}`}>{children}</div>;
}

function ProfileCard({
  name,
  imageUrl,
  measurementCount,
  onUpload,
  uploading,
  onLogout,
  isAdmin,
}: {
  name: string;
  imageUrl: string | null;
  measurementCount: number;
  onUpload: (file: File) => void;
  uploading: boolean;
  onLogout: () => Promise<void>;
  isAdmin: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[#d8d2c7] bg-[linear-gradient(180deg,#f7f1e6_0%,#fdfbf7_38%,#ffffff_100%)] shadow-[0_10px_28px_rgba(18,35,28,0.08)]">
      <div className="px-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="h-[108px] w-[108px] overflow-hidden rounded-full border-[3px] border-[#d9c58f] bg-[#efe7d8] shadow-[0_10px_24px_rgba(18,35,28,0.16)]">
                {imageUrl ? (
                  <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[2.1rem] font-bold text-[#8b7b68]">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-[#d8d2c7] bg-white px-3 py-1 text-sm text-[#5b4b3a] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <span className="whitespace-nowrap">{measurementCount} mätningar</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-[0.95rem] font-medium text-[#7a5b1e]">👋 Min sida</div>
              <h1 className="mt-1 text-[2.1rem] font-bold leading-tight text-[#1f2937] sm:text-[2.35rem]">{name}</h1>
              <div className="mt-1 text-[1.1rem] text-[#5b4b3a]">Mätar adjunkt</div>
            </div>
          </div>

          <div className="rounded-full bg-[#efe7d8] px-4 py-2 text-sm font-semibold text-[#5b4b3a]">{isAdmin ? "Admin" : "Medlem"}</div>
        </div>

        <div className="mt-6 pointer-events-none relative">
          <div className="h-px bg-gradient-to-r from-transparent via-[#d6c08a] to-transparent" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcfbf8] px-2.5 text-xs text-[#c8a85c]">✦</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sfvof"
            className="inline-flex min-w-[220px] items-center justify-center rounded-full border border-[#d8d2c7] bg-white px-6 py-4 text-lg font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
          >
            Till startsidan
          </Link>

          <button
            type="button"
            onClick={() => void onLogout()}
            className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#324b2f] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Logga ut
          </button>
        </div>
      </div>

      <div className="px-4 pb-5 pt-6 sm:px-6">
        <div className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
          <h2 className="text-2xl font-bold text-[#1f2937]">Profilbild</h2>
          <p className="mt-3 text-[#6b7280]">Ladda upp en profilbild så visas den här och i SFVOF:s Min sida.</p>

          <SfvofProfileImageUploader
            currentImageUrl={imageUrl}
            uploading={uploading}
            onUploaded={onUpload}
          />
        </div>
      </div>
    </section>
  );
}

function AdminToolsCard({
  pendingMembers,
  pendingMeasurements,
  onApproveMember,
  onRejectMember,
  onApproveMeasurement,
  onRejectMeasurement,
  workingKey,
}: {
  pendingMembers: SfvofPendingMember[];
  pendingMeasurements: SfvofMeasurement[];
  onApproveMember: (userId: string) => Promise<void>;
  onRejectMember: (userId: string) => Promise<void>;
  onApproveMeasurement: (id: number) => Promise<void>;
  onRejectMeasurement: (id: number) => Promise<void>;
  workingKey: string | null;
}) {
  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h2 className="text-3xl font-bold text-[#1f2937]">🛠️ Adminverktyg</h2>
      <p className="mt-3 text-[#6b7280]">Du är admin och kan hantera inkomna medlemsansökningar och väntande mätningar.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
          Väntande medlemsansökningar: <span className="font-bold">{pendingMembers.length}</span>
        </div>
        <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
          Väntande mätningar: <span className="font-bold">{pendingMeasurements.length}</span>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-[#1f2937]">Medlemsansökningar</h3>
        <div className="mt-4 space-y-4">
          {pendingMembers.length === 0 ? <InlineMessage tone="muted">Inga väntande medlemsansökningar just nu.</InlineMessage> : null}
          {pendingMembers.map((member) => (
            <div key={member.user_id} className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-bold text-[#1f2937]">{member.name}</div>
                  <div className="mt-1 text-sm text-[#6b7280]">{member.email}</div>
                  <div className="mt-2 text-xs text-[#6b7280]">Skapad: {formatDateTime(member.created_at)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void onApproveMember(member.user_id)}
                    disabled={workingKey === `member-approve-${member.user_id}`}
                    className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {workingKey === `member-approve-${member.user_id}` ? "Jobbar..." : "Godkänn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onRejectMember(member.user_id)}
                    disabled={workingKey === `member-reject-${member.user_id}`}
                    className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {workingKey === `member-reject-${member.user_id}` ? "Jobbar..." : "Neka"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-[#1f2937]">Godkänn mätningar</h3>
        <div className="mt-4 space-y-4">
          {pendingMeasurements.length === 0 ? <InlineMessage tone="muted">Inga väntande mätningar just nu.</InlineMessage> : null}
          {pendingMeasurements.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-lg font-bold text-[#1f2937]">{getMeasurementLabel(item)}</div>
                  <div className="mt-1 text-sm text-[#6b7280]">{formatLength(item.fish_length_cm)} • {formatDate(item.measured_at)}</div>
                  <div className="mt-2 text-sm text-[#6b7280]">Registrerad av: {item.registered_by_name}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void onApproveMeasurement(item.id)}
                    disabled={workingKey === `measurement-approve-${item.id}`}
                    className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {workingKey === `measurement-approve-${item.id}` ? "Jobbar..." : "Godkänn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onRejectMeasurement(item.id)}
                    disabled={workingKey === `measurement-reject-${item.id}`}
                    className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {workingKey === `measurement-reject-${item.id}` ? "Jobbar..." : "Neka"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsCard({ stats }: { stats: SfvofMemberPageData["stats"] }) {
  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h2 className="text-2xl font-bold text-[#1f2937]">Antal mätta fiskar</h2>
      <p className="mt-3 text-[#6b7280]">Översikt per fiskart. Detta är SFVOF-specifikt och kan senare kopplas vidare till Registrera en Mätning.</p>

      <div className="mt-5 inline-flex rounded-full border border-[#e0d7ca] bg-[#f4eee5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#6b5b48]">
        Totalt {stats.totalCount}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {stats.bySpecies.map((item) => (
          <div key={item.label} className="rounded-[22px] border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 shadow-[0_6px_18px_rgba(18,35,28,0.05)]">
            <div className="text-[1.05rem] text-[#5b4b3a]">{item.label}</div>
            <div className="mt-2 text-[2rem] font-bold leading-none text-[#1f2937]">{item.count}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MeasurementsCard({ measurements }: { measurements: SfvofMeasurement[] }) {
  const years = useMemo(() => {
    const unique = Array.from(new Set(measurements.map((item) => new Date(item.measured_at).getFullYear())));
    return unique.sort((a, b) => b - a);
  }, [measurements]);

  const [selectedYear, setSelectedYear] = useState<string>("all");

  const filtered = useMemo(() => {
    if (selectedYear === "all") return measurements;
    return measurements.filter((item) => String(new Date(item.measured_at).getFullYear()) === selectedYear);
  }, [measurements, selectedYear]);

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#1f2937]">🎣 Mina mätningar</h2>
          <div className="mt-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[#7a6f63]">Filter</div>
        </div>
        <div className="rounded-full bg-[#efe7d8] px-4 py-2 text-sm font-semibold text-[#5b4b3a]">{filtered.length} st</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setSelectedYear("all")}
          className={`rounded-full border px-5 py-3 text-lg transition ${selectedYear === "all" ? "border-[#d8d2c7] bg-[#f4eee5] text-[#5b4b3a]" : "border-[#d8d2c7] bg-white text-[#5f6c7b] hover:bg-[#f9f7f3]"}`}
        >
          Visa allt
        </button>

        <div className="relative">
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="appearance-none rounded-full border border-[#d8d2c7] bg-[#f4eee5] px-5 py-3 pr-10 text-lg text-[#5f6c7b] outline-none"
          >
            <option value="all">Alla år</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6b7280]">▼</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? <InlineMessage tone="muted">Inga mätningar matchar valt filter ännu.</InlineMessage> : null}
        {filtered.map((item) => (
          <div key={item.id} className="rounded-[24px] border border-[#d8d2c7] bg-[#fffdfb] p-4 shadow-[0_6px_18px_rgba(18,35,28,0.05)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[2rem] font-bold leading-none text-[#1f2937]">{getMeasurementLabel(item)}</div>
                <div className="mt-3 text-lg text-[#6b7280]">{formatLength(item.fish_length_cm)} • {formatDate(item.measured_at)} • {item.comment?.trim() || "Mätning registrerad"}</div>
                <div className="mt-3 text-lg text-[#6b7280]">Mätt av: {item.registered_by_name}</div>
              </div>
              <div className={`inline-flex rounded-full px-4 py-2 text-lg font-semibold ${item.is_approved ? "bg-[#e6f3e8] text-[#3b7a4a]" : "bg-[#fdf1d9] text-[#9a6a12]"}`}>
                {item.is_approved ? "Godkänd" : "Väntar"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SfvofMemberPage() {
  const router = useRouter();
  const [pageData, setPageData] = useState<SfvofMemberPageData>(initialState);
  const [loading, setLoading] = useState(true);
  const [workingKey, setWorkingKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [flashMessage, setFlashMessage] = useState<{ tone: "error" | "success"; message: string } | null>(null);

  async function loadPage() {
    setLoading(true);
    const nextData = await getSfvofMemberPageData();
    setPageData(nextData);
    setLoading(false);
  }

  useEffect(() => {
    void loadPage();
  }, []);

  async function handleLogout() {
    await sfvofSupabase.auth.signOut();
    router.push("/sfvof");
    router.refresh();
  }

  async function handleProfileUpload(file: File) {
    if (!pageData.member) return;
    setUploading(true);
    setFlashMessage(null);
    try {
      await uploadSfvofProfileImage(pageData.member.user_id, file);
      setFlashMessage({ tone: "success", message: "Profilbilden uppdaterades." });
      await loadPage();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunde inte ladda upp profilbilden.";
      setFlashMessage({ tone: "error", message });
    } finally {
      setUploading(false);
    }
  }

  async function handleApproveMember(userId: string) {
    setWorkingKey(`member-approve-${userId}`);
    try {
      await approveSfvofMember(userId);
      await loadPage();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunde inte godkänna medlemmen.";
      setFlashMessage({ tone: "error", message });
    } finally {
      setWorkingKey(null);
    }
  }

  async function handleRejectMember(userId: string) {
    setWorkingKey(`member-reject-${userId}`);
    try {
      await rejectSfvofMember(userId);
      await loadPage();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunde inte neka medlemmen.";
      setFlashMessage({ tone: "error", message });
    } finally {
      setWorkingKey(null);
    }
  }

  async function handleApproveMeasurement(id: number) {
    setWorkingKey(`measurement-approve-${id}`);
    try {
      await approveSfvofMeasurement(id);
      await loadPage();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunde inte godkänna mätningen.";
      setFlashMessage({ tone: "error", message });
    } finally {
      setWorkingKey(null);
    }
  }

  async function handleRejectMeasurement(id: number) {
    setWorkingKey(`measurement-reject-${id}`);
    try {
      await rejectSfvofMeasurement(id);
      await loadPage();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunde inte neka mätningen.";
      setFlashMessage({ tone: "error", message });
    } finally {
      setWorkingKey(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#ede7dc] px-4 pb-10 pt-6">
        <div className="mx-auto max-w-6xl">
          <InlineMessage tone="muted">Laddar SFVOF Min sida...</InlineMessage>
        </div>
      </main>
    );
  }

  if (!pageData.isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#ede7dc] px-4 pb-10 pt-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <InlineMessage tone="muted">Du behöver logga in för att öppna SFVOF Min sida.</InlineMessage>
          <Link href="/sfvof/login" className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]">Till SFVOF-login</Link>
        </div>
      </main>
    );
  }

  if (!pageData.member) {
    return (
      <main className="min-h-screen bg-[#ede7dc] px-4 pb-10 pt-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <InlineMessage tone="error">{pageData.errorMessage || "Du saknar SFVOF-medlemsrad ännu."}</InlineMessage>
          <Link href="/sfvof" className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]">Till startsidan</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#ede7dc] px-4 pb-10 pt-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {flashMessage ? <InlineMessage tone={flashMessage.tone}>{flashMessage.message}</InlineMessage> : null}
        {pageData.errorMessage ? <InlineMessage tone="error">{pageData.errorMessage}</InlineMessage> : null}

        <ProfileCard
          name={pageData.member.name}
          imageUrl={pageData.member.profile_image_url}
          measurementCount={pageData.measurements.length}
          onUpload={handleProfileUpload}
          uploading={uploading}
          onLogout={handleLogout}
          isAdmin={pageData.member.is_admin}
        />

        {pageData.member.is_admin ? (
          <AdminToolsCard
            pendingMembers={pageData.pendingMembers}
            pendingMeasurements={pageData.pendingMeasurements}
            onApproveMember={handleApproveMember}
            onRejectMember={handleRejectMember}
            onApproveMeasurement={handleApproveMeasurement}
            onRejectMeasurement={handleRejectMeasurement}
            workingKey={workingKey}
          />
        ) : null}

        <StatsCard stats={pageData.stats} />
        <MeasurementsCard measurements={pageData.measurements} />
      </div>
    </main>
  );
}
