"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sfvofSupabase } from "@sfvof/lib/supabase";

function isLockError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";

  return message.includes("another request stole it") || message.includes("lock");
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export default function SfvofResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submittingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const {
          data: { session },
        } = await sfvofSupabase.auth.getSession();

        if (!mounted) return;

        setCanReset(!!session);
        setReady(true);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setCanReset(false);
        setReady(true);
      }
    }

    void init();

    const {
      data: { subscription },
    } = sfvofSupabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setCanReset(!!session);
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function updatePasswordWithRetry(newPassword: string) {
    try {
      const result = await sfvofSupabase.auth.updateUser({
        password: newPassword,
      });

      if (result.error) {
        throw result.error;
      }

      return;
    } catch (err) {
      if (isLockError(err)) {
        await wait(500);

        const retryResult = await sfvofSupabase.auth.updateUser({
          password: newPassword,
        });

        if (retryResult.error) {
          throw retryResult.error;
        }

        return;
      }

      throw err;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submittingRef.current || saving) return;

    setError(null);

    if (password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    try {
      submittingRef.current = true;
      setSaving(true);

      await updatePasswordWithRetry(password);

      setSuccess(true);
    } catch (err) {
      console.error(err);

      if (isLockError(err)) {
        setError(
          "Det blev en tillfällig krock i inloggningen. Vänta en sekund och prova igen."
        );
      } else {
        setError("Kunde inte uppdatera lösenordet.");
      }
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
        Laddar återställning...
      </section>
    );
  }

  if (success) {
    return (
      <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
        <h1 className="text-3xl font-bold text-[#1f2937]">✅ Lösenord uppdaterat</h1>

        <p className="mt-3 text-[#6b7280]">
          Ditt lösenord är nu uppdaterat. Du kan logga in med ditt nya lösenord i SFVOF.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/sfvof/login"
            className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Till SFVOF-login
          </Link>
        </div>
      </section>
    );
  }

  if (!canReset) {
    return (
      <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
        <h1 className="text-3xl font-bold text-[#1f2937]">🔐 Återställ lösenord</h1>

        <p className="mt-3 text-[#6b7280]">
          Öppna sidan via länken i återställningsmailet för att sätta ett nytt lösenord.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/sfvof/glomt-losenord"
            className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Skicka nytt återställningsmail
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-7">
      <h1 className="text-3xl font-bold text-[#1f2937]">🔐 Sätt nytt lösenord</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="sfvof-reset-password"
            className="mb-2 block text-sm font-semibold text-[#4b5563]"
          >
            Nytt lösenord
          </label>

          <input
            id="sfvof-reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nytt lösenord"
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            required
            disabled={saving}
          />
        </div>

        <div>
          <label
            htmlFor="sfvof-reset-confirm-password"
            className="mb-2 block text-sm font-semibold text-[#4b5563]"
          >
            Bekräfta nytt lösenord
          </label>

          <input
            id="sfvof-reset-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Skriv lösenordet igen"
            className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
            required
            disabled={saving}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Sparar..." : "Spara nytt lösenord"}
          </button>
        </div>
      </form>
    </section>
  );
}
