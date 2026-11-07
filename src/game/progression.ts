import {
  addLocalDays,
  getLocalDateKey,
  getLocalWeekKey,
  getQuestPeriodKey,
} from "./gameData";
import type {
  ActivityEvent,
  Attributes,
  CharacterProfile,
  ClassXP,
  FocusSession,
  GameTransaction,
  ProgressionClass,
  Quest,
  SkillBranch,
  SkillLevels,
  SkillXP,
} from "../types/game";
import { getProgressionClass } from "./character";
import { consumeItem, getEquippedEffects } from "./inventory";
import { getSkillXPBonus } from "./skills";

export type ProgressionState = {
  profile: CharacterProfile;
  xp: number;
  attributes: Attributes;
  questCompletions: number;
  rewardedQuestPeriods: string[];
  focusSessions: FocusSession[];
  activityLog: ActivityEvent[];
  activityDates: string[];
  skillXP: SkillXP;
  skillPoints: number;
  skillLevels: SkillLevels;
  branchXP: Record<ProgressionClass, number>;
  classXP: ClassXP;
  gold: number;
  inventory: { itemId: string; quantity: number }[];
  equipment: Partial<Record<"WEAPON" | "ARMOUR" | "ACCESSORY", string>>;
  transactions: GameTransaction[];
  recoveryDays: string[];
}

export type ProgressionResult = {
  state: ProgressionState;
  granted: boolean;
  leveledUp: boolean;
  earnedXP?: number;
};

function getLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

export function getSkillBranch(attribute: Quest["attribute"]): SkillBranch {
  if (attribute === "strength" || attribute === "vitality") return "BODY";
  if (attribute === "intelligence" || attribute === "focus" || attribute === "creativity") return "MIND";
  return "WILL";
}

export function getProgressionBranch(
  attribute: Quest["attribute"],
  questType?: string,
): ProgressionClass {
  const type = questType?.toUpperCase();
  if (type === "FITNESS") return "WARRIOR";
  if (type === "STUDY") return "SCHOLAR";
  if (["CODING", "TECH", "CYBERSECURITY"].includes(type ?? "")) return "SHADOW_HUNTER";
  if (type === "PROJECT") return "ARCHITECT";
  if (attribute === "strength" || attribute === "vitality") return "WARRIOR";
  if (attribute === "intelligence") return "SCHOLAR";
  if (attribute === "creativity") return "ARCHITECT";
  return "PHANTOM";
}

function getQuestRewardXP(current: ProgressionState, quest: Quest) {
  const branch = getProgressionBranch(quest.attribute, quest.type);
  const activeClass = getProgressionClass(current.profile.hunterClass);
  const classBonus = branch === activeClass ? 0.1 : 0;
  const skillBonus = branch === activeClass
    ? getSkillXPBonus(current.skillLevels, {
      branch,
      attribute: quest.attribute,
      questType: quest.type,
    })
    : 0;
  const equipmentBonus = getEquippedEffects(current.equipment, {
    attribute: quest.attribute,
  }).xpBonus;
  return Math.floor(quest.xp * (1 + classBonus + skillBonus + equipmentBonus));
}

function getFocusRewardXP(current: ProgressionState, session: FocusSession) {
  const activeClass = getProgressionClass(current.profile.hunterClass);
  const classBonus = activeClass === "PHANTOM" ? 0.1 : 0;
  const skillBonus = activeClass === "PHANTOM"
    ? getSkillXPBonus(current.skillLevels, {
      branch: "PHANTOM",
      attribute: "focus",
      focusSession: true,
    })
    : 0;
  const equipmentBonus = getEquippedEffects(current.equipment, {
    focusSession: true,
  }).xpBonus;
  return Math.floor(session.xp * (1 + classBonus + skillBonus + equipmentBonus));
}

function getSkillPointsForLevelGain(currentXP: number, nextXP: number) {
  return getLevel(nextXP) - getLevel(currentXP);
}

function addBranchXP(
  values: Record<ProgressionClass, number>,
  branch: ProgressionClass,
  xp: number,
): Record<ProgressionClass, number> {
  return { ...values, [branch]: values[branch] + xp };
}

function createActivityEvent(
  kind: ActivityEvent["kind"],
  xp: number,
  occurredAt: Date,
  id: string,
  questId?: string,
): ActivityEvent {
  return {
    id,
    kind,
    xp,
    occurredAt: occurredAt.toISOString(),
    activityDate: [
      occurredAt.getFullYear(),
      String(occurredAt.getMonth() + 1).padStart(2, "0"),
      String(occurredAt.getDate()).padStart(2, "0"),
    ].join("-"),
    ...(questId ? { questId } : {}),
  };
}

function addActivity(current: ProgressionState, event: ActivityEvent): ProgressionState {
  const activityDates = current.activityDates.includes(event.activityDate)
    ? current.activityDates
    : [...current.activityDates, event.activityDate].sort();
  return {
    ...current,
    activityLog: [...current.activityLog, event].slice(-2000),
    activityDates,
  };
}

export function recordBossProgress(
  current: ProgressionState,
  quest: Quest,
  occurredAt = new Date(),
): ProgressionState {
  const event = createActivityEvent(
    "BOSS_PROGRESS",
    0,
    occurredAt,
    `boss-progress:${quest.id}:${crypto.randomUUID()}`,
    quest.id,
  );
  return addActivity(current, event);
}

export function advanceBossQuest(
  current: ProgressionState,
  quest: Quest,
  date = new Date(),
) {
  const goalCount = Math.max(2, quest.goalCount);
  const currentCount = Math.min(goalCount, quest.currentCount);
  if (currentCount >= goalCount) {
    const reward = grantQuestReward(current, { ...quest, cadence: "ONCE" }, date);
    return { ...reward, currentCount, completed: true };
  }

  const nextCount = currentCount + 1;
  if (nextCount < goalCount) {
    return {
      state: recordBossProgress(current, quest, date),
      granted: false,
      leveledUp: false,
      currentCount: nextCount,
      completed: false,
    };
  }

  const reward = grantQuestReward(
    current,
    { ...quest, cadence: "ONCE", currentCount: nextCount },
    date,
  );
  return { ...reward, currentCount: nextCount, completed: true };
}

export function grantQuestReward(
  current: ProgressionState,
  quest: Quest,
  date = new Date(),
): ProgressionResult {
  const rewardKey = getQuestPeriodKey(quest.id, quest.cadence, date);
  if (current.rewardedQuestPeriods.includes(rewardKey)) {
    return { state: current, granted: false, leveledUp: false };
  }

  const earnedXP = getQuestRewardXP(current, quest);
  const xp = current.xp + earnedXP;
  const branch = getProgressionBranch(quest.attribute, quest.type);
  const nextState = addActivity(
    current,
    createActivityEvent("QUEST", earnedXP, date, `quest:${rewardKey}`, quest.id),
  );
  return {
    state: {
      ...nextState,
      xp,
      attributes: {
        ...current.attributes,
        [quest.attribute]: current.attributes[quest.attribute] + 1,
      },
      questCompletions: current.questCompletions + 1,
      rewardedQuestPeriods: [...current.rewardedQuestPeriods, rewardKey],
      skillPoints: current.skillPoints + getSkillPointsForLevelGain(current.xp, xp),
      gold: current.gold + Math.floor(earnedXP / 20),
      branchXP: addBranchXP(current.branchXP, branch, earnedXP),
      classXP: addBranchXP(current.classXP, branch, earnedXP),
      skillXP: {
        ...current.skillXP,
        [getSkillBranch(quest.attribute)]:
          current.skillXP[getSkillBranch(quest.attribute)] + earnedXP,
      },
    },
    granted: true,
    leveledUp: getLevel(xp) > getLevel(current.xp),
    earnedXP,
  };
}

export function grantFocusSessionReward(
  current: ProgressionState,
  session: FocusSession,
): ProgressionResult {
  if (current.focusSessions.some((saved) => saved.id === session.id)) {
    return { state: current, granted: false, leveledUp: false };
  }

  const earnedXP = getFocusRewardXP(current, session);
  const xp = current.xp + earnedXP;
  const branch = "PHANTOM";
  const nextState = addActivity(
    current,
    createActivityEvent(
      "FOCUS",
      earnedXP,
      new Date(session.completedAt),
      `focus:${session.id}`,
    ),
  );
  return {
    state: {
      ...nextState,
      xp,
      focusSessions: [...current.focusSessions, session].slice(-500),
      skillPoints: current.skillPoints + getSkillPointsForLevelGain(current.xp, xp),
      gold: current.gold + Math.floor(earnedXP / 20),
      branchXP: addBranchXP(current.branchXP, branch, earnedXP),
      classXP: addBranchXP(current.classXP, branch, earnedXP),
      skillXP: {
        ...current.skillXP,
        MIND: current.skillXP.MIND + earnedXP,
      },
    },
    granted: true,
    leveledUp: getLevel(xp) > getLevel(current.xp),
    earnedXP,
  };
}

export function grantItemUse(
  current: ProgressionState,
  itemId: string,
  transactionId: string,
  occurredAt = new Date(),
): ProgressionResult {
  const result = consumeItem(current, itemId, transactionId, occurredAt);
  if (!result.success || result.xp === undefined) {
    return { state: current, granted: false, leveledUp: false };
  }
  const xp = current.xp + result.xp;
  const event = createActivityEvent(
    "SYSTEM_REWARD",
    result.xp,
    occurredAt,
    `item-use:${transactionId}`,
  );
  const state = {
    ...result.state,
    xp,
    attributes: { ...current.attributes, focus: current.attributes.focus + 1 },
    activityLog: [...current.activityLog, event].slice(-2000),
    skillPoints: current.skillPoints + getSkillPointsForLevelGain(current.xp, xp),
  };
  return {
    state,
    granted: true,
    leveledUp: getLevel(xp) > getLevel(current.xp),
    earnedXP: result.xp,
  };
}

export function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  const currentXP = xp % 1000;
  return {
    level,
    currentXP,
    remainingXP: 1000 - currentXP,
    percentage: (currentXP / 1000) * 100,
  };
}

export function getRecoveryCredits(activityDates: string[], recoveryDays: string[]) {
  return Math.max(
    0,
    Math.floor(new Set(activityDates).size / 7) - new Set(recoveryDays).size,
  );
}

export function getRecoveryStatus(
  activityDates: string[],
  recoveryDays: string[],
  today = new Date(),
) {
  const todayKey = getLocalDateKey(today);
  const yesterday = addLocalDays(todayKey, -1);
  const dayBeforeYesterday = addLocalDays(todayKey, -2);
  const occupiedDates = new Set([...activityDates, ...recoveryDays]);
  const lastDateBeforeYesterday = [...occupiedDates]
    .filter((date) => date < yesterday)
    .sort()
    .at(-1);
  const credits = getRecoveryCredits(activityDates, recoveryDays);
  return {
    credits,
    canRecoverYesterday:
      credits > 0
      && !occupiedDates.has(yesterday)
      && lastDateBeforeYesterday === dayBeforeYesterday,
    yesterday,
  };
}

export function getStreakProgress(
  activityDates: string[],
  recoveryDays: string[],
  today = new Date(),
) {
  const todayKey = getLocalDateKey(today);
  const actualDates = new Set(activityDates);
  const streakDates = new Set([...actualDates, ...recoveryDays]);
  let cursor = todayKey;
  if (!streakDates.has(cursor)) {
    const [year, month, day] = cursor.split("-").map(Number);
    const previousDay = new Date(year, month - 1, day, 12);
    previousDay.setDate(previousDay.getDate() - 1);
    cursor = [
      previousDay.getFullYear(),
      String(previousDay.getMonth() + 1).padStart(2, "0"),
      String(previousDay.getDate()).padStart(2, "0"),
    ].join("-");
  }

  let current = 0;
  while (streakDates.has(cursor)) {
    current += 1;
    const [year, month, day] = cursor.split("-").map(Number);
    const previousDay = new Date(year, month - 1, day, 12);
    previousDay.setDate(previousDay.getDate() - 1);
    cursor = [
      previousDay.getFullYear(),
      String(previousDay.getMonth() + 1).padStart(2, "0"),
      String(previousDay.getDate()).padStart(2, "0"),
    ].join("-");
  }

  const orderedDates = [...streakDates].sort();
  let longest = 0;
  let run = 0;
  let prior: Date | null = null;
  for (const dateKey of orderedDates) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);
    if (prior) {
      const gap = Math.round((date.getTime() - prior.getTime()) / 86_400_000);
      run = gap === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prior = date;
  }
  return { current, longest };
}

export function getWeeklyStreakProgress(
  activityDates: string[],
  recoveryDays: string[],
  today = new Date(),
) {
  const activeWeeks = new Set(
    [...new Set([...activityDates, ...recoveryDays])]
      .map((dateKey) => getLocalWeekKey(new Date(`${dateKey}T12:00:00`))),
  );
  const currentWeek = getLocalWeekKey(today);
  let cursor = activeWeeks.has(currentWeek)
    ? currentWeek
    : addLocalDays(currentWeek, -7);
  let current = 0;
  while (activeWeeks.has(cursor)) {
    current += 1;
    cursor = addLocalDays(cursor, -7);
  }

  const orderedWeeks = [...activeWeeks].sort();
  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const week of orderedWeeks) {
    run = previous && addLocalDays(previous, 7) === week ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = week;
  }
  return { current, longest };
}
