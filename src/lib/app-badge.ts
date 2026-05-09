const CLEAR_NOTIFICATION_APP_BADGE_MESSAGE =
  "GADDHANG_CLEAR_NOTIFICATION_APP_BADGE";

declare global {
  interface Navigator {
    setAppBadge?: (contents?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  }
}

function getSafeBadgeCount(count: number) {
  return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
}

export async function setAppBadgeCount(count: number) {
  if (typeof navigator === "undefined") {
    return;
  }

  const safeCount = getSafeBadgeCount(count);

  try {
    if (safeCount > 0 && typeof navigator.setAppBadge === "function") {
      await navigator.setAppBadge(safeCount);
      return;
    }

    await clearAppBadgeCount();
  } catch (error) {
    console.warn("Could not set app badge count.", error);
  }
}

export async function clearAppBadgeCount() {
  if (typeof navigator === "undefined") {
    return;
  }

  try {
    if (typeof navigator.clearAppBadge === "function") {
      await navigator.clearAppBadge();
      return;
    }

    if (typeof navigator.setAppBadge === "function") {
      await navigator.setAppBadge(0);
    }
  } catch (error) {
    console.warn("Could not clear app badge count.", error);
  }
}

async function notifyServiceWorkerToClearAppBadge() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active ?? navigator.serviceWorker.controller;

    worker?.postMessage({ type: CLEAR_NOTIFICATION_APP_BADGE_MESSAGE });
  } catch (error) {
    console.warn("Could not notify service worker to clear app badge.", error);
  }
}

export async function clearNotificationAppBadge() {
  await Promise.all([
    clearAppBadgeCount(),
    notifyServiceWorkerToClearAppBadge(),
  ]);
}