import { describe, expect, it } from "vitest";

import {
  formatAchievementRange,
  getAchievementProgressValue,
  getCurrentAchievementByValue,
  getNewlyUnlockedAchievementByValue,
  getNextAchievementByValue,
  getUnlockedAchievementsByValue,
} from "@/lib/achievements";
import { getApprovedPublicFishingSpotCount } from "@/lib/fishing-spot-achievements";

describe("fishing spot achievements", () => {
  it("returns the correct current title across all threshold boundaries", () => {
    expect(getCurrentAchievementByValue(0, "fishing_spots")?.title).toBe("Kartlös");
    expect(getCurrentAchievementByValue(1, "fishing_spots")?.title).toBe("Platsletare");
    expect(getCurrentAchievementByValue(4, "fishing_spots")?.title).toBe("Platsletare");
    expect(getCurrentAchievementByValue(5, "fishing_spots")?.title).toBe("Gäddhängsnavigator");
    expect(getCurrentAchievementByValue(9, "fishing_spots")?.title).toBe("Gäddhängsnavigator");
    expect(getCurrentAchievementByValue(10, "fishing_spots")?.title).toBe("Vattenvägvisare");
    expect(getCurrentAchievementByValue(24, "fishing_spots")?.title).toBe("Vattenvägvisare");
    expect(getCurrentAchievementByValue(25, "fishing_spots")?.title).toBe("Fiskeplatsjägare");
    expect(getCurrentAchievementByValue(49, "fishing_spots")?.title).toBe("Fiskeplatsjägare");
    expect(getCurrentAchievementByValue(50, "fishing_spots")?.title).toBe("Sjökännare");
    expect(getCurrentAchievementByValue(99, "fishing_spots")?.title).toBe("Sjökännare");
    expect(getCurrentAchievementByValue(100, "fishing_spots")?.title).toBe("Kartmästare");
    expect(getCurrentAchievementByValue(199, "fishing_spots")?.title).toBe("Kartmästare");
    expect(getCurrentAchievementByValue(200, "fishing_spots")?.title).toBe("Gäddhängsguide");
    expect(getCurrentAchievementByValue(500, "fishing_spots")?.title).toBe("Gäddhängsguide");
  });

  it("returns the correct next achievement and unlocked levels", () => {
    expect(getNextAchievementByValue(0, "fishing_spots")?.title).toBe("Platsletare");
    expect(getNextAchievementByValue(1, "fishing_spots")?.title).toBe("Gäddhängsnavigator");
    expect(getNextAchievementByValue(99, "fishing_spots")?.title).toBe("Kartmästare");
    expect(getNextAchievementByValue(200, "fishing_spots")).toBeNull();

    expect(getUnlockedAchievementsByValue(10, "fishing_spots").map((achievement) => achievement.title)).toEqual([
      "Platsletare",
      "Gäddhängsnavigator",
      "Vattenvägvisare",
    ]);
  });

  it("detects newly unlocked fishing spot achievements", () => {
    expect(getNewlyUnlockedAchievementByValue(0, 1, "fishing_spots")?.title).toBe("Platsletare");
    expect(getNewlyUnlockedAchievementByValue(1, 4, "fishing_spots")).toBeNull();
    expect(getNewlyUnlockedAchievementByValue(4, 5, "fishing_spots")?.title).toBe("Gäddhängsnavigator");
    expect(getNewlyUnlockedAchievementByValue(99, 100, "fishing_spots")?.title).toBe("Kartmästare");
    expect(getNewlyUnlockedAchievementByValue(199, 200, "fishing_spots")?.title).toBe("Gäddhängsguide");
  });

  it("uses approved public fishing spots as the category value", () => {
    expect(
      getAchievementProgressValue({
        categoryId: "fishing_spots",
        catchCount: 99,
        uniqueWaterCount: 88,
        fishingSpotCount: 7,
      })
    ).toBe(7);
  });

  it("counts only approved public fishing spots", () => {
    expect(
      getApprovedPublicFishingSpotCount([
        { status: "approved", is_private: false },
        { status: "approved", is_private: null },
        { status: "approved", is_private: true },
        { status: "pending", is_private: false },
        { status: "rejected", is_private: false },
      ])
    ).toBe(2);
  });

  it("formats fishing spot ranges correctly", () => {
    expect(formatAchievementRange(1, 4, "fishing_spots")).toBe("1–4 fiskeplatser");
    expect(formatAchievementRange(5, 9, "fishing_spots")).toBe("5–9 fiskeplatser");
    expect(formatAchievementRange(200, null, "fishing_spots")).toBe("200+ fiskeplatser");
  });
});
