const APP_BADGE_STATE_CACHE = "gaddhang-app-badge-state-v1";
const APP_BADGE_STATE_URL = "/__gaddhang-app-badge-state.json";
const CLEAR_NOTIFICATION_APP_BADGE_MESSAGE = "GADDHANG_CLEAR_NOTIFICATION_APP_BADGE";
const INCREMENT_NOTIFICATION_APP_BADGE_ACTION = "increment";

async function readStoredAppBadgeCount() {
  try {
    const cache = await caches.open(APP_BADGE_STATE_CACHE);
    const response = await cache.match(APP_BADGE_STATE_URL);

    if (!response) {
      return 0;
    }

    const state = await response.json();
    const count = Number(state?.count);

    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch (error) {
    console.warn("Could not read stored app badge count.", error);
    return 0;
  }
}

async function writeStoredAppBadgeCount(count) {
  try {
    const safeCount = Number.isFinite(Number(count))
      ? Math.max(0, Math.floor(Number(count)))
      : 0;
    const cache = await caches.open(APP_BADGE_STATE_CACHE);

    await cache.put(
      APP_BADGE_STATE_URL,
      new Response(JSON.stringify({ count: safeCount }), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (error) {
    console.warn("Could not store app badge count.", error);
  }
}

async function setNativeAppBadge(count) {
  try {
    if (typeof self.registration?.setAppBadge === "function") {
      await self.registration.setAppBadge(count);
    }
  } catch (error) {
    console.warn("Could not set app badge.", error);
  }
}

async function clearNativeAppBadge() {
  try {
    if (typeof self.registration?.clearAppBadge === "function") {
      await self.registration.clearAppBadge();
      return;
    }

    if (typeof self.registration?.setAppBadge === "function") {
      await self.registration.setAppBadge(0);
    }
  } catch (error) {
    console.warn("Could not clear app badge.", error);
  }
}

async function incrementNotificationAppBadge() {
  const nextCount = (await readStoredAppBadgeCount()) + 1;

  await writeStoredAppBadgeCount(nextCount);
  await setNativeAppBadge(nextCount);
}

async function clearNotificationAppBadge() {
  await writeStoredAppBadgeCount(0);
  await clearNativeAppBadge();
}

function readPushPayload(event) {
  const fallbackPayload = {
    title: "Gäddhäng Trollers",
    body: "Du har en ny notis från Gäddhäng Trollers.",
    url: "/",
  };

  if (!event.data) {
    return fallbackPayload;
  }

  try {
    return {
      ...fallbackPayload,
      ...event.data.json(),
    };
  } catch {
    return {
      ...fallbackPayload,
      body: event.data.text(),
    };
  }
}

function buildNotificationOptions(payload) {
  return {
    body: payload.body || "Du har en ny notis från Gäddhäng Trollers.",
    icon: payload.icon || "/header.png",
    badge: payload.badge || "/header.png",
    data: {
      url: payload.url || "/",
    },
  };
}

async function showPushNotificationAndUpdateBadge(payload) {
  const title = payload.title || "Gäddhäng Trollers";

  await self.registration.showNotification(title, buildNotificationOptions(payload));

  if (payload.appBadgeAction === INCREMENT_NOTIFICATION_APP_BADGE_ACTION) {
    await incrementNotificationAppBadge();
  }
}

self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);

  event.waitUntil(showPushNotificationAndUpdateBadge(payload));
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== CLEAR_NOTIFICATION_APP_BADGE_MESSAGE) {
    return;
  }

  event.waitUntil(clearNotificationAppBadge());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    Promise.all([
      clearNotificationAppBadge(),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        const existingClient = clients.find((client) => {
          try {
            const clientUrl = new URL(client.url);
            const normalizedTargetUrl = new URL(targetUrl, self.location.origin);
            return clientUrl.pathname === normalizedTargetUrl.pathname;
          } catch {
            return false;
          }
        });

        if (existingClient) {
          return existingClient.focus();
        }

        return self.clients.openWindow(targetUrl);
      }),
    ])
  );
});
