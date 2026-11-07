import { describe, expect, it } from "vitest";
import { getAchievementProgress } from "./achievements";

describe("achievement progression", () => {
  it("unlocks quest and level achievements directly from progression", () => {
    const achievements = getAchievementProgress(5, 3);

    expect(achievements.filter((item) => item.unlocked).map((item) => item.id)).toEqual([
      "FIRST_AWAKENING",
      "DISCIPLINED",
      "FOCUS_PROTOCOL",
      "RISING_HUNTER",
    ]);
  });

  it("caps displayed progress at the requirement", () => {
    const achievements = getAchievementProgress(12, 8);

    expect(achievements.find((item) => item.id === "SHADOW_MONARCH")).toMatchObject({
      progress: 10,
      target: 10,
      unlocked: true,
    });
    expect(achievements.find((item) => item.id === "KNOWLEDGE_SEEKER")).toMatchObject({
      progress: 5,
      target: 5,
      unlocked: true,
    });
  });
});
