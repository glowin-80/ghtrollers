"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("junior");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=1`,
        data: {
          name: trimmedName,
          category,
        },
      },
    });

    if (error) {
      setError(`Kunde inte skapa konto: ${error.message}`);
      setLoading(false);
      return;
    }

    setSuccess(
      "Vi har skickat ett verifieringsmail till din e-post. Bekräfta din adress först. Därefter kan du logga in och invänta att medlemskapet granskas."
    );

    setName("");
    setCategory("junior");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  };

  if (success) {
    return (
      <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
        <h1 className="text-4xl font-bold text-[#1f2937]">✅ Ansökan skickad</h1>
        <p className="mt-4 text-lg leading-8 text-[#4b5563]">{success}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/login"
            className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Till login
          </a>

          <a
            href="/"
            className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
          >
            Till startsidan
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h1 className="text-4xl font-bold text-[#1f2937]">📝 Ansök om medlemskap</h1>
      <p className="mt-3 text-lg text-[#4b5563]">
        Skapa konto för att ansöka om medlemskap i Gäddhäng.
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
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#1f2937]">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-[#d8d2c7] px-4 py-3 outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
          >
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
          </select>
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
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <a
            href="/login"
            className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Till login
          </a>

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