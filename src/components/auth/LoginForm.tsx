"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verified = searchParams.get("verified") === "1";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      const message = error.message.toLowerCase();

      if (
        message.includes("email not confirmed") ||
        message.includes("email_not_confirmed")
      ) {
        setError("Du behöver verifiera din e-post innan du kan logga in.");
      } else {
        setError("Fel e-post eller lösenord.");
      }

      setLoading(false);
      return;
    }

    window.location.href = "/min-sida";
  }

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h1 className="text-3xl font-bold text-[#1f2937]">🔐 Logga in</h1>
      <p className="mt-2 text-[#6b7280]">
        Logga in med e-post och lösenord för att komma till medlemssidan.
      </p>

      {verified ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Din e-post är verifierad. Du kan nu logga in och invänta att
          medlemskapet granskas.
        </div>
      ) : null}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-[#4b5563]"
          >
            E-post
          </label>

          <input
            id="email"
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

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-[#4b5563]"
          >
            Lösenord
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ditt lösenord"
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            required
            disabled={loading}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="/"
            className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Till startsidan
          </a>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-sm">
          <a
            href="/ansok-om-medlemskap"
            className="font-semibold text-[#324b2f] underline underline-offset-2"
          >
            Ansök om medlemskap
          </a>

          <a
            href="/glomt-losenord"
            className="font-semibold text-[#324b2f] underline underline-offset-2"
          >
            Glömt lösenord?
          </a>
        </div>
      </form>
    </section>
  );
}
