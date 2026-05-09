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

export async function setAppBadgeCount(count: number) {
  const badgeNavigator = getBadgeNavigator();

  if (!badgeNavigator?.setAppBadge) {
    return;
  }

  try {
    if (count > 0) {
      await badgeNavigator.setAppBadge(count);
    } else if (badgeNavigator.clearAppBadge) {
      await badgeNavigator.clearAppBadge();
    } else {
      await badgeNavigator.setAppBadge(0);
    }
  } catch (error) {
    console.warn("Could not update app badge.", error);
  }
}

export async function clearAppBadgeCount() {
  const badgeNavigator = getBadgeNavigator();

  if (!badgeNavigator) {
    return;
  }

  try {
    if (badgeNavigator.clearAppBadge) {
      await badgeNavigator.clearAppBadge();
      return;
    }

    if (badgeNavigator.setAppBadge) {
      await badgeNavigator.setAppBadge(0);
    }
  } catch (error) {
    console.warn("Could not clear app badge.", error);
  }
}
