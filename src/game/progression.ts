import {
  addLocalDays,
  getLocalDateKey,
  getLocalWeekKey,
  getQuestPeriodKey,
} from "./gameData";
import type {
  ActivityEvent,
  Attributes,
  FocusSession,
  Quest,
  SkillBranch,
  SkillXP,
} from "../types/game";

export type ProgressionState = {
  xp: number;
  attributes: Attributes;
  questCompletions: number;
  rewardedQuestPeriods: string[];
  focusSessions: FocusSession[];
  activityLog: ActivityEvent[];
  activityDates: string[];
  skillXP: SkillXP;
  recoveryDays: string[];
}

export type ProgressionResult = {
  state: ProgressionState;
  granted: boolean;
  leveledUp: boolean;
};

function getLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}

export function getSkillBranch(attribute: Quest["attribute"]): SkillBranch {
  if (attribute === "strength") return "BODY";
  if (attribute === "intelligence" || attribute === "focus") return "MIND";
  return "WILL";
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

  const xp = current.xp + quest.xp;
  const nextState = addActivity(
    current,
    createActivityEvent("QUEST", quest.xp, date, `quest:${rewardKey}`, quest.id),
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
      skillXP: {
        ...current.skillXP,
        [getSkillBranch(quest.attribute)]:
          current.skillXP[getSkillBranch(quest.attribute)] + quest.xp,
      },
    },
    granted: true,
    leveledUp: getLevel(xp) > getLevel(current.xp),
  };
}

export function grantFocusSessionReward(
  current: ProgressionState,
  session: FocusSession,
): ProgressionResult {
  if (current.focusSessions.some((saved) => saved.id === session.id)) {
    return { state: current, granted: false, leveledUp: false };
  }

  const xp = current.xp + session.xp;
  const nextState = addActivity(
    current,
    createActivityEvent(
      "FOCUS",
      session.xp,
      new Date(session.completedAt),
      `focus:${session.id}`,
    ),
  );
  return {
    state: {
      ...nextState,
      xp,
      focusSessions: [...current.focusSessions, session].slice(-500),
      skillXP: {
        ...current.skillXP,
        MIND: current.skillXP.MIND + session.xp,
      },
    },
    granted: true,
    leveledUp: getLevel(xp) > getLevel(current.xp),
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
