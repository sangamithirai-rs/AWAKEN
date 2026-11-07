import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGameSave, saveGame } from "./storage";
import { defaultAttributes } from "./gameData";
import { createEmptyEquipment } from "./inventory";
import { createEmptySkillLevels } from "./skills";

const emptyBranches = {
  WARRIOR: 0,
  SCHOLAR: 0,
  SHADOW_HUNTER: 0,
  ARCHITECT: 0,
  PHANTOM: 0,
};

const legacyAttributes = {
  strength: 1,
  intelligence: 1,
  discipline: 1,
  focus: 1,
  consistency: 1,
};

const defaultProfile = {
  name: "SAM",
  hunterClass: "VANGUARD" as const,
  specialization: "WARDEN" as const,
};

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
      version: 4,
      profile: defaultProfile,
      xp: 0,
      attributes: defaultAttributes,
      customQuests: [],
      rewardedQuestPeriods: [],
      questCompletions: 0,
      focusSessions: [],
      activityLog: [],
      activityDates: [],
      skillXP: { BODY: 0, MIND: 0, WILL: 0 },
      skillPoints: 0,
      skillLevels: createEmptySkillLevels(),
      branchXP: emptyBranches,
      classXP: emptyBranches,
      gold: 0,
      inventory: [],
      equipment: createEmptyEquipment(),
      transactions: [],
      recoveryDays: [],
      customCategories: [],
    })).toContain("could not be saved");
  });

  it("round-trips valid versioned saves", () => {
    const { values } = mockStorage();
    const save = {
      version: 4 as const,
      profile: defaultProfile,
      xp: 150,
      attributes: { ...defaultAttributes },
      customQuests: [],
      rewardedQuestPeriods: [],
      questCompletions: 2,
      focusSessions: [],
      activityLog: [],
      activityDates: [],
      skillXP: { BODY: 0, MIND: 0, WILL: 0 },
      skillPoints: 2,
      skillLevels: createEmptySkillLevels(),
      branchXP: emptyBranches,
      classXP: emptyBranches,
      gold: 60,
      inventory: [],
      equipment: createEmptyEquipment(),
      transactions: [],
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
        attributes: { ...legacyAttributes, strength: 4 },
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
    expect(loaded.save.version).toBe(4);
    expect(loaded.save.xp).toBe(800);
    expect(loaded.save.attributes.strength).toBe(4);
    expect(loaded.save.attributes.vitality).toBe(1);
    expect(loaded.save.profile).toEqual(defaultProfile);
    expect(loaded.save.questCompletions).toBe(3);
    expect(loaded.save.activityLog).toHaveLength(2);
    expect(loaded.save.activityLog.map((activity) => activity.kind)).toEqual(["QUEST", "FOCUS"]);
    expect(loaded.save.activityLog[0].xp).toBe(0);
    expect(loaded.save.skillXP).toEqual({ BODY: 0, MIND: 50, WILL: 0 });
    expect(loaded.save.activityDates).toContain("2026-04-10");
  });

  it("migrates version-two attributes and keeps their progression", () => {
    mockStorage({
      "awaken-save": JSON.stringify({
        version: 2,
        xp: 1250,
        attributes: { ...legacyAttributes, intelligence: 6 },
        customQuests: [],
        rewardedQuestPeriods: [],
        questCompletions: 8,
        focusSessions: [],
        activityLog: [],
        activityDates: [],
        skillXP: { BODY: 0, MIND: 0, WILL: 0 },
        recoveryDays: [],
        customCategories: [],
      }),
    });

    const loaded = loadGameSave();
    expect(loaded.save.version).toBe(4);
    expect(loaded.save.xp).toBe(1250);
    expect(loaded.save.attributes.intelligence).toBe(6);
    expect(loaded.save.attributes.creativity).toBe(1);
    expect(loaded.save.profile).toEqual(defaultProfile);
  });

  it("migrates version-three hunter data without discarding existing progression", () => {
    mockStorage({
      "awaken-save": JSON.stringify({
        version: 3,
        profile: {
          name: "RIFT RUNNER",
          hunterClass: "ARTISAN",
          specialization: "FORGEMIND",
        },
        xp: 3400,
        attributes: { ...defaultAttributes, creativity: 8 },
        customQuests: [],
        rewardedQuestPeriods: [],
        questCompletions: 12,
        focusSessions: [],
        activityLog: [
          {
            id: "quest:legacy-physical",
            kind: "QUEST",
            occurredAt: "2026-04-10T12:00:00.000Z",
            activityDate: "2026-04-10",
            xp: 200,
            questId: "daily-movement",
          },
          {
            id: "focus:legacy-focus",
            kind: "FOCUS",
            occurredAt: "2026-04-10T13:00:00.000Z",
            activityDate: "2026-04-10",
            xp: 100,
          },
        ],
        activityDates: ["2026-04-10"],
        skillXP: { BODY: 20, MIND: 40, WILL: 60 },
        recoveryDays: [],
        customCategories: ["DESIGN"],
      }),
    });

    const loaded = loadGameSave();
    expect(loaded.save.version).toBe(4);
    expect(loaded.save.profile.name).toBe("RIFT RUNNER");
    expect(loaded.save.profile.hunterClass).toBe("ARTISAN");
    expect(loaded.save.xp).toBe(3400);
    expect(loaded.save.attributes.creativity).toBe(8);
    expect(loaded.save.questCompletions).toBe(12);
    expect(loaded.save.skillPoints).toBe(3);
    expect(loaded.save.gold).toBe(0);
    expect(loaded.save.inventory).toEqual([]);
    expect(loaded.save.branchXP.WARRIOR).toBe(200);
    expect(loaded.save.classXP.PHANTOM).toBe(100);
  });
});
