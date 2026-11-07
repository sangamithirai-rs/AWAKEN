import { describe, expect, it } from "vitest";
import { combineQuests, getDefaultAttribute, getRank } from "./gameData";

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

  it("maps creative categories to a meaningful character stat", () => {
    expect(getDefaultAttribute("CODING")).toBe("creativity");
    expect(getDefaultAttribute("PROJECT")).toBe("creativity");
    expect(getDefaultAttribute("FITNESS")).toBe("strength");
  });

  it("applies hunter ranks at their level thresholds", () => {
    expect([1, 4, 5, 9, 10, 14, 15, 19, 20, 29, 30, 49, 50].map(getRank)).toEqual([
      "E", "E", "E+", "E+", "D", "D", "C", "C", "B", "B", "A", "A", "S",
    ]);
  });
});
