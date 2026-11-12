import { describe, expect, it } from "vitest";
import {
  calculateMissionRewards,
  evaluateDeadline,
  getMissionPeriodKey,
  getMissionProgress,
  MISSION_CATEGORIES,
  MISSION_DIFFICULTIES,
} from "./missions.js";
import { gameReducer } from "./reducer.js";
import { actions } from "./state.js";
import { INITIAL_STATE } from "./constants.js";

describe("Mission System & Custom Contract Console (Phase 3)", () => {
  it("defines all 6 mission categories with visual badges and themes", () => {
    const expected = ["MAIN", "DAILY", "WEEKLY", "SIDE", "CUSTOM", "DUNGEON"];
    expected.forEach((catKey) => {
      expect(MISSION_CATEGORIES[catKey]).toBeDefined();
      expect(MISSION_CATEGORIES[catKey].name).toBeDefined();
      expect(MISSION_CATEGORIES[catKey].color).toBeDefined();
    });
  });

  it("calculates deterministic XP and Aether Coin rewards based on difficulty and category", () => {
    const eDaily = calculateMissionRewards("E", "DAILY", 0);
    expect(eDaily.xp).toBe(60);
    expect(eDaily.aetherCoins).toBe(15);

    const sDungeon = calculateMissionRewards("S", "DUNGEON", 0);
    // Base 1000 * 2.5 dungeon multiplier = 2500
    expect(sDungeon.xp).toBe(2500);
    expect(sDungeon.aetherCoins).toBe(625);

    // Subtask scaling (+10% per subtask up to 50%)
    const dMainWithSubtasks = calculateMissionRewards("D", "MAIN", 3);
    // Base 120 * 2.0 (main) * 1.3 (3 subtasks) = 312
    expect(dMainWithSubtasks.xp).toBe(312);
  });

  it("calculates accurate subtask progress percentage", () => {
    const mission = {
      subtasks: [
        { id: "1", text: "Phase 1", completed: true },
        { id: "2", text: "Phase 2", completed: false },
        { id: "3", text: "Phase 3", completed: false },
        { id: "4", text: "Phase 4", completed: false },
      ],
    };
    expect(getMissionProgress(mission)).toBe(25);

    mission.subtasks[1].completed = true;
    expect(getMissionProgress(mission)).toBe(50);

    mission.completed = true;
    expect(getMissionProgress(mission)).toBe(100);
  });

  it("generates recurrence period keys for duplicate completion prevention", () => {
    const testDate = new Date(2026, 10, 9); // Nov 9, 2026
    const dailyKey = getMissionPeriodKey("m_daily", "DAILY", testDate);
    expect(dailyKey).toBe("m_daily_DAILY_2026-11-09");

    const weeklyKey = getMissionPeriodKey("m_weekly", "WEEKLY", testDate);
    expect(weeklyKey).toContain("m_weekly_WEEKLY_2026-W");

    const onceKey = getMissionPeriodKey("m_once", "CUSTOM", testDate);
    expect(onceKey).toBe("m_once_ONCE");
  });

  it("evaluates deadlines accurately without punishing players", () => {
    expect(evaluateDeadline(null)).toBeNull();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const deadlineStr = futureDate.toISOString().slice(0, 10);

    const evalRes = evaluateDeadline(deadlineStr);
    expect(evalRes.isOverdue).toBe(false);
    expect(evalRes.text).toContain("DUE IN 5 DAYS");

    // Past deadline
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const overdueRes = evaluateDeadline(pastDate.toISOString().slice(0, 10));
    expect(overdueRes.isOverdue).toBe(true);
    expect(overdueRes.text).toContain("OVERDUE");
  });

  it("handles full mission CRUD: create, update, delete, accept, abandon", () => {
    let state = { ...INITIAL_STATE, missions: [] };

    // 1. Create Mission
    state = gameReducer(
      state,
      actions.createMission({
        title: "NEW HUNTER CONTRACT",
        description: "Clear trial sector",
        category: "CUSTOM",
        difficulty: "C",
        xp: 240,
        aetherCoins: 50,
        subtasks: [{ id: "st1", text: "Step 1", completed: false }],
      })
    );
    expect(state.missions.length).toBe(1);
    const createdId = state.missions[0].id;
    expect(state.missions[0].title).toBe("NEW HUNTER CONTRACT");
    expect(state.missions[0].status).toBe("AVAILABLE");

    // 2. Accept Mission
    state = gameReducer(state, actions.acceptMission(createdId));
    expect(state.missions[0].status).toBe("ACTIVE");

    // 3. Abandon / Pause Mission
    state = gameReducer(state, actions.abandonMission(createdId));
    expect(state.missions[0].status).toBe("AVAILABLE");

    // 4. Update Mission
    state = gameReducer(
      state,
      actions.updateMission(createdId, {
        title: "UPDATED HUNTER CONTRACT",
        difficulty: "B",
      })
    );
    expect(state.missions[0].title).toBe("UPDATED HUNTER CONTRACT");
    expect(state.missions[0].difficulty).toBe("B");

    // 5. Toggle Subtask
    state = gameReducer(state, actions.toggleSubtask(createdId, "st1"));
    expect(state.missions[0].subtasks[0].completed).toBe(true);
    expect(state.missions[0].progress).toBe(100);

    // 6. Delete Mission
    state = gameReducer(state, actions.deleteMission(createdId));
    expect(state.missions.length).toBe(0);
  });

  it("awards rewards on completion and prevents duplicate reward collection", () => {
    const testDate = new Date(2026, 10, 9);
    const testMission = {
      id: "m_test_rewards",
      title: "UNIQUE CONTRACT",
      category: "DAILY",
      difficulty: "D",
      xp: 120,
      aetherCoins: 25,
      attribute: "vitality",
      completed: false,
    };

    let state = {
      ...INITIAL_STATE,
      xp: 0,
      level: 1,
      aetherCoins: 50,
      completedQuestPeriods: [],
      missions: [testMission],
      attributes: { ...INITIAL_STATE.attributes, vitality: 1 },
      streaks: { activityDates: [] },
      activityLog: [],
    };

    // First completion
    state = gameReducer(state, actions.completeMission("m_test_rewards", testDate));
    expect(state.xp).toBe(120);
    expect(state.aetherCoins).toBe(75); // 50 + 25
    expect(state.attributes.vitality).toBe(2);
    expect(state.missions[0].completed).toBe(true);
    expect(state.completedQuestPeriods.length).toBe(1);

    // Second completion attempt in the same period -> DUPLICATE PREVENTED
    const duplicateState = gameReducer(state, actions.completeMission("m_test_rewards", testDate));
    expect(duplicateState.xp).toBe(120); // XP unchanged!
    expect(duplicateState.aetherCoins).toBe(75); // Coins unchanged!
    expect(duplicateState.attributes.vitality).toBe(2); // Attribute unchanged!
    expect(duplicateState).toBe(state); // Unchanged state reference
  });
});

