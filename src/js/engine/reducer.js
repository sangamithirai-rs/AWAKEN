/**
 * AWAKEN Deterministic State Reducer
 * Pure Vanilla JavaScript ES6 Module
 */

import { getRankFromLevel, INITIAL_STATE } from "./constants.js";
import { getMissionPeriodKey, getMissionProgress } from "./missions.js";

export const ACTION_TYPES = {
  SET_ROUTE: "SET_ROUTE",
  LOAD_STATE: "LOAD_STATE",
  RESET_STATE: "RESET_STATE",
  SET_NOTIFICATION: "SET_NOTIFICATION",
  TOGGLE_SOUND: "TOGGLE_SOUND",
  TOGGLE_REDUCED_MOTION: "TOGGLE_REDUCED_MOTION",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  COMPLETE_MISSION: "COMPLETE_MISSION",
  ADVANCE_BOSS_MISSION: "ADVANCE_BOSS_MISSION",
  CREATE_MISSION: "CREATE_MISSION",
  UPDATE_MISSION: "UPDATE_MISSION",
  DELETE_MISSION: "DELETE_MISSION",
  ACCEPT_MISSION: "ACCEPT_MISSION",
  ABANDON_MISSION: "ABANDON_MISSION",
  TOGGLE_SUBTASK: "TOGGLE_SUBTASK",
  EQUIP_ITEM: "EQUIP_ITEM",
  UNEQUIP_ITEM: "UNEQUIP_ITEM",
  USE_CONSUMABLE: "USE_CONSUMABLE",
  UNLOCK_SKILL: "UNLOCK_SKILL",
  ALLOCATE_STAT_POINT: "ALLOCATE_STAT_POINT",
  RECOVER_STREAK: "RECOVER_STREAK",
};

export function gameReducer(state = INITIAL_STATE, action) {
  if (!action || !action.type) return state;

  switch (action.type) {
    case ACTION_TYPES.SET_ROUTE: {
      if (state.route === action.payload) return state;
      return {
        ...state,
        route: action.payload,
      };
    }

    case ACTION_TYPES.LOAD_STATE: {
      return {
        ...state,
        ...action.payload,
      };
    }

    case ACTION_TYPES.RESET_STATE: {
      return {
        ...INITIAL_STATE,
        version: 5,
      };
    }

    case ACTION_TYPES.SET_NOTIFICATION: {
      return {
        ...state,
        notification: action.payload,
      };
    }

    case ACTION_TYPES.TOGGLE_SOUND: {
      const nextSound = action.payload !== undefined ? action.payload : !state.settings.soundEnabled;
      return {
        ...state,
        settings: {
          ...state.settings,
          soundEnabled: nextSound,
        },
      };
    }

    case ACTION_TYPES.TOGGLE_REDUCED_MOTION: {
      const nextMotion = action.payload !== undefined ? action.payload : !state.settings.reducedMotion;
      return {
        ...state,
        settings: {
          ...state.settings,
          reducedMotion: nextMotion,
        },
      };
    }

    case ACTION_TYPES.UPDATE_PROFILE: {
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
      };
    }

    case ACTION_TYPES.CREATE_MISSION: {
      const newMission = {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: action.payload.title || "UNNAMED CONTRACT",
        description: action.payload.description || "",
        category: action.payload.category || "CUSTOM",
        difficulty: action.payload.difficulty || "D",
        attribute: action.payload.attribute || "discipline",
        estimatedDuration: action.payload.estimatedDuration || "30 MIN",
        deadline: action.payload.deadline || null,
        startDate: new Date().toISOString().slice(0, 10),
        subtasks: Array.isArray(action.payload.subtasks) ? action.payload.subtasks : [],
        progress: 0,
        status: action.payload.status || "AVAILABLE",
        xp: Number(action.payload.xp) || 120,
        aetherCoins: Number(action.payload.aetherCoins) || 25,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        deletable: true,
      };
      return {
        ...state,
        missions: [newMission, ...state.missions],
      };
    }

    case ACTION_TYPES.UPDATE_MISSION: {
      const { missionId, updates } = action.payload;
      return {
        ...state,
        missions: state.missions.map((m) => {
          if (m.id !== missionId) return m;
          const updated = { ...m, ...updates };
          updated.progress = getMissionProgress(updated);
          return updated;
        }),
      };
    }

    case ACTION_TYPES.DELETE_MISSION: {
      return {
        ...state,
        missions: state.missions.filter((m) => m.id !== action.payload.missionId),
      };
    }

    case ACTION_TYPES.ACCEPT_MISSION: {
      const { missionId } = action.payload;
      return {
        ...state,
        missions: state.missions.map((m) =>
          m.id === missionId ? { ...m, status: "ACTIVE" } : m
        ),
      };
    }

    case ACTION_TYPES.ABANDON_MISSION: {
      const { missionId } = action.payload;
      return {
        ...state,
        missions: state.missions.map((m) =>
          m.id === missionId ? { ...m, status: "AVAILABLE" } : m
        ),
      };
    }

    case ACTION_TYPES.TOGGLE_SUBTASK: {
      const { missionId, subtaskId } = action.payload;
      return {
        ...state,
        missions: state.missions.map((m) => {
          if (m.id !== missionId) return m;
          const subtasks = (m.subtasks || []).map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const updated = { ...m, subtasks };
          updated.progress = getMissionProgress(updated);
          return updated;
        }),
      };
    }

    case ACTION_TYPES.COMPLETE_MISSION: {
      const { missionId, date = new Date() } = action.payload;
      const mission = state.missions.find((m) => m.id === missionId);
      if (!mission) return state;

      // Period key check for duplicate prevention
      const periodKey = getMissionPeriodKey(mission.id, mission.category, date);
      if (state.completedQuestPeriods.includes(periodKey)) {
        return state; // Duplicate reward prevented
      }

      const earnedXP = mission.xp || 100;
      const earnedGold = mission.aetherCoins || mission.gold || Math.floor(earnedXP / 5);
      const nextXP = state.xp + earnedXP;
      const prevLevel = state.level;
      const nextLevel = Math.floor(nextXP / 1000) + 1;
      const gainedSkillPoints = nextLevel > prevLevel ? nextLevel - prevLevel : 0;

      // Attribute progression
      const attrKey = mission.attribute || "discipline";
      const nextAttributes = {
        ...state.attributes,
        [attrKey]: (state.attributes[attrKey] || 1) + 1,
      };

      const nowISO = new Date().toISOString();
      const todayKey = nowISO.slice(0, 10);

      const nextMissions = state.missions.map((m) => {
        if (m.id === missionId) {
          const subtasks = (m.subtasks || []).map((st) => ({ ...st, completed: true }));
          return {
            ...m,
            completed: true,
            status: "COMPLETED",
            progress: 100,
            subtasks,
            completedAt: nowISO,
            lastCompletedPeriod: periodKey,
          };
        }
        return m;
      });

      const nextActivityDates = state.streaks.activityDates.includes(todayKey)
        ? state.streaks.activityDates
        : [...state.streaks.activityDates, todayKey].sort();

      return {
        ...state,
        xp: nextXP,
        level: nextLevel,
        aetherCoins: state.aetherCoins + earnedGold,
        skillPoints: state.skillPoints + gainedSkillPoints,
        questCompletions: state.questCompletions + 1,
        completedQuestPeriods: [...state.completedQuestPeriods, periodKey],
        attributes: nextAttributes,
        missions: nextMissions,
        streaks: {
          ...state.streaks,
          activityDates: nextActivityDates,
        },
        activityLog: [
          ...state.activityLog,
          {
            id: `act_${Date.now()}`,
            kind: "QUEST",
            missionId,
            xp: earnedXP,
            gold: earnedGold,
            timestamp: nowISO,
          },
        ].slice(-1000),
      };
    }

    case ACTION_TYPES.ADVANCE_BOSS_MISSION: {
      const { missionId } = action.payload;
      const mission = state.missions.find((m) => m.id === missionId);
      if (!mission || mission.kind !== "BOSS") return state;

      const nextCount = (mission.currentCount || 0) + 1;
      const isCleared = nextCount >= (mission.goalCount || 2);

      if (isCleared) {
        return gameReducer(state, {
          type: ACTION_TYPES.COMPLETE_MISSION,
          payload: { missionId },
        });
      }

      return {
        ...state,
        missions: state.missions.map((m) =>
          m.id === missionId ? { ...m, currentCount: nextCount, progress: Math.round((nextCount / m.goalCount) * 100) } : m
        ),
      };
    }

    case ACTION_TYPES.EQUIP_ITEM: {
      const { slot, itemId } = action.payload;
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [slot]: itemId,
        },
        inventory: state.inventory.map((item) => {
          if (item.itemId === itemId) return { ...item, equipped: true };
          if (item.slot === slot && item.equipped) return { ...item, equipped: false };
          return item;
        }),
      };
    }

    case ACTION_TYPES.UNEQUIP_ITEM: {
      const { slot } = action.payload;
      const equippedItemId = state.equipment[slot];
      return {
        ...state,
        equipment: {
          ...state.equipment,
          [slot]: null,
        },
        inventory: state.inventory.map((item) =>
          item.itemId === equippedItemId ? { ...item, equipped: false } : item
        ),
      };
    }

    case ACTION_TYPES.UNLOCK_SKILL: {
      const { nodeId } = action.payload;
      if (state.skillPoints < 1) return state;

      const currentLevel = state.skills.skillLevels[nodeId] || 0;
      return {
        ...state,
        skillPoints: state.skillPoints - 1,
        skills: {
          ...state.skills,
          skillLevels: {
            ...state.skills.skillLevels,
            [nodeId]: currentLevel + 1,
          },
        },
      };
    }

    case ACTION_TYPES.ALLOCATE_STAT_POINT: {
      const { attribute } = action.payload;
      if (state.skillPoints < 1) return state;
      if (!state.attributes || state.attributes[attribute] === undefined) return state;

      return {
        ...state,
        skillPoints: state.skillPoints - 1,
        attributes: {
          ...state.attributes,
          [attribute]: state.attributes[attribute] + 1,
        },
      };
    }

    default:
      return state;
  }
}
