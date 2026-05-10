"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const DEFAULT_BROADCAST_TITLE = "Gäddhäng Trollers";
const DEFAULT_BROADCAST_BODY =
  "🎉 Nytt achievement upplåst! Nu är kategorin Fiskade vatten aktiv i Gäddhäng.";
const DEFAULT_BROADCAST_URL = "/achievements";

type BroadcastResponse = {
  ok?: boolean;
  sentCount?: number;
  failedCount?: number;
  inactiveCount?: number;
  totalActiveSubscriptions?: number;
  error?: string;
};

async function getAccessToken() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session?.access_token ?? null;
}

export default function BroadcastPushPanel() {
  const [title, setTitle] = useState(DEFAULT_BROADCAST_TITLE);
  const [body, setBody] = useState(DEFAULT_BROADCAST_BODY);
  const [url, setUrl] = useState(DEFAULT_BROADCAST_URL);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSendBroadcast() {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedBody) {
      setError("Titel och meddelande behöver vara ifyllda.");
      setMessage(null);
      return;
    }

    const confirmed = window.confirm(
      "Skicka denna broadcast-push till alla med aktiva push-notiser?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorking(true);
      setError(null);
      setMessage(null);

      const token = await getAccessToken();

      if (!token) {
        throw new Error("Du behöver vara inloggad för att skicka broadcast-push.");
      }

      const response = await fetch("/api/push/send-broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trimmedTitle,
          body: trimmedBody,
          url: trimmedUrl,
        }),
      });
      const result = (await response.json().catch(() => null)) as BroadcastResponse | null;

      if (!response.ok) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : "Kunde inte skicka broadcast-push."
        );
      }

      setMessage(
        `Broadcast skickad. Skickade: ${result?.sentCount ?? 0}. Misslyckade: ${result?.failedCount ?? 0}. Inaktiverade döda enheter: ${result?.inactiveCount ?? 0}.`
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Kunde inte skicka broadcast-push."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="mt-6 rounded-[24px] border border-[#d8d2c7] bg-[#fffdfb] p-5 shadow-[0_6px_18px_rgba(18,35,28,0.04)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">
            Super admin
          </div>
          <h3 className="mt-1 text-xl font-bold text-[#1f2937]">
            Broadcast-push
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Skicka ett manuellt meddelande till alla som har aktiva push-notiser. Den här rutan renderas bara för Super admin.
          </p>
        </div>

        <span className="w-fit rounded-full border border-[#d8d2c7] bg-white px-3 py-1.5 text-xs font-bold text-[#374151]">
          Endast Super admin
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="block text-sm font-semibold text-[#374151]">
          Titel
          <input
            type="text"
            value={title}
            maxLength={80}
            disabled={working}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm font-normal text-[#1f2937] outline-none transition focus:border-[#324b2f] disabled:cursor-not-allowed disabled:opacity-70"
          />
        </label>

        <label className="block text-sm font-semibold text-[#374151]">
          Meddelande
          <textarea
            value={body}
            maxLength={240}
            rows={3}
            disabled={working}
            onChange={(event) => setBody(event.target.value)}
            className="mt-2 w-full resize-none rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm font-normal leading-6 text-[#1f2937] outline-none transition focus:border-[#324b2f] disabled:cursor-not-allowed disabled:opacity-70"
          />
        </label>

        <label className="block text-sm font-semibold text-[#374151]">
          Länk i appen
          <input
            type="text"
            value={url}
            maxLength={120}
            disabled={working}
            onChange={(event) => setUrl(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-sm font-normal text-[#1f2937] outline-none transition focus:border-[#324b2f] disabled:cursor-not-allowed disabled:opacity-70"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSendBroadcast}
          disabled={working}
          className="rounded-full bg-[#324b2f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {working ? "Skickar..." : "Skicka broadcast-push"}
        </button>

        <button
          type="button"
          onClick={() => {
            setTitle(DEFAULT_BROADCAST_TITLE);
            setBody(DEFAULT_BROADCAST_BODY);
            setUrl(DEFAULT_BROADCAST_URL);
            setMessage(null);
            setError(null);
          }}
          disabled={working}
          className="rounded-full border border-[#d8d2c7] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Återställ standardtext
        </button>
      </div>

      {message ? (
        <div className="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}
