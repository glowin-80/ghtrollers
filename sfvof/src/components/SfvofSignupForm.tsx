"use client";

import Link from "next/link";
import { useState } from "react";
import { sfvofSupabase } from "@sfvof/lib/supabase";

function InlineMessage({
  tone,
  message,
}: {
  tone: "error" | "success";
  message: string;
}) {
  const classes =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-green-200 bg-green-50 text-green-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>
      {message}
    </div>
  );
}

export default function SfvofSignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError("Alla fält måste fyllas i.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await sfvofSupabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/sfvof/login?verified=1`,
        data: {
          name: trimmedName,
          app_context: "sfvof",
        },
      },
    });

    if (signUpError) {
      setError(`Kunde inte skapa konto: ${signUpError.message}`);
      setLoading(false);
      return;
    }

    setSuccess(
      "Vi har skickat ett verifieringsmail till din e-post. När adressen är bekräftad kan du logga in på SFVOF. Därefter behöver din SFVOF-medlemsrad aktiveras innan du får full access.",
    );

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-7">
      <h1 className="text-3xl font-bold text-[#1f2937] sm:text-4xl">
        📝 Ansök om medlemskap
      </h1>
      <p className="mt-3 text-lg text-[#4b5563]">
        Skapa konto för att ansöka om medlemskap i SFVOF.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#1f2937]">
            Namn
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="För- och efternamn"
            className="w-full rounded-2xl border border-[#d8d2c7] px-4 py-3 outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#1f2937]">
            E-post
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="namn@email.se"
            className="w-full rounded-2xl border border-[#d8d2c7] px-4 py-3 outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#1f2937]">
            Lösenord
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Välj ett lösenord"
            className="w-full rounded-2xl border border-[#d8d2c7] px-4 py-3 outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#1f2937]">
            Bekräfta lösenord
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Skriv lösenordet igen"
            className="w-full rounded-2xl border border-[#d8d2c7] px-4 py-3 outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            disabled={loading}
            required
          />
        </div>

        {error ? <InlineMessage tone="error" message={error} /> : null}
        {success ? <InlineMessage tone="success" message={success} /> : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/sfvof/login"
            className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Till login
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Skapar konto..." : "Ansök om medlemskap"}
          </button>
        </div>
      </form>
    </section>
  );
}
