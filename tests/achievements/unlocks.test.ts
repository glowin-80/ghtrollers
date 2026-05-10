import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENT_START_ISO,
  clampAchievementUnlockedAt,
  createAchievementUnlockMap,
  getAchievementUnlockedAt,
} from "@/lib/achievement-unlocks";

const achievement = {
  id: "catch_01",
  categoryId: "reported_catches",
};

describe("achievement unlock history", () => {
  it("clamps old unlock dates to the achievement start date", () => {
    expect(clampAchievementUnlockedAt("2026-02-10T12:00:00.000Z")).toBe(
      ACHIEVEMENT_START_ISO
    );
  });

  it("keeps unlock dates after the achievement start date", () => {
    expect(clampAchievementUnlockedAt("2026-03-10T12:00:00.000Z")).toBe(
      "2026-03-10T12:00:00.000Z"
    );
  });

  it("resolves unlock dates by category and achievement id", () => {
    const map = createAchievementUnlockMap([
      {
        category_id: "reported_catches",
        achievement_id: "catch_01",
        unlocked_at: "2026-03-01T00:00:00.000Z",
      },
    ]);

    expect(getAchievementUnlockedAt(map, achievement)).toBe("2026-03-01T00:00:00.000Z");
  });
});
