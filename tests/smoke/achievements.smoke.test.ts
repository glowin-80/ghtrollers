import { describe, expect, it } from "vitest";

import { getCurrentAchievementByValue } from "@/lib/achievements";

describe("test infrastructure smoke test", () => {
  it("can resolve app aliases and import domain logic", () => {
    expect(getCurrentAchievementByValue(0, "reported_catches")?.title).toBe("Nyfiken");
  });
});
