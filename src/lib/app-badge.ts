type BadgeNavigator = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

function getBadgeNavigator() {
  if (typeof navigator === "undefined") {
    return null;
  }

  return navigator as BadgeNavigator;
}

export async function setPwaAppBadge(count: number) {
  const badgeNavigator = getBadgeNavigator();

  if (!badgeNavigator?.setAppBadge) {
    return;
  }

  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

  try {
    if (safeCount > 0) {
      await badgeNavigator.setAppBadge(safeCount);
      return;
    }

    await clearPwaAppBadge();
  } catch (error) {
    console.warn("Could not set PWA app badge.", error);
  }
}

export async function clearPwaAppBadge() {
  const badgeNavigator = getBadgeNavigator();

  if (!badgeNavigator?.clearAppBadge) {
    return;
  }

  try {
    await badgeNavigator.clearAppBadge();
  } catch (error) {
    console.warn("Could not clear PWA app badge.", error);
  }
}
