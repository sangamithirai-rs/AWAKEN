import { describe, expect, it } from "vitest";
import { getLocalWeekKey } from "./gameData";
import {
  getLevelProgress,
  advanceBossQuest,
  grantFocusSessionReward,
  grantQuestReward,
  getRecoveryStatus,
  getStreakProgress,
  getWeeklyStreakProgress,
  type ProgressionState,
} from "./progression";
import type { FocusSession, Quest } from "../types/game";

const initialState: ProgressionState = {
  xp: 0,
  attributes: {
    strength: 1,
    intelligence: 1,
    discipline: 1,
    focus: 1,
    consistency: 1,
  },
  questCompletions: 0,
  rewardedQuestPeriods: [],
  focusSessions: [],
  activityLog: [],
  activityDates: [],
  skillXP: { BODY: 0, MIND: 0, WILL: 0 },
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

    expect(questResult.state.skillXP.BODY).toBe(100);
    expect(focusResult.state.skillXP.MIND).toBe(50);
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
