self.addEventListener("push", (event) => {
  let payload = {
    title: "Gäddhäng Trollers",
    body: "Du har en ny notis från Gäddhäng Trollers.",
    url: "/",
  };

  if (event.data) {
    try {
      payload = {
        ...payload,
        ...event.data.json(),
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  const title = payload.title || "Gäddhäng Trollers";
  const options = {
    body: payload.body || "Du har en ny notis från Gäddhäng Trollers.",
    icon: payload.icon || "/header.png",
    badge: payload.badge || "/header.png",
    data: {
      url: payload.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
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
    })
  );
});
