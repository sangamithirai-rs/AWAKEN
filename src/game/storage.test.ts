import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGameSave, saveGame } from "./storage";
import { defaultAttributes } from "./gameData";

function mockStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const storage = {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => values.set(key, value)),
  };
  vi.stubGlobal("localStorage", storage);
  return { storage, values };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("game storage", () => {
  it("migrates valid legacy XP and skips malformed attributes", () => {
    mockStorage({
      "awaken-xp": "1200",
      "awaken-attributes": JSON.stringify({ strength: "high" }),
    });
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const loaded = loadGameSave();
    expect(loaded.save.xp).toBe(1200);
    expect(loaded.save.attributes).toEqual(defaultAttributes);
    expect(loaded.warning).toContain("Invalid attributes");
  });

  it("returns a warning instead of throwing when browser storage is unavailable", () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(() => {
        throw new Error("blocked");
      }),
    };
    vi.stubGlobal("localStorage", storage);
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(loadGameSave().warning).toContain("could not be read");
    expect(saveGame({
      version: 2,
      xp: 0,
      attributes: defaultAttributes,
      customQuests: [],
      rewardedQuestPeriods: [],
      questCompletions: 0,
      focusSessions: [],
      activityLog: [],
      activityDates: [],
      skillXP: { BODY: 0, MIND: 0, WILL: 0 },
      recoveryDays: [],
      customCategories: [],
    })).toContain("could not be saved");
  });

  it("round-trips valid versioned saves", () => {
    const { values } = mockStorage();
    const save = {
      version: 2 as const,
      xp: 150,
      attributes: { ...defaultAttributes },
      customQuests: [],
      rewardedQuestPeriods: [],
      questCompletions: 2,
      focusSessions: [],
      activityLog: [],
      activityDates: [],
      skillXP: { BODY: 0, MIND: 0, WILL: 0 },
      recoveryDays: [],
      customCategories: ["HEALTH"],
    };
    expect(saveGame(save)).toBeNull();
    expect(JSON.parse(values.get("awaken-save") ?? "null")).toEqual(save);
    expect(loadGameSave().save).toEqual(save);
  });

  it("migrates valid version-one saves without losing existing progression", () => {
    mockStorage({
      "awaken-save": JSON.stringify({
        version: 1,
        xp: 800,
        attributes: { ...defaultAttributes, strength: 4 },
        customQuests: [],
        rewardedQuestPeriods: [
          "[\"daily-movement\",\"DAILY\",\"2026-04-10\"]",
          "[\"quest\",\"ONCE\",\"once\"]",
        ],
        questCompletions: 3,
        focusSessions: [{
          id: "legacy-focus",
          task: "Study",
          durationMinutes: 25,
          xp: 50,
          completedAt: "2026-04-10T12:00:00.000Z",
        }],
      }),
    });

    const loaded = loadGameSave();
    expect(loaded.save.version).toBe(2);
    expect(loaded.save.xp).toBe(800);
    expect(loaded.save.attributes.strength).toBe(4);
    expect(loaded.save.questCompletions).toBe(3);
    expect(loaded.save.activityLog).toHaveLength(2);
    expect(loaded.save.activityLog.map((activity) => activity.kind)).toEqual(["QUEST", "FOCUS"]);
    expect(loaded.save.activityLog[0].xp).toBe(0);
    expect(loaded.save.skillXP).toEqual({ BODY: 0, MIND: 50, WILL: 0 });
    expect(loaded.save.activityDates).toContain("2026-04-10");
  });
});
