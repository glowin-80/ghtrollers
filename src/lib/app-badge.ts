const CLEAR_NOTIFICATION_APP_BADGE_MESSAGE = "GADDHANG_CLEAR_NOTIFICATION_APP_BADGE";

declare global {
  interface Navigator {
    setAppBadge?: (contents?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
  }
}

async function clearNavigatorAppBadge() {
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
    console.warn("Could not clear app badge.", error);
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
    clearNavigatorAppBadge(),
    notifyServiceWorkerToClearAppBadge(),
  ]);
}
