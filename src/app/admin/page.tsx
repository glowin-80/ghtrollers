"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Catch = {
  id: string;
  caught_for: string;
  registered_by: string | null;
  fish_type: string;
  fine_fish_type: string | null;
  weight_g: number;
  catch_date: string | null;
  location_name: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  original_image_size_bytes: number | null;
  compressed_image_size_bytes: number | null;
  status: string;
};

export default function AdminPage() {
  const [pendingCatches, setPendingCatches] = useState<Catch[]>([]);

  async function loadPending() {
    const { data, error } = await supabase
      .from("catches")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPendingCatches(data || []);
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from("catches")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Fel vid godkännande");
      return;
    }

    loadPending();
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from("catches")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Fel vid nekning");
      return;
    }

    loadPending();
  }

  function getCatchLabel(item: Catch) {
    if (item.fish_type === "Fina fisken" && item.fine_fish_type) {
      return `Fina fisken (${item.fine_fish_type})`;
    }

    return item.fish_type;
  }

  function formatBytesToKb(value: number | null) {
    if (value === null) return "Saknas";
    return `${(value / 1024).toFixed(0)} KB`;
  }

  function formatCoordinate(value: number | null) {
    if (value === null) return "Saknas";
    return value.toFixed(6);
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-center text-2xl font-bold">
          ⚙️ Adminpanel
        </h1>

        <div className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-4 font-semibold">🕒 Väntande fångster</h2>

          {pendingCatches.length === 0 ? (
            <p>Inga väntande fångster.</p>
          ) : (
            <div className="space-y-4">
              {pendingCatches.map((item) => (
                <div key={item.id} className="rounded-xl border p-3">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={`${item.caught_for} fångst`}
                      className="mb-3 h-48 w-full rounded-lg object-cover"
                    />
                  )}

                  <p>
                    <strong>{item.caught_for}</strong> – {getCatchLabel(item)}{" "}
                    {item.weight_g} g
                  </p>

                  <p className="text-sm text-gray-600">
                    {item.location_name} • {item.catch_date}
                  </p>

                  <div className="mt-2 rounded bg-gray-50 p-2 text-sm text-gray-700">
                    <div>
                      Original bildstorlek:{" "}
                      {formatBytesToKb(item.original_image_size_bytes)}
                    </div>
                    <div>
                      Komprimerad bildstorlek:{" "}
                      {formatBytesToKb(item.compressed_image_size_bytes)}
                    </div>
                    <div>Latitud: {formatCoordinate(item.latitude)}</div>
                    <div>Longitud: {formatCoordinate(item.longitude)}</div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="rounded bg-green-600 px-3 py-1 text-white"
                    >
                      Godkänn
                    </button>

                    <button
                      onClick={() => handleReject(item.id)}
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Neka
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
