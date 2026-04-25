"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { MemberProfile } from "@/types/member-page";

type PushPreferences = {
  notify_new_catch: boolean;
  notify_new_achievement: boolean;
  notify_new_all_time_high: boolean;
};

type PushStatusResponse = {
  isActive: boolean;
  activeDeviceCount: number;
  preferences: PushPreferences;
  adminStats: null | {
    activeMemberCount: number;
    activeDeviceCount: number;
  };
};

type PushNotificationSettingsProps = {
  member: MemberProfile;
};

const defaultPreferences: PushPreferences = {
  notify_new_catch: true,
  notify_new_achievement: true,
  notify_new_all_time_high: true,
};

const preferenceOptions: Array<{
  key: keyof PushPreferences;
  label: string;
  description: string;
}> = [
  {
    key: "notify_new_catch",
    label: "Ny godkänd fångst",
    description: "När en fångst godkänns och syns i Gäddhäng.",
  },
  {
    key: "notify_new_achievement",
    label: "Nytt achievement",
    description: "När en medlem låser upp en ny achievement-nivå.",
  },
  {
    key: "notify_new_all_time_high",
    label: "Nytt All-time-high",
    description: "När en godkänd fångst skapar ett nytt historiskt rekord.",
  },
];

function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

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

async function fetchWithAuth(path: string, init?: RequestInit) {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("Du behöver vara inloggad för att hantera notiser.");
  }

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      typeof body?.error === "string"
        ? body.error
        : "Kunde inte hantera push-notiser just nu."
    );
  }

  return response;
}

export default function PushNotificationSettings({
  member,
}: PushNotificationSettingsProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unknown">(
    "unknown"
  );
  const [isActive, setIsActive] = useState(false);
  const [activeDeviceCount, setActiveDeviceCount] = useState(0);
  const [preferences, setPreferences] = useState<PushPreferences>(defaultPreferences);
  const [adminStats, setAdminStats] = useState<PushStatusResponse["adminStats"]>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = Boolean(member.is_super_admin);

  const statusLabel = useMemo(() => {
    if (supported === false) return "Stöds inte på denna enhet";
    if (permission === "denied") return "Blockerad i webbläsaren";
    if (isActive) return "På";
    return "Av";
  }, [isActive, permission, supported]);

  const loadStatus = useCallback(async () => {
    const nextSupported = isPushSupported();
    setSupported(nextSupported);
    setPermission(
      typeof Notification !== "undefined" ? Notification.permission : "unknown"
    );

    if (!nextSupported) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth("/api/push/status", { method: "GET" });
      const status = (await response.json()) as PushStatusResponse;
      setIsActive(status.isActive);
      setActiveDeviceCount(status.activeDeviceCount);
      setPreferences(status.preferences ?? defaultPreferences);
      setAdminStats(status.adminStats ?? null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Kunde inte läsa status för push-notiser."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function getReadyServiceWorkerRegistration() {
    await navigator.serviceWorker.register("/sw.js");
    return navigator.serviceWorker.ready;
  }

  async function getVapidPublicKey() {
    const response = await fetch("/api/push/public-key", { method: "GET" });

    if (!response.ok) {
      throw new Error(
        "Push-notiser är inte färdigkonfigurerade med VAPID-nyckel ännu."
      );
    }

    const body = (await response.json()) as { publicKey?: string };

    if (!body.publicKey) {
      throw new Error("VAPID public key saknas.");
    }

    return body.publicKey;
  }

  const syncSubscription = useCallback(
    async (nextPreferences: PushPreferences) => {
      if (!isPushSupported()) {
        throw new Error("Push-notiser stöds inte på denna enhet.");
      }

      const registration = await getReadyServiceWorkerRegistration();
      const publicKey = await getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const existingSubscription = await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        }));

      await fetchWithAuth("/api/push/subscribe", {
        method: "POST",
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          preferences: nextPreferences,
        }),
      });
    },
    []
  );

  async function handleEnable() {
    try {
      setWorking(true);
      setError(null);
      setMessage(null);

      if (!isPushSupported()) {
        throw new Error("Push-notiser stöds inte på denna enhet eller webbläsare.");
      }

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        throw new Error("Du behöver tillåta notiser för att aktivera dem.");
      }

      await syncSubscription(preferences);
      await loadStatus();
      setMessage("Push-notiser är aktiverade på denna enhet.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Kunde inte aktivera push-notiser."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleDisable() {
    try {
      setWorking(true);
      setError(null);
      setMessage(null);

      let endpoint: string | null = null;

      if (isPushSupported()) {
        const registration = await navigator.serviceWorker.ready.catch(() => null);
        const subscription = await registration?.pushManager.getSubscription();
        endpoint = subscription?.endpoint ?? null;
        await subscription?.unsubscribe();
      }

      await fetchWithAuth("/api/push/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ endpoint }),
      });

      await loadStatus();
      setMessage("Push-notiser är avstängda på denna enhet.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Kunde inte stänga av push-notiser."
      );
    } finally {
      setWorking(false);
    }
  }

  async function handlePreferenceChange(key: keyof PushPreferences, value: boolean) {
    const nextPreferences = {
      ...preferences,
      [key]: value,
    };

    setPreferences(nextPreferences);
    setMessage(null);
    setError(null);

    if (!isActive || permission !== "granted") {
      return;
    }

    try {
      setWorking(true);
      await syncSubscription(nextPreferences);
      await loadStatus();
      setMessage("Notisinställningarna är sparade.");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Kunde inte spara notisinställningarna."
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">
            Notiser
          </div>
          <h2 className="mt-1 text-2xl font-bold text-[#1f2937]">
            Push-notiser
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Aktivera notiser på denna enhet och välj vilka typer av händelser du vill få notiser om.
          </p>
        </div>

        <div className="rounded-full border border-[#d8d2c7] bg-[#fcfbf8] px-4 py-2 text-sm font-semibold text-[#374151]">
          Status: {loading ? "Laddar..." : statusLabel}
        </div>
      </div>

      {supported === false ? (
        <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          Den här enheten eller webbläsaren verkar inte stödja webb-push. På iPhone behöver appen normalt öppnas från hemskärmen.
        </div>
      ) : null}

      {permission === "denied" ? (
        <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          Notiser är blockerade i webbläsaren. Ändra tillåtelse i webbläsarens eller telefonens inställningar om du vill aktivera dem igen.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {preferenceOptions.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-start gap-3 rounded-[20px] border border-[#e5ddd0] bg-[#fffdf9] px-4 py-3 text-sm text-[#374151]"
          >
            <input
              type="checkbox"
              checked={preferences[option.key]}
              disabled={working || loading}
              onChange={(event) =>
                void handlePreferenceChange(option.key, event.target.checked)
              }
              className="mt-1 h-4 w-4 rounded border-[#cfc6b8] text-[#324b2f] focus:ring-[#d9cfbf]"
            />
            <span>
              <span className="block font-semibold text-[#1f2937]">
                {option.label}
              </span>
              <span className="mt-1 block leading-5 text-[#6b7280]">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {isActive ? (
          <button
            type="button"
            onClick={handleDisable}
            disabled={working || loading}
            className="rounded-full border border-[#d8d2c7] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Stäng av notiser
          </button>
        ) : (
          <button
            type="button"
            onClick={handleEnable}
            disabled={working || loading || supported === false || permission === "denied"}
            className="rounded-full bg-[#324b2f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e5d3b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Aktivera notiser
          </button>
        )}

        {isActive ? (
          <span className="text-sm text-[#6b7280]">
            Aktiva enheter för dig: {activeDeviceCount}
          </span>
        ) : null}
      </div>

      {isSuperAdmin && adminStats ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-[#e5ddd0] bg-[#fcfbf8] px-4 py-3 text-sm text-[#374151]">
            Push aktiverat av medlemmar: <span className="font-bold">{adminStats.activeMemberCount}</span>
          </div>
          <div className="rounded-[18px] border border-[#e5ddd0] bg-[#fcfbf8] px-4 py-3 text-sm text-[#374151]">
            Aktiva push-enheter: <span className="font-bold">{adminStats.activeDeviceCount}</span>
          </div>
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}
