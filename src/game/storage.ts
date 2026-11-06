import { combineQuests, dailyQuests, defaultAttributes, getLocalDateKey, getQuestPeriodKey } from "./gameData";
import type {
  ActivityEvent,
  Attributes,
  CustomQuest,
  FocusSession,
  QuestCadence,
  SkillXP,
} from "../types/game";
import type { ProgressionState } from "./progression";

export type GameSave = ProgressionState & {
  version: 2;
  customQuests: CustomQuest[];
  customCategories: string[];
};

type VersionOneGameSave = {
  version: 1;
  xp: number;
  attributes: Attributes;
  customQuests: CustomQuest[];
  rewardedQuestPeriods: string[];
  questCompletions: number;
  focusSessions: FocusSession[];
};

type LoadedGameSave = {
  save: GameSave;
  warning: string | null;
};

const SAVE_KEY = "awaken-save";
const attributeNames = Object.keys(defaultAttributes) as (keyof Attributes)[];
const cadences = new Set<QuestCadence>(["DAILY", "WEEKLY", "ONCE"]);
const skillBranches: (keyof SkillXP)[] = ["BODY", "MIND", "WILL"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isAttributes(value: unknown): value is Attributes {
  return isRecord(value) && attributeNames.every((name) => isNonNegativeInteger(value[name]));
}

function isSkillXP(value: unknown): value is SkillXP {
  return isRecord(value)
    && skillBranches.every((branch) => isNonNegativeInteger(value[branch]));
}

function isActivityEvent(value: unknown): value is ActivityEvent {
  return isRecord(value)
    && typeof value.id === "string"
    && ["QUEST", "FOCUS", "BOSS_PROGRESS"].includes(String(value.kind))
    && typeof value.occurredAt === "string"
    && Number.isFinite(Date.parse(value.occurredAt))
    && typeof value.activityDate === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(value.activityDate)
    && isNonNegativeInteger(value.xp)
    && (value.questId === undefined || typeof value.questId === "string");
}

function isCustomQuest(value: unknown): value is CustomQuest {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.title === "string"
    && typeof value.description === "string"
    && isNonNegativeInteger(value.xp)
    && typeof value.type === "string"
    && (value.attribute === undefined || attributeNames.includes(value.attribute as keyof Attributes))
    && (value.cadence === undefined || cadences.has(value.cadence as QuestCadence))
    && (value.priority === undefined || ["LOW", "NORMAL", "HIGH"].includes(String(value.priority)))
    && (value.kind === undefined || value.kind === "STANDARD" || value.kind === "BOSS")
    && (value.goalCount === undefined || (
      isNonNegativeInteger(value.goalCount)
      && value.goalCount >= (value.kind === "BOSS" ? 2 : 1)
    ))
    && (value.currentCount === undefined || (
      isNonNegativeInteger(value.currentCount)
      && value.currentCount <= (isNonNegativeInteger(value.goalCount) ? value.goalCount : 1)
    ))
    && (value.kind !== "BOSS" || (
      isNonNegativeInteger(value.goalCount)
      && value.goalCount >= 2
      && isNonNegativeInteger(value.currentCount)
      && value.currentCount <= value.goalCount
    ));
}

function isFocusSession(value: unknown): value is FocusSession {
  return isRecord(value)
    && typeof value.id === "string"
    && typeof value.task === "string"
    && isNonNegativeInteger(value.durationMinutes)
    && isNonNegativeInteger(value.xp)
    && typeof value.completedAt === "string"
    && Number.isFinite(Date.parse(value.completedAt));
}

function getFocusActivity(session: FocusSession): ActivityEvent {
  const completedAt = new Date(session.completedAt);
  return {
    id: `focus:${session.id}`,
    kind: "FOCUS",
    occurredAt: session.completedAt,
    activityDate: getLocalDateKey(completedAt),
    xp: session.xp,
  };
}

function getLegacyQuestActivities(rewardedQuestPeriods: string[]): ActivityEvent[] {
  return rewardedQuestPeriods.flatMap((rewardKey) => {
    let decoded: unknown;
    try {
      decoded = JSON.parse(rewardKey) as unknown;
    } catch {
      return [];
    }
    if (
      !Array.isArray(decoded)
      || decoded.length !== 3
      || typeof decoded[0] !== "string"
      || decoded[1] !== "DAILY"
      || typeof decoded[2] !== "string"
      || !/^\d{4}-\d{2}-\d{2}$/.test(decoded[2])
    ) {
      return [];
    }
    return [{
      id: `quest:${rewardKey}`,
      kind: "QUEST",
      occurredAt: decoded[2],
      activityDate: decoded[2],
      xp: 0,
      questId: decoded[0],
    }];
  });
}

function getSkillXPFromActivities(
  activities: ActivityEvent[],
  customQuests: CustomQuest[],
): SkillXP {
  const branches: SkillXP = { BODY: 0, MIND: 0, WILL: 0 };
  const attributesByQuest = new Map(
    combineQuests(customQuests).map((quest) => [quest.id, quest.attribute]),
  );
  for (const activity of activities) {
    if (activity.kind === "FOCUS") {
      branches.MIND += activity.xp;
      continue;
    }
    const attribute = attributesByQuest.get(activity.questId ?? "");
    const branch = attribute === "strength"
      ? "BODY"
      : attribute === "intelligence" || attribute === "focus"
        ? "MIND"
        : "WILL";
    branches[branch] += activity.xp;
  }
  return branches;
}

function isLegacyGameSave(value: unknown): value is VersionOneGameSave {
  return isRecord(value)
    && value.version === 1
    && isNonNegativeInteger(value.xp)
    && isAttributes(value.attributes)
    && Array.isArray(value.customQuests)
    && value.customQuests.every(isCustomQuest)
    && Array.isArray(value.rewardedQuestPeriods)
    && value.rewardedQuestPeriods.every((item) => typeof item === "string")
    && isNonNegativeInteger(value.questCompletions)
    && Array.isArray(value.focusSessions)
    && value.focusSessions.every(isFocusSession);
}

function isGameSave(value: unknown): value is GameSave {
  return isRecord(value)
    && value.version === 2
    && isNonNegativeInteger(value.xp)
    && isAttributes(value.attributes)
    && Array.isArray(value.customQuests)
    && value.customQuests.every(isCustomQuest)
    && Array.isArray(value.rewardedQuestPeriods)
    && value.rewardedQuestPeriods.every((item) => typeof item === "string")
    && isNonNegativeInteger(value.questCompletions)
    && Array.isArray(value.focusSessions)
    && value.focusSessions.every(isFocusSession)
    && Array.isArray(value.activityLog)
    && value.activityLog.every(isActivityEvent)
    && Array.isArray(value.activityDates)
    && value.activityDates.every((item) => typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item))
    && isSkillXP(value.skillXP)
    && Array.isArray(value.recoveryDays)
    && value.recoveryDays.every((item) => typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item))
    && Array.isArray(value.customCategories)
    && value.customCategories.every((item) => typeof item === "string" && item.trim().length > 0);
}

function defaultSave(): GameSave {
  return {
    version: 2,
    xp: 0,
    attributes: { ...defaultAttributes },
    customQuests: [],
    rewardedQuestPeriods: [],
    questCompletions: 0,
    focusSessions: [],
    activityLog: [],
    activityDates: [],
    skillXP: { BODY: 0, MIND: 0, WILL: 0 },
    recoveryDays: [],
    customCategories: [],
  };
}

export function loadGameSave(): LoadedGameSave {
  const warnings: string[] = [];
  const read = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Unable to read saved game data (${key}).`, error);
      warnings.push("Saved data could not be read from this browser.");
      return null;
    }
  };
  const parse = (key: string, value: string | null): unknown => {
    if (value === null) return undefined;
    try {
      return JSON.parse(value) as unknown;
    } catch (error) {
      console.error(`Saved game data is invalid (${key}).`, error);
      warnings.push("Some saved data is invalid; recoverable progress was loaded where possible.");
      return undefined;
    }
  };

  const currentRaw = read(SAVE_KEY);
  if (currentRaw !== null) {
    const current = parse(SAVE_KEY, currentRaw);
    if (isGameSave(current)) return { save: current, warning: null };
    if (isLegacyGameSave(current)) {
      const focusSessions = current.focusSessions.filter(
        (session) => Number.isFinite(Date.parse(session.completedAt)),
      );
      const allActivities = [
        ...getLegacyQuestActivities(current.rewardedQuestPeriods),
        ...focusSessions.map(getFocusActivity),
      ];
      return {
        save: {
          ...current,
          version: 2,
          activityLog: allActivities.slice(-2000),
          activityDates: [...new Set(allActivities.map((activity) => activity.activityDate))].sort(),
          skillXP: getSkillXPFromActivities(allActivities.slice(-2000), current.customQuests),
          recoveryDays: [],
          customCategories: [],
        },
        warning: null,
      };
    }
    if (current !== undefined) {
      console.error("Saved game data has an unsupported or invalid version.", current);
      warnings.push("The saved game version is unsupported; attempting legacy recovery.");
    }
  }

  const save = defaultSave();
  const legacyCustom = parse("awaken-custom-quests", read("awaken-custom-quests"));
  if (Array.isArray(legacyCustom) && legacyCustom.every(isCustomQuest)) {
    save.customQuests = legacyCustom;
  } else if (legacyCustom !== undefined) {
    console.error("Legacy custom quest data has an invalid shape.", legacyCustom);
    warnings.push("Invalid custom quests were skipped during recovery.");
  }

  const legacyXPRaw = read("awaken-xp");
  const legacyXP = Number(legacyXPRaw);
  if (legacyXPRaw === null) {
    save.xp = 0;
  } else if (Number.isSafeInteger(legacyXP) && legacyXP >= 0) {
    save.xp = legacyXP;
  } else {
    warnings.push("Invalid XP data was skipped during recovery.");
  }

  const legacyAttributes = parse("awaken-attributes", read("awaken-attributes"));
  if (isAttributes(legacyAttributes)) save.attributes = legacyAttributes;
  else if (legacyAttributes !== undefined) {
    console.error("Legacy attribute data has an invalid shape.", legacyAttributes);
    warnings.push("Invalid attributes were replaced with safe defaults.");
  }

  const savedPeriods = parse(
    "awaken-rewarded-quest-periods",
    read("awaken-rewarded-quest-periods"),
  );
  const oldIdsValue = savedPeriods === undefined
    ? parse("awaken-completed-quests", read("awaken-completed-quests"))
    : undefined;
  if (Array.isArray(savedPeriods) && savedPeriods.every((item) => typeof item === "string")) {
    save.rewardedQuestPeriods = savedPeriods;
  } else if (savedPeriods !== undefined) {
    console.error("Quest reward ledger has an invalid shape.", savedPeriods);
    warnings.push("Invalid quest reward records were skipped.");
  } else {
    const oldDate = read("awaken-completion-date");
    if (Array.isArray(oldIdsValue) && oldIdsValue.every((item) => typeof item === "string")) {
      const currentDate = getLocalDateKey();
      const quests = [...dailyQuests, ...combineQuests(save.customQuests).slice(dailyQuests.length)];
      save.rewardedQuestPeriods = oldIdsValue.flatMap((id) => {
        const quest = quests.find((candidate) => candidate.id === id);
        if (!quest || (quest.cadence === "DAILY" && oldDate !== currentDate)) return [];
        return [getQuestPeriodKey(quest.id, quest.cadence)];
      });
    } else if (oldIdsValue !== undefined) {
      console.error("Legacy quest completion data has an invalid shape.", oldIdsValue);
      warnings.push("Invalid quest completion records were skipped.");
    }
  }

  const legacyCount = Number(read("awaken-quest-completions"));
  const recoveredCount = Array.isArray(oldIdsValue) ? oldIdsValue.length : 0;
  if (Number.isSafeInteger(legacyCount) && legacyCount >= 0) {
    save.questCompletions = Math.max(legacyCount, recoveredCount);
  } else {
    save.questCompletions = recoveredCount;
  }

  const focusSessions = parse("awaken-focus-sessions", read("awaken-focus-sessions"));
  if (Array.isArray(focusSessions) && focusSessions.every(isFocusSession)) {
    save.focusSessions = focusSessions;
  } else if (focusSessions !== undefined) {
    console.error("Focus session history has an invalid shape.", focusSessions);
    warnings.push("Invalid focus session history was skipped.");
  }

  const allActivities = [
    ...getLegacyQuestActivities(save.rewardedQuestPeriods),
    ...save.focusSessions.map(getFocusActivity),
  ];
  save.activityLog = allActivities.slice(-2000);
  save.activityDates = [...new Set(allActivities.map((activity) => activity.activityDate))].sort();
  save.skillXP = getSkillXPFromActivities(allActivities.slice(-2000), save.customQuests);

  return { save, warning: warnings.length ? [...new Set(warnings)].join(" ") : null };
}

export function saveGame(save: GameSave): string | null {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return null;
  } catch (error) {
    console.error("Unable to save game progress.", error);
    return "Progress could not be saved in this browser. Check available storage and privacy settings.";
  }
}
