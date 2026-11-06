import { describe, expect, it } from "vitest";
import { combineQuests } from "./gameData";

describe("quest data", () => {
  it("preserves user-created categories and boss objective progress", () => {
    const [quest] = combineQuests([{
      id: "custom-boss",
      title: "Ship the project",
      description: "Complete the milestones.",
      xp: 450,
      type: "LAUNCH",
      cadence: "ONCE",
      priority: "HIGH",
      kind: "BOSS",
      goalCount: 3,
      currentCount: 2,
    }]).slice(3);

    expect(quest.type).toBe("LAUNCH");
    expect(quest.kind).toBe("BOSS");
    expect(quest.cadence).toBe("ONCE");
    expect(quest.goalCount).toBe(3);
    expect(quest.currentCount).toBe(2);
    expect(quest.priority).toBe("HIGH");
  });
});
