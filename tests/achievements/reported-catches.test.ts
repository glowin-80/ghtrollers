import { describe, expect, it } from "vitest";

import {
  formatAchievementRange,
  getCurrentAchievementByValue,
  getNewlyUnlockedAchievementByValue,
  getNextAchievementByValue,
  getRemainingToNextAchievement,
  getResolvedAchievementsByValue,
  getUnlockedAchievementsByValue,
  reportedCatchAchievements,
} from "@/lib/achievements";

describe("reported catch achievements", () => {
  it("returns the correct current title across all threshold boundaries", () => {
    expect(getCurrentAchievementByValue(0, "reported_catches")?.title).toBe("Nyfiken");

    expect(getCurrentAchievementByValue(1, "reported_catches")?.title).toBe("Fiskesugen");
    expect(getCurrentAchievementByValue(19, "reported_catches")?.title).toBe("Fiskesugen");

    expect(getCurrentAchievementByValue(20, "reported_catches")?.title).toBe("Fiskarn");
    expect(getCurrentAchievementByValue(49, "reported_catches")?.title).toBe("Fiskarn");

    expect(getCurrentAchievementByValue(50, "reported_catches")?.title).toBe("Storfiskarn");
    expect(getCurrentAchievementByValue(99, "reported_catches")?.title).toBe("Storfiskarn");

    expect(getCurrentAchievementByValue(100, "reported_catches")?.title).toBe("Fångstjägaren");
    expect(getCurrentAchievementByValue(199, "reported_catches")?.title).toBe("Fångstjägaren");

    expect(getCurrentAchievementByValue(200, "reported_catches")?.title).toBe("Sjöveteranen");
    expect(getCurrentAchievementByValue(399, "reported_catches")?.title).toBe("Sjöveteranen");

    expect(getCurrentAchievementByValue(400, "reported_catches")?.title).toBe("Mästerfiskarn");
    expect(getCurrentAchievementByValue(699, "reported_catches")?.title).toBe("Mästerfiskarn");

    expect(getCurrentAchievementByValue(700, "reported_catches")?.title).toBe("Fångstlegend");
    expect(getCurrentAchievementByValue(999, "reported_catches")?.title).toBe("Fångstlegend");

    expect(getCurrentAchievementByValue(1000, "reported_catches")?.title).toBe("Gäddhängsikon");
    expect(getCurrentAchievementByValue(5000, "reported_catches")?.title).toBe("Gäddhängsikon");
  });

  it("returns the correct next achievement at key points", () => {
    expect(getNextAchievementByValue(0, "reported_catches")?.title).toBe("Fiskesugen");
    expect(getNextAchievementByValue(1, "reported_catches")?.title).toBe("Fiskarn");
    expect(getNextAchievementByValue(19, "reported_catches")?.title).toBe("Fiskarn");

    expect(getNextAchievementByValue(20, "reported_catches")?.title).toBe("Storfiskarn");
    expect(getNextAchievementByValue(49, "reported_catches")?.title).toBe("Storfiskarn");

    expect(getNextAchievementByValue(50, "reported_catches")?.title).toBe("Fångstjägaren");
    expect(getNextAchievementByValue(99, "reported_catches")?.title).toBe("Fångstjägaren");

    expect(getNextAchievementByValue(100, "reported_catches")?.title).toBe("Sjöveteranen");
    expect(getNextAchievementByValue(199, "reported_catches")?.title).toBe("Sjöveteranen");

    expect(getNextAchievementByValue(200, "reported_catches")?.title).toBe("Mästerfiskarn");
    expect(getNextAchievementByValue(399, "reported_catches")?.title).toBe("Mästerfiskarn");

    expect(getNextAchievementByValue(400, "reported_catches")?.title).toBe("Fångstlegend");
    expect(getNextAchievementByValue(699, "reported_catches")?.title).toBe("Fångstlegend");

    expect(getNextAchievementByValue(700, "reported_catches")?.title).toBe("Gäddhängsikon");
    expect(getNextAchievementByValue(999, "reported_catches")?.title).toBe("Gäddhängsikon");

    expect(getNextAchievementByValue(1000, "reported_catches")).toBeNull();
    expect(getNextAchievementByValue(5000, "reported_catches")).toBeNull();
  });

  it("returns the correct remaining count to the next achievement", () => {
    expect(getRemainingToNextAchievement(0, "reported_catches")).toEqual({
      title: "Fiskesugen",
      remaining: 1,
    });

    expect(getRemainingToNextAchievement(1, "reported_catches")).toEqual({
      title: "Fiskarn",
      remaining: 19,
    });

    expect(getRemainingToNextAchievement(19, "reported_catches")).toEqual({
      title: "Fiskarn",
      remaining: 1,
    });

    expect(getRemainingToNextAchievement(20, "reported_catches")).toEqual({
      title: "Storfiskarn",
      remaining: 30,
    });

    expect(getRemainingToNextAchievement(699, "reported_catches")).toEqual({
      title: "Fångstlegend",
      remaining: 1,
    });

    expect(getRemainingToNextAchievement(999, "reported_catches")).toEqual({
      title: "Gäddhängsikon",
      remaining: 1,
    });

    expect(getRemainingToNextAchievement(1000, "reported_catches")).toBeNull();
  });

  it("marks unlocked and current achievements correctly", () => {
    const resolved = getResolvedAchievementsByValue(50, "reported_catches");

    expect(resolved).toHaveLength(reportedCatchAchievements.length);

    const unlockedTitles = resolved
      .filter((achievement) => achievement.unlocked)
      .map((achievement) => achievement.title);
    expect(unlockedTitles).toEqual(["Fiskesugen", "Fiskarn", "Storfiskarn"]);

    const currentTitles = resolved
      .filter((achievement) => achievement.current)
      .map((achievement) => achievement.title);
    expect(currentTitles).toEqual(["Storfiskarn"]);
  });

  it("does not treat Nyfiken as an unlocked badge at zero catches", () => {
    const resolved = getResolvedAchievementsByValue(0, "reported_catches");

    expect(resolved.some((achievement) => achievement.title === "Nyfiken")).toBe(false);
    expect(resolved.some((achievement) => achievement.unlocked)).toBe(false);
    expect(getUnlockedAchievementsByValue(0, "reported_catches")).toEqual([]);
  });

  it("returns unlocked achievements in ascending progression order", () => {
    const unlocked = getUnlockedAchievementsByValue(200, "reported_catches").map(
      (achievement) => achievement.title
    );

    expect(unlocked).toEqual([
      "Fiskesugen",
      "Fiskarn",
      "Storfiskarn",
      "Fångstjägaren",
      "Sjöveteranen",
    ]);
  });

  it("detects newly unlocked achievements at threshold crossings", () => {
    expect(getNewlyUnlockedAchievementByValue(0, 1, "reported_catches")?.title).toBe("Fiskesugen");
    expect(getNewlyUnlockedAchievementByValue(1, 2, "reported_catches")).toBeNull();
    expect(getNewlyUnlockedAchievementByValue(19, 20, "reported_catches")?.title).toBe("Fiskarn");
    expect(getNewlyUnlockedAchievementByValue(20, 21, "reported_catches")).toBeNull();
    expect(getNewlyUnlockedAchievementByValue(49, 50, "reported_catches")?.title).toBe("Storfiskarn");
    expect(getNewlyUnlockedAchievementByValue(99, 100, "reported_catches")?.title).toBe("Fångstjägaren");
    expect(getNewlyUnlockedAchievementByValue(999, 1000, "reported_catches")?.title).toBe("Gäddhängsikon");
  });

  it("formats achievement ranges correctly", () => {
    expect(formatAchievementRange(1, 19)).toBe("1–19 fångster");
    expect(formatAchievementRange(20, 49)).toBe("20–49 fångster");
    expect(formatAchievementRange(1000, null)).toBe("1000+ fångster");
  });
});
