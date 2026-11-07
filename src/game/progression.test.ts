import { describe, expect, it } from "vitest";
import { getLocalWeekKey } from "./gameData";
import {
  getLevelProgress,
  advanceBossQuest,
  grantFocusSessionReward,
  grantItemUse,
  grantQuestReward,
  getRecoveryStatus,
  getStreakProgress,
  getWeeklyStreakProgress,
  type ProgressionState,
} from "./progression";
import { createEmptyEquipment } from "./inventory";
import { createEmptySkillLevels } from "./skills";
import { unlockSkill } from "./skills";
import type { FocusSession, Quest } from "../types/game";

const initialState: ProgressionState = {
  profile: {
    name: "SAM",
    hunterClass: "VANGUARD",
    specialization: "WARDEN",
  },
  xp: 0,
  attributes: {
    strength: 1,
    intelligence: 1,
    vitality: 1,
    discipline: 1,
    creativity: 1,
    focus: 1,
    consistency: 1,
  },
  questCompletions: 0,
  rewardedQuestPeriods: [],
  focusSessions: [],
  activityLog: [],
  activityDates: [],
  skillXP: { BODY: 0, MIND: 0, WILL: 0 },
  skillPoints: 0,
  skillLevels: createEmptySkillLevels(),
  branchXP: {
    WARRIOR: 0,
    SCHOLAR: 0,
    SHADOW_HUNTER: 0,
    ARCHITECT: 0,
    PHANTOM: 0,
  },
  classXP: {
    WARRIOR: 0,
    SCHOLAR: 0,
    SHADOW_HUNTER: 0,
    ARCHITECT: 0,
    PHANTOM: 0,
  },
  gold: 0,
  inventory: [],
  equipment: createEmptyEquipment(),
  transactions: [],
  recoveryDays: [],
};

function makeQuest(cadence: Quest["cadence"]): Quest {
  return {
    id: "test-quest",
    title: "Test quest",
    description: "Test",
    xp: 100,
    icon: () => null,
    attribute: "discipline",
    cadence,
    priority: "NORMAL",
    kind: "STANDARD",
    goalCount: 1,
    currentCount: 0,
  };
}

describe("progression", () => {
  it("calculates level boundaries and progress", () => {
    expect(getLevelProgress(999)).toEqual({
      level: 1,
      currentXP: 999,
      remainingXP: 1,
      percentage: 99.9,
    });
    expect(getLevelProgress(1000)).toEqual({
      level: 2,
      currentXP: 0,
      remainingXP: 1000,
      percentage: 0,
    });
  });

  it("supports rewards that cross multiple level thresholds", () => {
    const quest = { ...makeQuest("ONCE"), xp: 3000 };
    const result = grantQuestReward(initialState, quest, new Date(2026, 3, 10, 12));
    expect(result.leveledUp).toBe(true);
    expect(getLevelProgress(result.state.xp).level).toBe(4);
    expect(result.state.skillPoints).toBe(3);
    expect(result.state.gold).toBeGreaterThan(0);
  });

  it("grants a daily quest reward only once per local day", () => {
    const quest = makeQuest("DAILY");
    const date = new Date(2026, 3, 10, 12);
    const first = grantQuestReward(initialState, quest, date);
    const repeated = grantQuestReward(first.state, quest, date);
    const nextDay = grantQuestReward(
      first.state,
      quest,
      new Date(2026, 3, 11, 12),
    );

    expect(first.granted).toBe(true);
    expect(repeated.granted).toBe(false);
    expect(nextDay.granted).toBe(true);
    expect(nextDay.state.xp).toBe(200);
    expect(first.state.gold).toBe(5);
    expect(repeated.state.gold).toBe(5);
    expect(nextDay.state.gold).toBe(10);
  });

  it("uses Monday as the start of the weekly quest period", () => {
    const monday = new Date(2026, 3, 6, 12);
    const sunday = new Date(2026, 3, 12, 12);
    const nextMonday = new Date(2026, 3, 13, 12);
    expect(getLocalWeekKey(monday)).toBe(getLocalWeekKey(sunday));
    expect(getLocalWeekKey(sunday)).not.toBe(getLocalWeekKey(nextMonday));

    const quest = makeQuest("WEEKLY");
    const first = grantQuestReward(initialState, quest, monday);
    expect(grantQuestReward(first.state, quest, sunday).granted).toBe(false);
    expect(grantQuestReward(first.state, quest, nextMonday).granted).toBe(true);
  });

  it("grants a one-time quest reward only once", () => {
    const first = grantQuestReward(initialState, makeQuest("ONCE"));
    expect(grantQuestReward(first.state, makeQuest("ONCE")).granted).toBe(false);
  });

  it("deduplicates focus sessions and keeps only the latest 500", () => {
    const makeSession = (id: string): FocusSession => ({
      id,
      task: "Study",
      durationMinutes: 25,
      xp: 50,
      completedAt: "2026-04-10T12:00:00.000Z",
    });
    const first = grantFocusSessionReward(initialState, makeSession("session-0"));
    expect(grantFocusSessionReward(first.state, makeSession("session-0")).granted).toBe(false);
    expect(first.state.gold).toBe(2);

    const sessions = Array.from({ length: 501 }, (_, index) => makeSession(`session-${index}`));
    const result = sessions.reduce(
      (state, session) => grantFocusSessionReward(state, session).state,
      initialState,
    );
    expect(result.focusSessions).toHaveLength(500);
    expect(result.focusSessions[0].id).toBe("session-1");
    expect(result.focusSessions.at(-1)?.id).toBe("session-500");
  });

  it("advances the appropriate skill branch with XP rewards", () => {
    const quest = { ...makeQuest("ONCE"), attribute: "strength" as const };
    const questResult = grantQuestReward(initialState, quest, new Date(2026, 3, 10, 12));
    const focusResult = grantFocusSessionReward(questResult.state, {
      id: "session-mind",
      task: "Study",
      durationMinutes: 25,
      xp: 50,
      completedAt: "2026-04-10T12:00:00.000Z",
    });
    expect(questResult.state.skillXP.BODY).toBe(110);
    expect(focusResult.state.skillXP.MIND).toBe(50);
  });

  it("uses skill ranks, class, and equipment to increase matching quest rewards", () => {
    const skillResult = unlockSkill(
      { ...initialState, skillPoints: 2 },
      "WARRIOR_FOUNDATION",
    );
    expect(skillResult.success).toBe(true);
    expect(skillResult.state.skillPoints).toBe(1);

    const equipped = {
      ...skillResult.state,
      inventory: [{ itemId: "training-blade", quantity: 1 }],
      equipment: { WEAPON: "training-blade" },
    };
    const reward = grantQuestReward(
      equipped,
      { ...makeQuest("ONCE"), attribute: "strength" },
      new Date(2026, 3, 10, 12),
    );
    expect(reward.earnedXP).toBe(120);
    expect(reward.state.xp).toBe(120);
    expect(reward.state.branchXP.WARRIOR).toBe(120);
  });

  it("rejects skill upgrades without requirements or points", () => {
    const locked = unlockSkill(initialState, "WARRIOR_FOUNDATION");
    expect(locked.success).toBe(false);
    expect(locked.reason).toContain("SKILL POINT");

    const missingPrerequisite = unlockSkill(
      {
        ...initialState,
        xp: 9000,
        skillPoints: 3,
        branchXP: { ...initialState.branchXP, WARRIOR: 1000 },
      },
      "WARRIOR_MASTERY",
    );
    expect(missingPrerequisite.success).toBe(false);
    expect(missingPrerequisite.reason).toContain("IRON RHYTHM");
  });

  it("consumes a tonic once and applies its XP and focus effect", () => {
    const state = {
      ...initialState,
      inventory: [{ itemId: "clarity-tonic", quantity: 1 }],
    };
    const used = grantItemUse(state, "clarity-tonic", "use:tonic-1");
    const duplicate = grantItemUse(used.state, "clarity-tonic", "use:tonic-1");
    expect(used.granted).toBe(true);
    expect(used.state.xp).toBe(100);
    expect(used.state.attributes.focus).toBe(2);
    expect(used.state.inventory).toEqual([]);
    expect(used.state.activityDates).toEqual([]);
    expect(duplicate.granted).toBe(false);
    expect(duplicate.state.xp).toBe(100);
  });

  it("progresses vitality and creativity when quests target those stats", () => {
    const vitalityQuest = {
      ...makeQuest("ONCE"),
      id: "vitality-quest",
      attribute: "vitality" as const,
    };
    const creativityQuest = {
      ...makeQuest("ONCE"),
      id: "creativity-quest",
      attribute: "creativity" as const,
    };
    const vitalityResult = grantQuestReward(initialState, vitalityQuest);
    const creativityResult = grantQuestReward(vitalityResult.state, creativityQuest);

    expect(creativityResult.state.attributes.vitality).toBe(2);
    expect(creativityResult.state.attributes.creativity).toBe(2);
    expect(creativityResult.state.skillXP.BODY).toBe(110);
    expect(creativityResult.state.skillXP.MIND).toBe(100);
  });

  it("grants recovery charges for seven distinct active days and restores one missed day", () => {
    const activityLog = Array.from({ length: 7 }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return {
        id: `quest-${day}`,
        kind: "QUEST" as const,
        occurredAt: `2026-02-${day}T12:00:00.000Z`,
        activityDate: `2026-02-${day}`,
        xp: 50,
      };
    });
    const date = new Date(2026, 1, 9, 12);
    const activityDates = activityLog.map((event) => event.activityDate);
    const recovery = getRecoveryStatus(activityDates, [], date);

    expect(recovery.credits).toBe(1);
    expect(recovery.canRecoverYesterday).toBe(true);
    expect(getStreakProgress(activityDates, [recovery.yesterday], date).current).toBe(8);
    expect(getRecoveryStatus(activityDates, [recovery.yesterday], date).credits).toBe(0);
  });

  it("tracks boss objectives and pays the reward only on the final objective", () => {
    const boss = {
      ...makeQuest("ONCE"),
      kind: "BOSS" as const,
      goalCount: 3,
      currentCount: 0,
    };
    const first = advanceBossQuest(initialState, boss);
    const second = advanceBossQuest(first.state, { ...boss, currentCount: first.currentCount });
    const third = advanceBossQuest(second.state, { ...boss, currentCount: second.currentCount });
    const duplicate = advanceBossQuest(third.state, {
      ...boss,
      currentCount: third.currentCount,
    });

    expect(first.granted).toBe(false);
    expect(first.currentCount).toBe(1);
    expect(second.granted).toBe(false);
    expect(third.granted).toBe(true);
    expect(third.completed).toBe(true);
    expect(third.state.xp).toBe(100);
    expect(third.state.questCompletions).toBe(1);
    expect(duplicate.granted).toBe(false);
    expect(duplicate.state.xp).toBe(100);
  });

  it("counts consecutive active weeks while the current week is still in progress", () => {
    const activeDates = ["2026-03-16", "2026-03-31", "2026-04-06"];
    expect(
      getWeeklyStreakProgress(activeDates, [], new Date(2026, 3, 8, 12)),
    ).toEqual({ current: 2, longest: 2 });
  });
});
