import {
  combineQuests,
  dailyQuests,
  defaultAttributes,
  defaultCharacterProfile,
  getLocalDateKey,
  getQuestPeriodKey,
} from "./gameData";
import { isSpecializationForClass } from "./character";
import type {
  ActivityEvent,
  Attributes,
  CharacterProfile,
  ClassXP,
  CustomQuest,
  Equipment,
  FocusSession,
  GameTransaction,
  OwnedItem,
  QuestCadence,
  SkillLevels,
  SkillXP,
} from "../types/game";
import { getProgressionBranch, type ProgressionState } from "./progression";
import { createEmptyEquipment, getItem } from "./inventory";
import { createEmptySkillLevels, skillNodes } from "./skills";

export type GameSave = ProgressionState & {
  version: 4;
  customQuests: CustomQuest[];
  customCategories: string[];
};

type VersionThreeGameSave = {
  version: 3;
  profile: CharacterProfile;
  xp: number;
  attributes: Attributes;
  customQuests: CustomQuest[];
  rewardedQuestPeriods: string[];
  questCompletions: number;
  focusSessions: FocusSession[];
  activityLog: ActivityEvent[];
  activityDates: string[];
  skillXP: SkillXP;
  recoveryDays: string[];
  customCategories: string[];
};

type LegacyAttributes = Pick<
  Attributes,
  "strength" | "intelligence" | "discipline" | "focus" | "consistency"
>;

type VersionOneGameSave = {
  version: 1;
  xp: number;
  attributes: LegacyAttributes;
  customQuests: CustomQuest[];
  rewardedQuestPeriods: string[];
  questCompletions: number;
  focusSessions: FocusSession[];
};

type VersionTwoGameSave = Omit<VersionThreeGameSave, "version" | "profile" | "attributes"> & {
  version: 2;
  attributes: LegacyAttributes;
};

type LoadedGameSave = {
  save: GameSave;
  warning: string | null;
};

const SAVE_KEY = "awaken-save";
const attributeNames = Object.keys(defaultAttributes) as (keyof Attributes)[];
const legacyAttributeNames: (keyof LegacyAttributes)[] = [
  "strength",
  "intelligence",
  "discipline",
  "focus",
  "consistency",
];
const cadences = new Set<QuestCadence>(["DAILY", "WEEKLY", "ONCE"]);
const skillBranches: (keyof SkillXP)[] = ["BODY", "MIND", "WILL"];
const progressionClasses: (keyof ClassXP)[] = [
  "WARRIOR",
  "SCHOLAR",
  "SHADOW_HUNTER",
  "ARCHITECT",
  "PHANTOM",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isAttributes(value: unknown): value is Attributes {
  return isRecord(value) && attributeNames.every((name) => isNonNegativeInteger(value[name]));
}

function isLegacyAttributes(value: unknown): value is LegacyAttributes {
  return isRecord(value)
    && legacyAttributeNames.every((name) => isNonNegativeInteger(value[name]));
}

function upgradeAttributes(attributes: LegacyAttributes): Attributes {
  return {
    ...defaultAttributes,
    ...attributes,
  };
}

function isCharacterProfile(value: unknown): value is CharacterProfile {
  return isRecord(value)
    && typeof value.name === "string"
    && value.name.trim().length > 0
    && value.name.trim().length <= 24
    && typeof value.hunterClass === "string"
    && typeof value.specialization === "string"
    && isSpecializationForClass(
      value.hunterClass as CharacterProfile["hunterClass"],
      value.specialization as CharacterProfile["specialization"],
    );
}

function isSkillXP(value: unknown): value is SkillXP {
  return isRecord(value)
    && skillBranches.every((branch) => isNonNegativeInteger(value[branch]));
}

function isActivityEvent(value: unknown): value is ActivityEvent {
  return isRecord(value)
    && typeof value.id === "string"
    && ["QUEST", "FOCUS", "BOSS_PROGRESS", "SYSTEM_REWARD"].includes(String(value.kind))
    && typeof value.occurredAt === "string"
    && Number.isFinite(Date.parse(value.occurredAt))
    && typeof value.activityDate === "string"
    && /^\d{4}-\d{2}-\d{2}$/.test(value.activityDate)
    && isNonNegativeInteger(value.xp)
    && (value.questId === undefined || typeof value.questId === "string");
}

function isSkillLevels(value: unknown): value is SkillLevels {
  return isRecord(value)
    && skillNodes.every((node) => {
      const rank = value[node.id];
      return isNonNegativeInteger(rank) && rank <= node.maxLevel;
    });
}

function isClassXP(value: unknown): value is ClassXP {
  return isRecord(value)
    && progressionClasses.every((branch) => isNonNegativeInteger(value[branch]));
}

function isOwnedItem(value: unknown): value is OwnedItem {
  return isRecord(value)
    && typeof value.itemId === "string"
    && getItem(value.itemId) !== undefined
    && isNonNegativeInteger(value.quantity)
    && value.quantity > 0;
}

function isEquipment(value: unknown, inventory: OwnedItem[]): value is Equipment {
  if (!isRecord(value)) return false;
  const slots = ["WEAPON", "ARMOUR", "ACCESSORY"] as const;
  return Object.keys(value).every((key) => slots.includes(key as typeof slots[number]))
    && slots.every((slot) => {
      const itemId = value[slot];
      if (itemId === undefined) return true;
      const item = typeof itemId === "string" ? getItem(itemId) : undefined;
      return item?.slot === slot
        && inventory.some((owned) => owned.itemId === itemId && owned.quantity > 0);
    });
}

function isGameTransaction(value: unknown): value is GameTransaction {
  return isRecord(value)
    && typeof value.id === "string"
    && value.id.length > 0
    && (value.type === "PURCHASE" || value.type === "USE")
    && typeof value.itemId === "string"
    && getItem(value.itemId) !== undefined
    && isNonNegativeInteger(value.quantity)
    && value.quantity > 0
    && isNonNegativeInteger(value.gold)
    && typeof value.occurredAt === "string"
    && Number.isFinite(Date.parse(value.occurredAt));
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
    const branch = attribute === "strength" || attribute === "vitality"
      ? "BODY"
      : attribute === "intelligence" || attribute === "focus" || attribute === "creativity"
        ? "MIND"
        : "WILL";
    branches[branch] += activity.xp;
  }
  return branches;
}

function getProgressionXPFromActivities(
  activities: ActivityEvent[],
  customQuests: CustomQuest[],
): ClassXP {
  const branches: ClassXP = {
    WARRIOR: 0,
    SCHOLAR: 0,
    SHADOW_HUNTER: 0,
    ARCHITECT: 0,
    PHANTOM: 0,
  };
  const questById = new Map(
    combineQuests(customQuests).map((quest) => [quest.id, quest]),
  );
  for (const activity of activities) {
    if (activity.kind === "SYSTEM_REWARD") continue;
    if (activity.kind === "FOCUS") {
      branches.PHANTOM += activity.xp;
      continue;
    }
    const quest = questById.get(activity.questId ?? "");
    if (!quest) continue;
    const branch = getProgressionBranch(quest.attribute, quest.type);
    branches[branch] += activity.xp;
  }
  return branches;
}

function isLegacyGameSave(value: unknown): value is VersionOneGameSave {
  return isRecord(value)
    && value.version === 1
    && isNonNegativeInteger(value.xp)
    && isLegacyAttributes(value.attributes)
    && Array.isArray(value.customQuests)
    && value.customQuests.every(isCustomQuest)
    && Array.isArray(value.rewardedQuestPeriods)
    && value.rewardedQuestPeriods.every((item) => typeof item === "string")
    && isNonNegativeInteger(value.questCompletions)
    && Array.isArray(value.focusSessions)
    && value.focusSessions.every(isFocusSession);
}

function isVersionTwoGameSave(value: unknown): value is VersionTwoGameSave {
  return isRecord(value)
    && value.version === 2
    && isNonNegativeInteger(value.xp)
    && isLegacyAttributes(value.attributes)
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

function isGameSave(value: unknown): value is GameSave {
  return isRecord(value)
    && value.version === 4
    && isNonNegativeInteger(value.xp)
    && isAttributes(value.attributes)
    && isCharacterProfile(value.profile)
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
    && isNonNegativeInteger(value.skillPoints)
    && isSkillLevels(value.skillLevels)
    && isClassXP(value.branchXP)
    && isClassXP(value.classXP)
    && isNonNegativeInteger(value.gold)
    && Array.isArray(value.inventory)
    && value.inventory.every(isOwnedItem)
    && isEquipment(value.equipment, value.inventory)
    && Array.isArray(value.transactions)
    && value.transactions.every(isGameTransaction)
    && Array.isArray(value.recoveryDays)
    && value.recoveryDays.every((item) => typeof item === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item))
    && Array.isArray(value.customCategories)
    && value.customCategories.every((item) => typeof item === "string" && item.trim().length > 0);
}

function isVersionThreeGameSave(value: unknown): value is VersionThreeGameSave {
  return isRecord(value)
    && value.version === 3
    && isNonNegativeInteger(value.xp)
    && isAttributes(value.attributes)
    && isCharacterProfile(value.profile)
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

function upgradeVersionThree(save: VersionThreeGameSave): GameSave {
  const branchXP = getProgressionXPFromActivities(save.activityLog, save.customQuests);
  return {
    ...save,
    version: 4,
    skillPoints: Math.floor(save.xp / 1000),
    skillLevels: createEmptySkillLevels(),
    branchXP,
    classXP: { ...branchXP },
    gold: 0,
    inventory: [],
    equipment: createEmptyEquipment(),
    transactions: [],
  };
}

function defaultSave(): GameSave {
  return {
    version: 4,
    profile: { ...defaultCharacterProfile },
    xp: 0,
    attributes: { ...defaultAttributes },
    customQuests: [],
    rewardedQuestPeriods: [],
    questCompletions: 0,
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
    if (isVersionThreeGameSave(current)) {
      return { save: upgradeVersionThree(current), warning: null };
    }
    if (isVersionTwoGameSave(current)) {
      return {
        save: upgradeVersionThree({
          ...current,
          version: 3,
          profile: { ...defaultCharacterProfile },
          attributes: upgradeAttributes(current.attributes),
        }),
        warning: null,
      };
    }
    if (isLegacyGameSave(current)) {
      const focusSessions = current.focusSessions.filter(
        (session) => Number.isFinite(Date.parse(session.completedAt)),
      );
      const allActivities = [
        ...getLegacyQuestActivities(current.rewardedQuestPeriods),
        ...focusSessions.map(getFocusActivity),
      ];
      return {
        save: upgradeVersionThree({
          ...current,
          version: 3,
          profile: { ...defaultCharacterProfile },
          attributes: upgradeAttributes(current.attributes),
          activityLog: allActivities.slice(-2000),
          activityDates: [...new Set(allActivities.map((activity) => activity.activityDate))].sort(),
          skillXP: getSkillXPFromActivities(allActivities.slice(-2000), current.customQuests),
          recoveryDays: [],
          customCategories: [],
        }),
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
  else if (isLegacyAttributes(legacyAttributes)) save.attributes = upgradeAttributes(legacyAttributes);
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
