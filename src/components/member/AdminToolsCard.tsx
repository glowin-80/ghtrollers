"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type PendingMember = {
  id: string;
  name: string | null;
  email: string | null;
  category: string | null;
  created_at: string | null;
  is_admin: boolean | null;
  is_active: boolean | null;
};

type PendingCatch = {
  id: string;
  caught_for: string;
  registered_by: string;
  fish_type: string;
  fine_fish_type: string | null;
  weight_g: number;
  catch_date: string;
  location_name: string | null;
  image_url: string | null;
  status: string;
  created_at: string | null;
};

export default function AdminToolsCard() {
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [pendingCatches, setPendingCatches] = useState<PendingCatch[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingCatches, setLoadingCatches] = useState(true);
  const [workingKey, setWorkingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingMembersCount = useMemo(
    () => pendingMembers.length,
    [pendingMembers]
  );

  const pendingCatchesCount = useMemo(
    () => pendingCatches.length,
    [pendingCatches]
  );

  useEffect(() => {
    loadPendingMembers();
    loadPendingCatches();
  }, []);

  async function loadPendingMembers() {
    try {
      setLoadingMembers(true);
      setError(null);

      const { data, error } = await supabase
        .from("members")
        .select("id, name, email, category, created_at, is_admin, is_active")
        .eq("is_active", false)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      setPendingMembers(data || []);
    } catch (err) {
      console.error(err);
      setError("Kunde inte ladda väntande medlemsansökningar.");
    } finally {
      setLoadingMembers(false);
    }
  }

  async function loadPendingCatches() {
    try {
      setLoadingCatches(true);
      setError(null);

      const { data, error } = await supabase
        .from("catches")
        .select(
          "id, caught_for, registered_by, fish_type, fine_fish_type, weight_g, catch_date, location_name, image_url, status, created_at"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      setPendingCatches(data || []);
    } catch (err) {
      console.error(err);
      setError("Kunde inte ladda väntande fångster.");
    } finally {
      setLoadingCatches(false);
    }
  }

  async function approveMember(memberId: string) {
    try {
      setWorkingKey(`member-approve-${memberId}`);
      setError(null);

      const { error } = await supabase
        .from("members")
        .update({ is_active: true })
        .eq("id", memberId);

      if (error) {
        throw error;
      }

      setPendingMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      console.error(err);
      setError("Kunde inte godkänna medlemmen.");
    } finally {
      setWorkingKey(null);
    }
  }

  async function makeAdmin(memberId: string) {
    try {
      setWorkingKey(`member-admin-${memberId}`);
      setError(null);

      const { error } = await supabase
        .from("members")
        .update({ is_admin: true, is_active: true })
        .eq("id", memberId);

      if (error) {
        throw error;
      }

      setPendingMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      console.error(err);
      setError("Kunde inte göra medlemmen till admin.");
    } finally {
      setWorkingKey(null);
    }
  }

  async function rejectMember(memberId: string) {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort denna ansökan?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingKey(`member-reject-${memberId}`);
      setError(null);

      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", memberId);

      if (error) {
        throw error;
      }

      setPendingMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err) {
      console.error(err);
      setError(
        "Kunde inte ta bort ansökan. Om användaren redan finns i auth kan vi bygga ett snyggare nekaflöde sen."
      );
    } finally {
      setWorkingKey(null);
    }
  }

  async function approveCatch(catchId: string) {
    try {
      setWorkingKey(`catch-approve-${catchId}`);
      setError(null);

      const { error } = await supabase
        .from("catches")
        .update({ status: "approved" })
        .eq("id", catchId);

      if (error) {
        throw error;
      }

      setPendingCatches((prev) => prev.filter((item) => item.id !== catchId));
    } catch (err) {
      console.error(err);
      setError("Kunde inte godkänna fångsten.");
    } finally {
      setWorkingKey(null);
    }
  }

  async function rejectCatch(catchId: string) {
    const confirmed = window.confirm(
      "Är du säker på att du vill ta bort denna fångst?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingKey(`catch-reject-${catchId}`);
      setError(null);

      const { error } = await supabase
        .from("catches")
        .delete()
        .eq("id", catchId);

      if (error) {
        throw error;
      }

      setPendingCatches((prev) => prev.filter((item) => item.id !== catchId));
    } catch (err) {
      console.error(err);
      setError("Kunde inte ta bort fångsten.");
    } finally {
      setWorkingKey(null);
    }
  }

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h2 className="text-3xl font-bold text-[#1f2937]">🛠️ Adminverktyg</h2>

      <p className="mt-3 text-[#6b7280]">
        Du är admin och kan hantera inkomna medlemsansökningar och väntande fångster.
      </p>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
          Väntande medlemsansökningar:{" "}
          <span className="font-bold">{pendingMembersCount}</span>
        </div>

        <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#374151]">
          Väntande fångster: <span className="font-bold">{pendingCatchesCount}</span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold text-[#1f2937]">Medlemsansökningar</h3>

        <div className="mt-4 space-y-4">
          {loadingMembers ? (
            <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
              Laddar väntande medlemsansökningar...
            </div>
          ) : null}

          {!loadingMembers && pendingMembers.length === 0 ? (
            <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
              Inga väntande medlemsansökningar just nu.
            </div>
          ) : null}

          {!loadingMembers &&
            pendingMembers.map((member) => {
              const displayName =
                member.name?.trim() || member.email || "Namnlös medlem";

              return (
                <div
                  key={member.id}
                  className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-lg font-bold text-[#1f2937]">
                        {displayName}
                      </div>

                      <div className="mt-1 text-sm text-[#6b7280]">
                        {member.email || "Ingen e-post sparad"}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-[#ede7dc] px-3 py-1 text-[#5b4b3a]">
                          {member.category || "Ej vald"}
                        </span>

                        <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[#4b5563]">
                          Väntar på granskning
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => approveMember(member.id)}
                        disabled={workingKey === `member-approve-${member.id}`}
                        className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {workingKey === `member-approve-${member.id}`
                          ? "Jobbar..."
                          : "Godkänn"}
                      </button>

                      <button
                        type="button"
                        onClick={() => makeAdmin(member.id)}
                        disabled={workingKey === `member-admin-${member.id}`}
                        className="rounded-full border border-[#c8b28c] bg-[#fff7ea] px-4 py-2 text-sm font-semibold text-[#7a5b1e] transition hover:bg-[#fbeecf] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {workingKey === `member-admin-${member.id}`
                          ? "Jobbar..."
                          : "Gör admin"}
                      </button>

                      <button
                        type="button"
                        onClick={() => rejectMember(member.id)}
                        disabled={workingKey === `member-reject-${member.id}`}
                        className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {workingKey === `member-reject-${member.id}`
                          ? "Jobbar..."
                          : "Neka"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-[#1f2937]">Godkänn fångster</h3>

        <div className="mt-4 space-y-4">
          {loadingCatches ? (
            <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
              Laddar väntande fångster...
            </div>
          ) : null}

          {!loadingCatches && pendingCatches.length === 0 ? (
            <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#6b7280]">
              Inga väntande fångster just nu.
            </div>
          ) : null}

          {!loadingCatches &&
            pendingCatches.map((item) => {
              const fishLabel =
                item.fish_type === "Fina fisken" && item.fine_fish_type
                  ? `${item.fish_type} • ${item.fine_fish_type}`
                  : item.fish_type;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt="Fångstbild"
                        className="h-32 w-full rounded-2xl object-cover lg:w-40"
                      />
                    ) : null}

                    <div className="flex-1">
                      <div className="text-lg font-bold text-[#1f2937]">
                        {item.caught_for}
                      </div>

                      <div className="mt-1 text-sm text-[#6b7280]">
                        Registrerad av {item.registered_by}
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-[#374151] md:grid-cols-2">
                        <div>
                          <span className="font-semibold">Art:</span> {fishLabel}
                        </div>
                        <div>
                          <span className="font-semibold">Vikt:</span> {item.weight_g} g
                        </div>
                        <div>
                          <span className="font-semibold">Datum:</span> {item.catch_date}
                        </div>
                        <div>
                          <span className="font-semibold">Plats:</span>{" "}
                          {item.location_name || "Ej angiven"}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => approveCatch(item.id)}
                          disabled={workingKey === `catch-approve-${item.id}`}
                          className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {workingKey === `catch-approve-${item.id}`
                            ? "Jobbar..."
                            : "Godkänn fångst"}
                        </button>

                        <button
                          type="button"
                          onClick={() => rejectCatch(item.id)}
                          disabled={workingKey === `catch-reject-${item.id}`}
                          className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {workingKey === `catch-reject-${item.id}`
                            ? "Jobbar..."
                            : "Ta bort"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}