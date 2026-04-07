"use client";

import Link from "next/link";
import { useState } from "react";
import { sfvofSupabase } from "@sfvof/lib/supabase";

function isRateLimitError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";

  return (
    message.includes("rate limit") ||
    message.includes("email rate limit exceeded")
  );
}

export default function SfvofForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);
    setSent(false);

    try {
      const { error } = await sfvofSupabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/sfvof/aterstall-losenord`,
        }
      );

      if (error) {
        throw error;
      }

      setSent(true);
    } catch (err) {
      console.error(err);

      if (isRateLimitError(err)) {
        setError(
          "Du har försökt för många gånger på kort tid. Vänta en stund och prova igen."
        );
      } else {
        setError("Kunde inte skicka återställningsmail just nu.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-7">
      <h1 className="text-3xl font-bold text-[#1f2937]">🔑 Glömt lösenord</h1>

      <p className="mt-2 text-[#6b7280]">
        Ange din e-post så skickar vi en återställningslänk för SFVOF.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="sfvof-forgot-email"
            className="mb-2 block text-sm font-semibold text-[#4b5563]"
          >
            E-post
          </label>

          <input
            id="sfvof-forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="namn@email.se"
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            required
            disabled={loading}
          />
        </div>

        {sent ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Om det finns ett konto kopplat till adressen har vi skickat ett återställningsmail.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/sfvof/login"
            className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Till SFVOF-login
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Skickar..." : "Skicka återställningsmail"}
          </button>
        </div>
      </form>
    </section>
  );
}
